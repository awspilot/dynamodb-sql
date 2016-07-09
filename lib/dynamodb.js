'use strict';
var AWS = require('aws-sdk')
var BLANK = ["\t"," "]
var STR = ["\"","'","`"]
var KV_BLANK = [',']
var KV_STR = ["\"","'","`","{","}","[","]"]
var KW  = [
		"INSERT", "INTO", "SET",
		"UPDATE",
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
	var $split_sql = split_sql($query, BLANK, STR )
	switch (query_type($query)) {
		case 'INSERT':
			var $parsed = split_insert($split_sql)
			//console.log($parsed)
			this.db.table($parsed.tableName).insert($parsed.KV, typeof cb === "function" ? cb : (typeof $replaces === "function" ? $replaces : function(err, cb ) { console.log(err,cb) })  )
			break
		case 'UPDATE':
			console.log( query_type($split_sql), " not supported")
			break;
		case 'QUERY':
			console.log( query_type($split_sql), " not supported")
			break;
		case 'DELETE':
			console.log( query_type($split_sql), " not supported")
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


function split_sql($query, BLANK, STR ) {
	var in_quotes = []
	var word_index = 0
	var splits = []
	for (var i = 0, len = $query.length; i < len; i++) {
		if (STR.indexOf($query[i]) !== -1) { // in quote or paranthesis
			// begin or end quote
			if (in_quotes.length && is_closing(in_quotes[in_quotes.length-1], $query[i] )) {
				// closing quote
				in_quotes.pop()
			} else {
				// opening quote
				in_quotes.push($query[i])
			}
		}
		if (!in_quotes.length && (BLANK.indexOf($query[i]) !== -1) ) {
			word_index++
		} else {
			splits[word_index] = (splits[word_index] || '') + $query[i]
		}
	}
	return splits
		.filter(function(v) { return (BLANK.indexOf(v) === -1) })
		.map(function(v) { return v.trim() } )
		.map(function(v) { return KW.indexOf(v.toUpperCase()) !== -1 ? v.toUpperCase() : v })
}
function split_insert($query) {
	var $parsed = {}
	var $q = JSON.parse(JSON.stringify($query))
	if ($q[0] !== 'INSERT')
		return false
	$q.shift()

	if ($q[0] !== 'INTO')
		return false
	$q.shift()

	$parsed.tableName = $q[0].replace(/^`(.+(?=`$))`$/, '$1')
	$q.shift()

	if ($q[0] !== 'SET')
		return false
	$q.shift()

	$parsed.raw_KV = $q.join(' ')
	$parsed.raw_K_V = split_sql($parsed.raw_KV, KV_BLANK, KV_STR )


	$parsed.KV = {}
	$parsed.raw_K_V.map(function(kv) {
		var kv = split_kv(kv)
		$parsed.KV[kv[0]] = kv[1]
	})

	return $parsed
}
function split_kv(kv) {
	var $k,$v
	$k = kv.split("=")[0]
	$v = kv.split("=",2)[1]
	return [unqoute_key($k),unquote_value($v)]
}
function unqoute_key(k) {
	return k.trim().replace(/^"(.+(?="$))"$/, '$1').replace(/^'(.+(?='$))'$/, '$1').replace(/^`(.+(?=`$))`$/, '$1')
}
function unquote_value(v) {
	var $v = JSON.parse(JSON.stringify(v)).trim()

	if ("\"" + $v.replace(/^"(.+(?="$))"$/, '$1') + "\"" === $v )
		return $v.replace(/^"(.+(?="$))"$/, '$1')

	if ("'" + $v.replace(/^'(.+(?='$))'$/, '$1') + "'" === $v )
		return $v.replace(/^'(.+(?='$))'$/, '$1')

	try {
		return eval("v = " + v)
	} catch (e) {
		//console.log(e)
	}
	return $v
}
function query_type($q) {
	if (typeof $q === "string")
		return OP.indexOf(split_sql($q, BLANK, STR )[0]) !== -1 ? split_sql($q, BLANK, STR )[0] : false

	return OP.indexOf($q[0]) !== -1 ? $q[0] : false

}
function is_closing($begin, $end) {

	switch ($begin) {
		case "\"":
		case "'":
		case "`":
			return $begin === $end
		case "{":
			return $end === "}"
		case "[":
			return $end === "]"
		case "(":
			return $end === ")"
		default:
			return false
	}

}
