'use strict';
var AWS = require('aws-sdk')
var sqlparser = require('./sqlparser')


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

DynamoSQL.prototype.query = function($query, $replaces, cb ) {
	var $cb = typeof cb === "function" ? cb : (typeof $replaces === "function" ? $replaces : function(err, data ) { console.log( err, data ) })
	try {
		var $parsed = sqlparser.parse(sqlparser.cleanup_sql($query),$replaces)
	} catch(e){
		return $cb(e)
	}

	switch ($parsed.type) {
		case 'SHOW_TABLES':
			this.db.client.listTables({}, function(err, data) {
				if (err)
					return $cb(err)

				return $cb(null, data)
			} )
			break
		case 'DESCRIBE_TABLE':
			this.db.client.describeTable({TableName: $parsed.o.tableName}, function(err, data) {
				if (err)
					return $cb(err)

				return $cb( null, data )
			} )
			break
		case 'DROP_TABLE':
			this.db.client.deleteTable({TableName: $parsed.o.tableName}, function(err, data) {
				if (err)
					return $cb(err)

				return $cb( null, data )
			} )
			break
		case 'DROP_INDEX':
			this.db.client.updateTable($parsed.o, function(err, data) {
				if (err)
					return $cb(err)

				return $cb( null, data )
			} )
			break
		case 'INSERT':
			this.db.table($parsed.o.tableName).insert( $parsed.o.KV, $cb )
			break
		case 'UPDATE':
			var $db = this.db.table($parsed.o.tableName)
			Object.keys($parsed.o.WHERE).map(function(k) {
				$db.where(k).eq($parsed.o.WHERE[k])
			})
			var $update = {}
			var $this = this
			Object.keys($parsed.o.K_V_OP).map(function(k) {
				if ($parsed.o.K_V_OP[k].op === '=')
					$update[k] = $parsed.o.K_V_OP[k].v

				if ($parsed.o.K_V_OP[k].op === '+=')
					$update[k] = $this.db.add( $parsed.o.K_V_OP[k].v )
			})
			$db.update($update, $cb)
			break;
		case 'REPLACE':
			var $db = this.db.table($parsed.o.tableName)
			//Object.keys($parsed.WHERE).map(function(k) {
			//	$db.if(k).eq($parsed.WHERE[k])
			//	$parsed.KV[k]=$parsed.WHERE[k]
			//})
			$db.insert_or_replace($parsed.o.KV, $cb)
			break;
		case 'DELETE':
			var $db = this.db.table($parsed.o.tableName)
			$db.return(this.db.ALL_OLD)
			Object.keys($parsed.o.WHERE).map(function(k) {
				$db.where(k).eq($parsed.o.WHERE[k])
			})
			$db.delete( $cb )
			break
		case 'SELECT':
			var $db = this.db.table($parsed.o.tableName)
			if ($parsed.o.hasOwnProperty('indexName'))
				$db.index($parsed.o.indexName)

			Object.keys($parsed.o.WHERE).map(function(k) {
				switch ($parsed.o.WHERE[k].op) {
					case '=' : $db.where(k).eq($parsed.o.WHERE[k].value); break;
					case '>' : $db.where(k).gt($parsed.o.WHERE[k].value); break;
					case '<' : $db.where(k).lt($parsed.o.WHERE[k].value); break;
					case '>=': $db.where(k).ge($parsed.o.WHERE[k].value); break;
					case '<=': $db.where(k).le($parsed.o.WHERE[k].value); break;
					
					case 'begins_with' : $db.where(k).begins_with($parsed.o.WHERE[k].value); break;
					case 'between': $db.where(k).between($parsed.o.WHERE[k].value[0],$parsed.o.WHERE[k].value[1]); break;
				}
			})
			if ($parsed.o.hasOwnProperty('FILTER')) {
				
				Object.keys($parsed.o.FILTER).map(function(k) {
					switch ($parsed.o.FILTER[k].op) {
						case '=' : $db.filter(k).eq($parsed.o.FILTER[k].value); break;
						case '>' : $db.filter(k).gt($parsed.o.FILTER[k].value); break;
						case '<' : $db.filter(k).lt($parsed.o.FILTER[k].value); break;
						case '>=': $db.filter(k).ge($parsed.o.FILTER[k].value); break;
						case '<=': $db.filter(k).le($parsed.o.FILTER[k].value); break;

						case 'begins_with' : $db.filter(k).begins_with($parsed.o.FILTER[k].value); break;
						case 'between':      $db.filter(k).between($parsed.o.FILTER[k].value[0],$parsed.o.FILTER[k].value[1]); break;
						case 'contains' :    $db.filter(k).contains($parsed.o.FILTER[k].value); break;
					}
				})
			}
			if ($parsed.o.hasOwnProperty('DESC') && $parsed.o.DESC )
				$db.descending()

			if ($parsed.o.hasOwnProperty('LIMIT'))
				$db.limit($parsed.o.LIMIT)

			if ( $parsed.o.CONSISTENT_READ === true )
				$db.consistent_read()

			if ($parsed.o.FIELDS !== null ) {
				$parsed.o.FIELDS.map(function(f) {
					$db.addSelect(f)
				})
			}

			//this.db.on('beforeRequest', function(op, payload) {
			//	console.log(op, JSON.stringify(payload,null,"\t"))
			//})

			$db.query( $cb )
			break

		case 'SCAN':
			//console.log($parsed)
			var $db = this.db.table($parsed.o.tableName)

			if ($parsed.o.raw_SCAN !== '*') {
				var fields = []
				try {
					fields = sqlparser.split_select($parsed.o.raw_SCAN )
					delete $parsed.o.raw_SCAN
				} catch (e) {
				}
				
				fields.map(function(f) {
					$db.addSelect(f)
				})
			}
			
			if ($parsed.o.hasOwnProperty('indexName'))
				$db.index($parsed.o.indexName)

			if ($parsed.hasOwnProperty('FILTER')) {
				Object.keys($parsed.o.FILTER).map(function(k) {
					switch ($parsed.o.FILTER[k].op) {
						case '=' : $db.filter(k).eq($parsed.o.FILTER[k].value); break;
						case '>' : $db.filter(k).gt($parsed.o.FILTER[k].value); break;
						case '<' : $db.filter(k).lt($parsed.o.FILTER[k].value); break;
						case '>=': $db.filter(k).ge($parsed.o.FILTER[k].value); break;
						case '<=': $db.filter(k).le($parsed.o.FILTER[k].value); break;
						case '^' : $db.filter(k).begins_with($parsed.o.FILTER[k].value); break;
						case '><': $db.filter(k).between($parsed.o.FILTER[k].value[0],$parsed.o.FILTER[k].value[1]); break;
					}
				})
			}
			if ($parsed.o.hasOwnProperty('DESC') && $parsed.o.DESC )
				$db.descending()

			if ($parsed.o.hasOwnProperty('LIMIT'))
				$db.limit($parsed.o.LIMIT)

			if ($parsed.o.hasOwnProperty('CONSISTENT_READ'))
				$db.consistent_read()

			//this.db.on('beforeRequest', function(op, payload) {
			//	console.log(op, JSON.stringify(payload,null,"\t"))
			//})

			$db.scan( $cb )
			break

		case 'CREATE':
			this.db.client.createTable($parsed.o, $cb )
			break;
		default:
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
