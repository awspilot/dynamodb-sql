'use strict';

var Promise = require('promise')
var util = require('@awspilot/dynamodb-util')
var AWS = require('aws-sdk')


var dynamo_parser = require('./parser.min.js');

dynamo_parser.parser.yy.extend = function (a,b){
	if(typeof a == 'undefined') a = {};
	for(var key in b) {
		if(b.hasOwnProperty(key)) {
			a[key] = b[key]
		}
	}
	return a;
}

var extract_value = function(v) {
	return (
		v.type === 'string' ?
		eval(v.string)
		:
		(
			v.type === 'number' ?
			parseInt(v.number)
			:
			v.type === 'boolean' ?
				v.value
				:
				undefined // unhandled
		)
	)
}


function SyntaxException(message){
	this.message = 'You have an error in your SQL syntax: ' + message;
	this.code = 'syntax_error'
}





function DynamoSQL ( $config ) {
	this.events = {
		error: function() {},
		beforeRequest: function() {}
	}
	if ($config instanceof AWS.DynamoDB) {
		this.client = $config
	} else {
		if ($config)
			this.client = new AWS.DynamoDB($config)
		else
			this.client = new AWS.DynamoDB()
	}
	this.db = require('@awspilot/dynamodb')(this.client)
}

DynamoSQL.prototype.routeCall = function(method, params, reset ,callback ) {
	var $this = this

	//this.events.beforeRequest.apply( this, [ method, params ])
	if (global.DDBSQL === true )
		console.log(method, JSON.stringify(params, null, "\t"))


	this.client[method]( params, function( err, data ) {

		//if (err)
		//	$this.events.error.apply( $this, [ method, err , params ] )

		if ((data || {}).hasOwnProperty('ConsumedCapacity') )
			$this.ConsumedCapacity = data.ConsumedCapacity

		//if ( reset === true )
		//	$this.reset()

		callback.apply( $this, [ err, data ] )
	})
}

