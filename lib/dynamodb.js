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
		case 'SHOW_TABLES':
			var $parsed = {}
			this.db.client.listTables({}, function(err, data) {
				if (err)
					return $cb(err)

				return $cb(null, data)
			} )
			break
		case 'DESCRIBE_TABLE':
			var $parsed = {
				tableName: sqp.dynamodb.TableName,
			}
			this.db.client.describeTable({TableName: $parsed.tableName}, function(err, data) {
				if (err)
					return $cb(err)

				return $cb( null, data )
			} )
			break
		case 'DROP_TABLE':
			var $parsed = sqp.dynamodb
			this.db.client.deleteTable({TableName: $parsed.TableName}, function(err, data) {
				if (err)
					return $cb(err)

				return $cb( null, data )
			} )
			break
		case 'DROP_INDEX':
			var $parsed = sqp.dynamodb;

			this.db.client.updateTable($parsed, function(err, data) {
				if (err)
					return $cb(err)

				return $cb( null, data )
			} )
			break
		case 'INSERT':
			this.db.client.describeTable({ TableName: sqp.dynamodb.TableName }, function(err,data) {

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
			this.db.client.describeTable({ TableName: sqp.dynamodb.TableName }, function(err,data) {
				if (err)
					return typeof $cb !== "function" ? null : $cb.apply( $this, [ err, false ] )
				
				if (Object.keys(sqp.dynamodb.Expected).length !== Object.keys(data.Table.KeySchema).length)
					return $cb( new SyntaxException('[AWSPILOT] UPDATE .. WHERE must match the exact table schema ' + $query ) )

				for (var i in data.Table.KeySchema ) {
					if (! sqp.dynamodb.Expected.hasOwnProperty(data.Table.KeySchema[i].AttributeName))
						return $cb( new SyntaxException('[AWSPILOT] UPDATE .. WHERE must match the exact table schema' + $query ) )
				}
				
				$this.routeCall(sqp.operation, sqp.dynamodb ,true, function(err,data) {

					if (err)
						return typeof $cb !== "function" ? null : $cb.apply( $this, [ err, false ] )
				
					typeof $cb !== "function" ? null : $cb.apply( $this, [ err, util.normalizeItem(data.Attributes || {}), data ])
				})
			})
			break;
		case 'REPLACE':
			var $parsed = {
				TableName: sqp.dynamodb.TableName,
				KV: sqp.dynamodb.set,
			}
			var $db = this.db.table($parsed.TableName)
			$db.insert_or_replace($parsed.KV, $cb)
			break;
		case 'DELETE':
			var $parsed = {
				tableName: sqp.dynamodb.TableName,
				WHERE: sqp.dynamodb.where,
			}
			var $db = this.db.table($parsed.tableName)
			$db.return(this.db.ALL_OLD)
			$parsed.WHERE.map(function(w) {
				$db.where(w.k).eq(w.v)
			})
			$db.delete( $cb )
			break
		case 'SELECT':


			if (sqp.dynamodb.from.length > 1)
				return $cb( new SyntaxException('[AWSPILOT] Select from multiple tables not supported') )

			var $parsed = {
				tableName: sqp.dynamodb.from[0].table,
				WHERE: {},
				FIELDS: null,
				FILTER: {},
				CONSISTENT_READ: false,
			}

			if (!sqp.dynamodb.where)
				return $cb( new SyntaxException('[AWSPILOT] Expected WHERE in SELECT, Please use SCAN statement instead') )

			if ( sqp.dynamodb.index )
				$parsed.indexName = sqp.dynamodb.index

			var w = sqp.dynamodb.where



			switch (w.op) {
				case '=':
					// WHERE a = 'a'
					if (!w.left.column)
						return $cb( new SyntaxException('[AWSPILOT] Left side assignment in WHERE needs to be a column') )

					$parsed.WHERE[ w.left.column ] = {
						op: w.op,
						value: extract_value(w.right),
					}
					break;
				case 'AND':
					// WHERE a = 'a' and b OP 'b'

					// at least one of left.op or right.op must be '=' because hash requires =
					if ([w.left.op, w.right.op].indexOf('=') === -1 )
						return $cb( new SyntaxException('[AWSPILOT] Expected at least one of operators in WHERE to be \'=\' ') )

					var and1 = w.left.op === '=' ? w.left : w.right
					$parsed.WHERE[ and1.left.column ] = {
						op: and1.op,
						value: extract_value(and1.right),
					}


					var and2 = w.left.op === '=' ? w.right : w.left
					switch ( and2.op ) {
			 			case '=':
						case '>':
						case '>=':
						case '<':
						case '<=':

							$parsed.WHERE[ and2.left.column ] = {
								op: and2.op,
								value: extract_value(and2.right),
							}
							break;
						case 'BETWEEN':

							$parsed.WHERE[ and2.left.column ] = {
								op: 'between',
								value: [
									extract_value(and2.right.left),
									extract_value(and2.right.right)
								]
							}
							break;
						case 'LIKE':
							if (and2.right.type !== 'string')
								return $cb( new SyntaxException( "[AWSPILOT] Unsupported LIKE, must use LIKE 'text' " ) )

							if (eval(and2.right.string).substr(-1) !== '%')
								return $cb( new SyntaxException( "[AWSPILOT] Unsupported LIKE 'text', text must end in % " ) )

							$parsed.WHERE[ and2.left.column ] = {
								op: 'begins_with',
								value: eval(and2.right.string).slice(0,-1),
							}
							break;
						default:
							return $cb( new SyntaxException( "[AWSPILOT] Unexpected operation for key ( " + and2.left.column + " ) in WHERE, expected one of =, >, >=, <, <=, BETWEEN, LIKE  " ) )
					}
					break;
				case '>':
				case '>=':
				case '<':
				case '<=':
				case '!=':
				case 'like':
					return $cb( new SyntaxException( "[AWSPILOT] Expected '$KEY = ' in WHERE, found '" + w.left.column + " " + w.op + " '  instead " ) )
					break;
				case 'or':
					return $cb( new SyntaxException( "[AWSPILOT] 'OR' not supported in WHERE, use HAVING to filter results" ) )
				default:
					return $cb( new SyntaxException( '[AWSPILOT] Unhandled operation ' + w.op ) ) // there is only one op and is not '='
			}

			if ( sqp.dynamodb.limit )
				$parsed.LIMIT = parseInt(sqp.dynamodb.limit)

			if ( sqp.dynamodb.sort === 'DESC' )
				$parsed.DESC = true

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


			if (sqp.dynamodb.consistent_read === true)
				$parsed.CONSISTENT_READ = true


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









			var $db = this.db.table($parsed.tableName)
			if ($parsed.hasOwnProperty('indexName'))
				$db.index($parsed.indexName)

			Object.keys($parsed.WHERE).map(function(k) {
				switch ($parsed.WHERE[k].op) {
					case '=' : $db.where(k).eq($parsed.WHERE[k].value); break;
					case '>' : $db.where(k).gt($parsed.WHERE[k].value); break;
					case '<' : $db.where(k).lt($parsed.WHERE[k].value); break;
					case '>=': $db.where(k).ge($parsed.WHERE[k].value); break;
					case '<=': $db.where(k).le($parsed.WHERE[k].value); break;
					
					case 'begins_with' : $db.where(k).begins_with($parsed.WHERE[k].value); break;
					case 'between': $db.where(k).between($parsed.WHERE[k].value[0],$parsed.WHERE[k].value[1]); break;
				}
			})
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
			if ($parsed.hasOwnProperty('DESC') && $parsed.DESC )
				$db.descending()

			if ($parsed.hasOwnProperty('LIMIT'))
				$db.limit($parsed.LIMIT)

			if ( $parsed.CONSISTENT_READ === true )
				$db.consistent_read()

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


			var $parsed = {
				TableName: sqp.dynamodb.TableName,
				FIELDS: null,
				FILTER: {},
				CONSISTENT_READ: false,
			}
			if ( sqp.dynamodb.index )
				$parsed.indexName = sqp.dynamodb.index

			if ( sqp.dynamodb.limit )
				$parsed.LIMIT = parseInt(sqp.dynamodb.limit)

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

			if (sqp.dynamodb.consistent_read === true)
				$parsed.CONSISTENT_READ = true

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

			var $db = this.db.table($parsed.TableName)

			if ($parsed.hasOwnProperty('indexName'))
				$db.index($parsed.indexName)

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

			if ($parsed.hasOwnProperty('DESC') && $parsed.DESC )
				$db.descending()

			if ($parsed.hasOwnProperty('LIMIT'))
				$db.limit($parsed.LIMIT)

			if ( $parsed.CONSISTENT_READ === true )
				$db.consistent_read()

			//this.db.on('beforeRequest', function(op, payload) {
			//	console.log(op, JSON.stringify(payload,null,"\t"))
			//})

			$db.scan( $cb )
			break

		case 'CREATE_TABLE':
			var $parsed = {
				TableName: sqp.dynamodb.TableName,
				KeySchema: sqp.dynamodb.KeySchema,
				AttributeDefinitions: sqp.dynamodb.AttributeDefinitions,
				LocalSecondaryIndexes: sqp.dynamodb.LocalSecondaryIndexes,
				GlobalSecondaryIndexes: sqp.dynamodb.GlobalSecondaryIndexes,
				ProvisionedThroughput: sqp.dynamodb.ProvisionedThroughput,
			}
			this.db.client.createTable($parsed, $cb )
			break;
		default:
			return cb({
				errorCode: 'UNKNOWN_QUERY_TYPE'
			})
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
