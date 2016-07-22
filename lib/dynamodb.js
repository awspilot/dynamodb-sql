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
	this.db = require('aws-dynamodb')(this.client)
}

DynamoSQL.prototype.query = function($query, $replaces, cb ) {
	var $cb = typeof cb === "function" ? cb : (typeof $replaces === "function" ? $replaces : function(err, data ) { console.log( err, data ) })
	try {
		var $parsed = sqlparser.parse($query,$replaces)
	} catch(e){
		return $cb(e)
	}

	switch ($parsed.type) {
		case 'INSERT':
			this.db.table($parsed.tableName).insert( $parsed.KV, $cb )
			break
		case 'UPDATE':
			var $db = this.db.table($parsed.tableName)
			Object.keys($parsed.WHERE).map(function(k) {
				$db.where(k).eq($parsed.WHERE[k])
			})
			var $update = {}
			var $this = this
			Object.keys($parsed.K_V_OP).map(function(k) {
				if ($parsed.K_V_OP[k].op === '=')
					$update[k] = $parsed.K_V_OP[k].v

				if ($parsed.K_V_OP[k].op === '+=')
					$update[k] = $this.db.add( $parsed.K_V_OP[k].v )
			})
			$db.update($update, $cb)
			break;
		case 'REPLACE':
			var $db = this.db.table($parsed.tableName)
			//Object.keys($parsed.WHERE).map(function(k) {
			//	$db.if(k).eq($parsed.WHERE[k])
			//	$parsed.KV[k]=$parsed.WHERE[k]
			//})
			$db.insert_or_replace($parsed.KV, $cb)
			break;
		case 'DELETE':
			var $db = this.db.table($parsed.tableName)
			$db.return(this.db.ALL_OLD)
			Object.keys($parsed.WHERE).map(function(k) {
				$db.where(k).eq($parsed.WHERE[k])
			})
			$db.delete( $cb )
			break
		case 'SELECT':
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
					case '^' : $db.where(k).begins_with($parsed.WHERE[k].value); break;
					case '><': $db.where(k).between($parsed.WHERE[k].value[0],$parsed.WHERE[k].value[1]); break;
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
						case '^' : $db.filter(k).begins_with($parsed.FILTER[k].value); break;
						case '><': $db.filter(k).between($parsed.FILTER[k].value[0],$parsed.FILTER[k].value[1]); break;
					}
				})
			}
			if ($parsed.hasOwnProperty('DESC') && $parsed.DESC )
				$db.descending()

			if ($parsed.hasOwnProperty('LIMIT'))
				$db.limit($parsed.LIMIT)

			if ($parsed.hasOwnProperty('CONSISTENT_READ'))
				$db.consistent_read()

			//this.db.on('beforeRequest', function(op, payload) {
			//	console.log(op, JSON.stringify(payload,null,"\t"))
			//})

			$db.query( $cb )
			break
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
