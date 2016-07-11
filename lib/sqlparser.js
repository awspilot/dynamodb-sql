'use strict';
var SqlParser = {}

var BLANK = ["\t"," ","\n","\r"]
var STR = ["\"","'","`"]
var KV_BLANK = [',']
var KV_STR = ["\"","'","`","{","}","[","]","(",")"]
var KW  = [
		"INSERT", "INTO", "SET",
		"UPDATE", "SET",  "WHERE", "AND",
		"REPLACE", "INTO", "SET",
		"SELECT",
		"DELETE","FROM","WHERE",
		"CREATE","TABLE"
	]
var OP = ["INSERT","UPDATE","REPLACE","SELECT","DELETE"]

function SyntaxException(message){
	this.message = 'You have an error in your SQL syntax: ' + message;
	this.code = 'syntax_error'
}

SqlParser.parse = function( $query, $replaces ) {
	var $split_sql = SqlParser.split_sql($query, BLANK, STR )
	var $query_type = SqlParser.query_type($query)
	switch ($query_type) {
		case 'INSERT':
			var $parsed = SqlParser.split_insert($split_sql)
			break
		case 'UPDATE':
			var $parsed = SqlParser.split_update($split_sql)
			break;
		case 'REPLACE':
			var $parsed = SqlParser.split_replace($split_sql)
			break;
		case 'SELECT':
		case 'DELETE':
		default:
			throw new SyntaxException("unsupported query type " + $split_sql[0])
	}
	$parsed.type = $query_type
	return $parsed

}
SqlParser.split_sql = function($query, BLANK, STR ) {
	var in_quotes = []
	var word_index = 0
	var splits = []
	for (var i = 0, len = $query.length; i < len; i++) {
		if (STR.indexOf($query[i]) !== -1) { // in quote or paranthesis
			// begin or end quote
			if (in_quotes.length && SqlParser.is_closing(in_quotes[in_quotes.length-1], $query[i] )) {
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

SqlParser.split_insert = function($query) {
	var $parsed = {}
	var $q = JSON.parse(JSON.stringify($query))
	if ($q[0] !== 'INSERT')
		throw new SyntaxException("expected INSERT found " + $q[0])
	$q.shift()

	if ($q[0] !== 'INTO')
		throw new SyntaxException("expected INTO found " + $q[0])
	$q.shift()

	$parsed.tableName = $q[0].replace(/^`(.+(?=`$))`$/, '$1')
	$q.shift()

	if ($q[0] !== 'SET')
		throw new SyntaxException("expected SET found " + $q[0])
	$q.shift()

	$parsed.raw_KV = $q.join(' ')
	$parsed.raw_K_V = SqlParser.split_sql($parsed.raw_KV, KV_BLANK, KV_STR )


	$parsed.KV = {}
	$parsed.raw_K_V.map(function(kv) {
		var kv = SqlParser.split_kv(kv)
		$parsed.KV[kv[0]] = kv[1]
	})
	delete $parsed.raw_KV
	delete $parsed.raw_K_V
	return $parsed
}


SqlParser.split_update = function($query) {
	var $parsed = {}
	var $q = JSON.parse(JSON.stringify($query))
	if ($q[0] !== 'UPDATE')
		throw new SyntaxException("expected UPDATE found " + $q[0])
	$q.shift()

	$parsed.tableName = $q[0].replace(/^`(.+(?=`$))`$/, '$1')
	$q.shift()

	if ($q[0] !== 'SET')
		throw new SyntaxException("expected SET found " + $q[0])
	$q.shift()

	if ($q.indexOf('WHERE') === -1 )
		throw new SyntaxException("expected WHERE")

	$parsed.raw_KV = $q.slice(0, $q.indexOf('WHERE') ).join(' ')
	$parsed.raw_K_V = SqlParser.split_sql($parsed.raw_KV, KV_BLANK, KV_STR )
	$parsed.KV = {}
	$parsed.raw_K_V.map(function(kv) {
		var kv = SqlParser.split_kv(kv)
		$parsed.KV[kv[0]] = kv[1]
	})

	delete $parsed.raw_KV
	delete $parsed.raw_K_V

	$parsed.raw_WHERE = $q.slice($q.indexOf('WHERE')+1).join(' ')
	$parsed.raw_WHERE_KV = [[]]
	SqlParser.split_sql($parsed.raw_WHERE, BLANK, KV_STR ).map(function(v) {
		if (v === 'AND')
			$parsed.raw_WHERE_KV.push([])
		else {
			$parsed.raw_WHERE_KV[$parsed.raw_WHERE_KV.length-1].push(v)
		}
	})
	$parsed.raw_WHERE_KV = $parsed.raw_WHERE_KV.map(function(v) {return v.join(' ')})
	delete $parsed.raw_WHERE

	$parsed.WHERE = {}
	$parsed.raw_WHERE_KV.map(function(kv) {
		var kv = SqlParser.split_kv(kv)
		$parsed.WHERE[kv[0]] = kv[1]
	})
	delete $parsed.raw_WHERE_KV

	return $parsed

}

SqlParser.split_replace = function($query) {
	var $parsed = {}
	var $q = JSON.parse(JSON.stringify($query))
	if ($q[0] !== 'REPLACE')
		throw new SyntaxException("expected REPLACE found " + $q[0])
	$q.shift()

	if ($q[0] !== 'INTO')
		throw new SyntaxException("expected INTO found " + $q[0])
	$q.shift()

	$parsed.tableName = $q[0].replace(/^`(.+(?=`$))`$/, '$1')
	$q.shift()

	if ($q[0] !== 'SET')
		throw new SyntaxException("expected SET found " + $q[0])
	$q.shift()

	//if ($q.indexOf('WHERE') === -1 )
	//	throw new SyntaxException("expected WHERE")

	//$parsed.raw_KV = $q.slice(0, $q.indexOf('WHERE') ).join(' ')
	$parsed.raw_KV = $q.join(' ')
	$parsed.raw_K_V = SqlParser.split_sql($parsed.raw_KV, KV_BLANK, KV_STR )
	$parsed.KV = {}
	$parsed.raw_K_V.map(function(kv) {
		var kv = SqlParser.split_kv(kv)
		$parsed.KV[kv[0]] = kv[1]
	})
	delete $parsed.raw_KV
	delete $parsed.raw_K_V

	//$parsed.raw_WHERE = $q.slice($q.indexOf('WHERE')+1).join(' ')
	//$parsed.raw_WHERE_KV = [[]]
	//SqlParser.split_sql($parsed.raw_WHERE, BLANK, KV_STR ).map(function(v) {
	//	if (v === 'AND')
	//		$parsed.raw_WHERE_KV.push([])
	//	else {
	//		$parsed.raw_WHERE_KV[$parsed.raw_WHERE_KV.length-1].push(v)
	//	}
	//})
	//$parsed.raw_WHERE_KV = $parsed.raw_WHERE_KV.map(function(v) {return v.join(' ')})
	//delete $parsed.raw_WHERE

	//$parsed.WHERE = {}
	//$parsed.raw_WHERE_KV.map(function(kv) {
	//	var kv = SqlParser.split_kv(kv)
	//	$parsed.WHERE[kv[0]] = kv[1]
	//})
	//delete $parsed.raw_WHERE_KV

	return $parsed
}



SqlParser.split_kv = function (kv) {
	var $k,$v
	$k = kv.split("=")[0]
	$v = kv.split("=",2)[1]
	return [SqlParser.unqoute_key($k),SqlParser.unquote_value($v)]
}

SqlParser.unqoute_key = function(k) {
	return k.trim().replace(/^"(.+(?="$))"$/, '$1').replace(/^'(.+(?='$))'$/, '$1').replace(/^`(.+(?=`$))`$/, '$1')
}
SqlParser.unquote_value = function(v) {
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
SqlParser.query_type = function($q) {
	if (typeof $q === "string")
		return OP.indexOf(SqlParser.split_sql($q, BLANK, STR )[0]) !== -1 ? SqlParser.split_sql($q, BLANK, STR )[0] : false

	return OP.indexOf($q[0]) !== -1 ? $q[0] : false

}
SqlParser.is_closing = function($begin, $end) {

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
module.exports = SqlParser
