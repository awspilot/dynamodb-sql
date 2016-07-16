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
			$db.update($parsed.KV, $cb)
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
			Object.keys($parsed.WHERE).map(function(k) {
				switch ($parsed.WHERE[k].op) {
					case '=' : $db.where(k).eq($parsed.WHERE[k].value); break;
					case '>' : $db.where(k).gt($parsed.WHERE[k].value); break;
					case '<' : $db.where(k).lt($parsed.WHERE[k].value); break;
					case '>=': $db.where(k).ge($parsed.WHERE[k].value); break;
					case '<=': $db.where(k).le($parsed.WHERE[k].value); break;
				}
			})
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