DynamoSQL.prototype.query = function($query, $replaces, cb ) {
	var $this = this
	var $cb = typeof cb === "function" ? cb : (typeof $replaces === "function" ? $replaces : function(err, data ) { console.log( err, data ) })
	var sqp
	try {
		sqp = dynamo_parser.parse( $query );
	} catch(e){
		return $cb(e)
	}

	if (sqp.length > 1)
		return $cb( new SyntaxException('[AWSPILOT] Multiple queries not supported, yet!') )

	sqp = sqp[0];



	switch (sqp.statement) {
		case 'CREATE_TABLE':
		case 'SHOW_TABLES':
		case 'DESCRIBE_TABLE':
		case 'DROP_TABLE':
		case 'DROP_INDEX':
		case 'BATCHINSERT':
			$this.routeCall(sqp.operation, sqp.dynamodb ,true, function(err,data) {

				if (err)
					return typeof $cb !== "function" ? null : $cb.apply( $this, [ err, false ] )
			
				typeof $cb !== "function" ? null : $cb.apply( $this, [ err, data ])
			})
			break;


		case 'REPLACE':
		case 'DELETE':
			$this.routeCall(sqp.operation, sqp.dynamodb ,true, function(err,data) {

				if (err)
					return typeof $cb !== "function" ? null : $cb.apply( $this, [ err, false ] )
			
				typeof $cb !== "function" ? null : $cb.apply( $this, [ err, util.normalizeItem(data.Attributes || {}), data ])
			})

			break;


		case 'INSERT':
			this.query('DESCRIBE TABLE ' + sqp.dynamodb.TableName, function(err,data) {

				if (err)
					return typeof $cb !== "function" ? null : $cb.apply( $this, [ err, false ] )

				sqp.dynamodb.Expected = {}
				for (var i in data.Table.KeySchema ) {
					sqp.dynamodb.Expected[ data.Table.KeySchema[i].AttributeName] = { Exists: false }
				}

				$this.routeCall(sqp.operation, sqp.dynamodb ,true, function(err,data) {
					if (  (sqp.ignore === true ) && ((err || {}).code === 'ConditionalCheckFailedException')  )
						return typeof $cb !== "function" ? null : $cb.apply( $this, [ null, undefined ] )

					if (err)
						return typeof $cb !== "function" ? null : $cb.apply( $this, [ err, false ] )
				
					typeof $cb !== "function" ? null : $cb.apply( $this, [ err, util.normalizeItem(data.Attributes || {}), data ])
				})
			})
			break
			
		case 'UPDATE':
			// unfortunately we still need to read table schema to ensure Expected contains the right keys 
			this.query('DESCRIBE TABLE ' + sqp.dynamodb.TableName, function(err,data) {

				if (err)
					return typeof $cb !== "function" ? null : $cb.apply( $this, [ err, false ] )
				
				if (Object.keys(sqp.dynamodb.Expected).length !== Object.keys(data.Table.KeySchema).length)
					return $cb( new SyntaxException('[AWSPILOT] UPDATE .. WHERE must match the exact table schema ' ) )

				for (var i in data.Table.KeySchema ) {
					if (! sqp.dynamodb.Expected.hasOwnProperty(data.Table.KeySchema[i].AttributeName))
						return $cb( new SyntaxException('[AWSPILOT] UPDATE .. WHERE must match the exact table schema' ) )
				}
				
				$this.routeCall(sqp.operation, sqp.dynamodb ,true, function(err,data) {

					if (err)
						return typeof $cb !== "function" ? null : $cb.apply( $this, [ err, false ] )
				
					typeof $cb !== "function" ? null : $cb.apply( $this, [ err, util.normalizeItem(data.Attributes || {}), data ])
				})
			})
			break;

		case 'SELECT':

			//console.log("QUERY", JSON.stringify(sqp.dynamodb, null, "\t"))

			var $parsed = {
				//WHERE: {},
				FIELDS: null,
				FILTER: {},
			}


			var $db = this.db.table(sqp.dynamodb.TableName)
			$db.RawIndexName(sqp.dynamodb.IndexName)
			$db.RawKeyConditionExpression(sqp.dynamodb.KeyConditionExpression)
			$db.RawExpressionAttributeNames(sqp.dynamodb.ExpressionAttributeNames)
			$db.RawExpressionAttributeValues(sqp.dynamodb.ExpressionAttributeValues)


			// there is always at least 1 element, the *
			// make sure we dont have no SELECT *, field
			if (sqp.dynamodb.columns.length > 1 ) {
				
				if (sqp.dynamodb.columns.map(function(c) { return c.type }).indexOf('star') !== -1)
					return $cb( new SyntaxException(  "[AWSPILOT] you can not have both * and column names in SELECT" ) )
			}
			sqp.dynamodb.columns = sqp.dynamodb.columns.filter(function(c) { return c.type !== 'star'})

			if (sqp.dynamodb.columns.filter(function(c) { return c.hasOwnProperty('alias') }).length)
				return $cb( new SyntaxException(  "[AWSPILOT] 'SELECT field AS alias' not supported, yet!" ) )


			// after removing *, handle remaining fields
			if (sqp.dynamodb.columns.length) {
				$parsed.FIELDS = sqp.dynamodb.columns.map(function(c) { 
					return c.column 
				})
			}

			// FILTER
			if (sqp.dynamodb.having) {
				var h = sqp.dynamodb.having
				switch (h.op) {
					case 'LIKE':
						if (h.right.type !== 'string')
							return $cb( new SyntaxException( "[AWSPILOT] Unsupported LIKE, must use LIKE 'text' " ) )

						if (eval(h.right.string).substr(-1) !== '%')
							return $cb( new SyntaxException( "[AWSPILOT] Unsupported LIKE 'text', text must end in % " ) )

						$parsed.FILTER[ h.left.column ] = {
							op: 'begins_with',
							value: eval(h.right.string).slice(0,-1),
						}
						break;
					case 'CONTAINS':
						
						//if (h.right.type !== 'string')
						//	throw "[AWSPILOT] Unsupported LIKE, must use LIKE 'text' "

						$parsed.FILTER[ h.left.column ] = {
							op: 'contains',
							value: extract_value(h.right),
						}
						break;
					case 'BETWEEN':

						$parsed.FILTER[ h.left.column ] = {
							op: 'between',
							value: [
								extract_value(h.right.left),
								extract_value(h.right.right)
							]
						}
						break;

					case '=':
					case '>':
					case '>=':
					case '<':
					case '<=':
					case '!=':

					
						if (!h.left.column)
							return $cb(  new SyntaxException('[AWSPILOT] Left side assignment in HAVING needs to be a column') )

						$parsed.FILTER[ h.left.column ] = {
							op: h.op,
							value: extract_value(h.right)
						}
						break;
					case 'OR':
						return $cb( new SyntaxException( "[AWSPILOT] 'OR' not supported in HAVING, yet!" ) )
						break;
					
					case 'AND':
						return $cb( new SyntaxException( "[AWSPILOT] 'AND' not supported in HAVING, yet!" ) )
						break;

					default:
						return $cb( new SyntaxException( '[AWSPILOT] Unhandled operation ' + w.op ) )// there is only one op and is not '='
					
				}

			}

			
			if (global.DDBSQL === true )
				console.log("[AWSPILOT] parsed=", JSON.stringify($parsed,null,"\t"))



			if ($parsed.hasOwnProperty('FILTER')) {
				
				Object.keys($parsed.FILTER).map(function(k) {
					switch ($parsed.FILTER[k].op) {
						case '=' : $db.filter(k).eq($parsed.FILTER[k].value); break;
						case '>' : $db.filter(k).gt($parsed.FILTER[k].value); break;
						case '<' : $db.filter(k).lt($parsed.FILTER[k].value); break;
						case '>=': $db.filter(k).ge($parsed.FILTER[k].value); break;
						case '<=': $db.filter(k).le($parsed.FILTER[k].value); break;

						case 'begins_with' : $db.filter(k).begins_with($parsed.FILTER[k].value); break;
						case 'between':      $db.filter(k).between($parsed.FILTER[k].value[0],$parsed.FILTER[k].value[1]); break;
						case 'contains' :    $db.filter(k).contains($parsed.FILTER[k].value); break;
					}
				})
			}

			$db.RawScanIndexForward(sqp.dynamodb.ScanIndexForward)
			$db.RawLimit(sqp.dynamodb.Limit)
			$db.RawConsistentRead(sqp.dynamodb.ConsistentRead)


			if ($parsed.FIELDS !== null ) {
				$parsed.FIELDS.map(function(f) {
					$db.addSelect(f)
				})
			}

			//this.db.on('beforeRequest', function(op, payload) {
			//	console.log(op, JSON.stringify(payload,null,"\t"))
			//})

			$db.query( $cb )
			break

		case 'SCAN':

			//console.log("SCAN", JSON.stringify(sqp.dynamodb, null, "\t"))

			var $parsed = {
				FIELDS: null,
				FILTER: {},
			}

			// there is always at least 1 element, the *
			// make sure we dont have no SELECT *, field

			if (sqp.dynamodb.columns.length > 1 ) {
				if (sqp.dynamodb.columns.map(function(c) { return c.type }).indexOf('star') !== -1)
					return $cb(  new SyntaxException( "[AWSPILOT] you can not have both * and column names in SCAN" ) )
			}

			sqp.dynamodb.columns = sqp.dynamodb.columns.filter(function(c) { return c.type !== 'star'})

			if (sqp.dynamodb.columns.filter(function(c) { return c.hasOwnProperty('alias') }).length)
				return $cb(  new SyntaxException( "[AWSPILOT] 'SCAN field AS alias' not supported, yet!" ) )

			// after removing *, handle remaining fields
			if (sqp.dynamodb.columns.length) {
				$parsed.FIELDS = sqp.dynamodb.columns.map(function(c) { 
					return c.column 
				})
			}

			// FILTER
			if (sqp.dynamodb.having) {
				var h = sqp.dynamodb.having
				switch (h.op) {
					case 'LIKE':
						if (h.right.type !== 'string')
							return $cb(  new SyntaxException( "[AWSPILOT] Unsupported LIKE, must use LIKE 'text' " ) )

						if (eval(h.right.string).substr(-1) !== '%')
							return $cb(  new SyntaxException( "[AWSPILOT] Unsupported LIKE 'text', text must end in % " ) )

						$parsed.FILTER[ h.left.column ] = {
							op: 'begins_with',
							value: eval(h.right.string).slice(0,-1),
						}
						break;
					case 'CONTAINS':
						
						//if (h.right.type !== 'string')
						//	throw "[AWSPILOT] Unsupported LIKE, must use LIKE 'text' "

						$parsed.FILTER[ h.left.column ] = {
							op: 'contains',
							value: extract_value(h.right),
						}
						break;
					case 'BETWEEN':

						$parsed.FILTER[ h.left.column ] = {
							op: 'between',
							value: [
								extract_value(h.right.left),
								extract_value(h.right.right)
							]
						}
						break;

					case '=':
					case '>':
					case '>=':
					case '<':
					case '<=':
					case '!=':

					
						if (!h.left.column)
							return $cb( new SyntaxException('[AWSPILOT] Left side assignment in HAVING needs to be a column') )

						$parsed.FILTER[ h.left.column ] = {
							op: h.op,
							value: extract_value(h.right)
						}
						break;
					case 'OR':
						return $cb(  new SyntaxException( "[AWSPILOT] 'OR' not supported in HAVING, yet!" ) )
						break;
					
					case 'AND':
						return $cb(  new SyntaxException( "[AWSPILOT] 'AND' not supported in HAVING, yet!" ) )
						break;

					default:
						return $cb(  new SyntaxException( '[AWSPILOT] Unhandled operation ' + w.op ) ) // there is only one op and is not '='
					
				}

			}

			
			if (global.DDBSQL === true )
				console.log("[AWSPILOT] parsed=", JSON.stringify($parsed,null,"\t"))

			var $db = this.db.table(sqp.dynamodb.TableName)


			$db.RawIndexName(sqp.dynamodb.IndexName)

			if ($parsed.FIELDS !== null ) {
				$parsed.FIELDS.map(function(f) {
					$db.addSelect(f)
				})
			}
			


			if ($parsed.hasOwnProperty('FILTER')) {
				
				Object.keys($parsed.FILTER).map(function(k) {
					switch ($parsed.FILTER[k].op) {
						case '=' : $db.filter(k).eq($parsed.FILTER[k].value); break;
						case '>' : $db.filter(k).gt($parsed.FILTER[k].value); break;
						case '<' : $db.filter(k).lt($parsed.FILTER[k].value); break;
						case '>=': $db.filter(k).ge($parsed.FILTER[k].value); break;
						case '<=': $db.filter(k).le($parsed.FILTER[k].value); break;

						case 'begins_with' : $db.filter(k).begins_with($parsed.FILTER[k].value); break;
						case 'between':      $db.filter(k).between($parsed.FILTER[k].value[0],$parsed.FILTER[k].value[1]); break;
						case 'contains' :    $db.filter(k).contains($parsed.FILTER[k].value); break;
					}
				})
			}

			$db.RawLimit(sqp.dynamodb.Limit)
			$db.RawConsistentRead(sqp.dynamodb.ConsistentRead)


			//this.db.on('beforeRequest', function(op, payload) {
			//	console.log(op, JSON.stringify(payload,null,"\t"))
			//})

			$db.scan( $cb )
			break


		default:
			if ($cb)
				return $cb({ errorCode: 'UNSUPPORTED_QUERY_TYPE ' +  sqp.statement })

			break;
	}
}

DynamoSQL.prototype.prepare = function() {

}
DynamoSQL.prototype.execute = function() {

}


module.exports = function ( $config ) {
	return new DynamoSQL($config)
}
