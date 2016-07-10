'use strict';
var AWS = require('aws-sdk')
var sqlparser = require('./sqlparser')

var BLANK = ["\t"," "]
var STR = ["\"","'","`"]
var KV_BLANK = [',']
var KV_STR = ["\"","'","`","{","}","[","]","(",")"]
var KW  = [
		"INSERT", "INTO", "SET",
		"UPDATE", "SET",  "WHERE", "AND",
		"REPLACE", "INTO", "SET",
		"SELECT",
		"DELETE"
	]
var OP = ["INSERT","UPDATE","SELECT","DELETE"]
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
	var $split_sql = sqlparser.split_sql($query, BLANK, STR )
	switch (sqlparser.query_type($query)) {
		case 'INSERT':
			var $parsed = sqlparser.split_insert($split_sql)
			//console.log($parsed)
			this.db.table($parsed.tableName).insert($parsed.KV, typeof cb === "function" ? cb : (typeof $replaces === "function" ? $replaces : function(err, cb ) { console.log(err,cb) })  )
			break
		case 'UPDATE':
			var $parsed = sqlparser.split_update($split_sql)
			var $db = this.db.table($parsed.tableName)
			Object.keys($parsed.WHERE).map(function(k) {
				$db.where(k).eq($parsed.WHERE[k])
			})
			$db.update($parsed.KV,
				typeof cb === "function" ? cb : (typeof $replaces === "function" ? $replaces : function(err, cb ) { console.log(err,cb) })
			)
			break;
		case 'QUERY':
			console.log( sqlparser.query_type($split_sql), " not supported")
			break;
		case 'DELETE':
			console.log( sqlparser.query_type($split_sql), " not supported")
			break;
		default:
			console.log("unknown query type ")
	}
}

DynamoSQL.prototype.prepare = function() {

}
DynamoSQL.prototype.execute = function() {

}


module.exports = function ( $config ) {
	return new DynamoSQL($config)
}
