'use strict';

var dynamo_parser = require('./parserV2.js');
function extend (a,b){
    if(typeof a == 'undefined') a = {};
    for(var key in b) {
        if(b.hasOwnProperty(key)) {
            a[key] = b[key]
        }
    }
    return a;
};
dynamo_parser.parser.yy.extend = extend
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


var SqlParser = {}

var BLANK = ["\t"," ","\n","\r"]
var STR = ["\"","'","`","/*","*/"]

var EXPECT = {
	"\"": ["\""],
	"'" : ["'"],
	"`" : ["`"],
	"/*": ["*/"],
	"{" : ["\"","'","`","/*","*/","{","}","[","]","(",")"],
	"[" : ["\"","'","`","/*","*/","{","}","[","]","(",")"],
	"(" : ["\"","'","`","/*","*/","{","}","[","]","(",")"],
}

var KV_BLANK = [',']
var KV_STR = ["\"","'","`","{","}","[","]","(",")"]
var KW  = [
		"CREATE", "TABLE", // "STRING", "NUMBER", "PRIMARY", "KEY", "INDEX", "GSI", "LSI",
		"SCAN", "CONSISTENT_READ","FROM", "USE", "INDEX", "BEGINS_WITH", "BETWEEN", "AND", "HAVING", "LIMIT"
	]


function SyntaxException(message){
	this.message = 'You have an error in your SQL syntax: ' + message;
	this.code = 'syntax_error'
}

SqlParser.array_split = function(arr, splits ) {
	var $current = 'other'
	var $split = {}
	arr.map(function(item) {
		if (splits.indexOf(item) !== -1) {
			$current = item
			$split[$current] = ($split[$current] || [])
		} else {
			$split[$current] = ($split[$current] || []).concat([item])
		}
	})
	//return Object.keys($split).map(function(v) {return {k: v,v: $split[v]}})
	return $split
}

SqlParser.parse = function( $query, $replaces ) {
	var sqp = dynamo_parser.parse( $query );
	if (global.DDBSQL === true )
		console.log("sqp=", JSON.stringify(sqp, null, "\t"))

	var $split_sql = SqlParser.split_sql($query, BLANK, STR )

	var $query_type = SqlParserV2.query_type($query)
	switch ($query_type) {
		case 'INSERT':

			


			if (sqp.length > 1)
				throw new SyntaxException('[AWSPILOT] Multiple queries not supported, yet!')

			sqp = sqp[0];

			var $parsed = {
				tableName: sqp.table,
				KV: sqp.set,
			}
			
			break
		case 'UPDATE':




			if (sqp.length > 1)
				throw new SyntaxException('[AWSPILOT] Multiple queries not supported, yet!')
			
			sqp = sqp[0];

			var $parsed = {
				tableName: sqp.table,
				KV: sqp.set,
				WHERE: sqp.where,
			}

			break;
		case 'REPLACE':




			if (sqp.length > 1)
				throw new SyntaxException('[AWSPILOT] Multiple queries not supported, yet!')
			
			sqp = sqp[0];

			var $parsed = {
				tableName: sqp.table,
				KV: sqp.set,
			}

			break;
		case 'DELETE':



			if (sqp.length > 1)
				throw new SyntaxException('[AWSPILOT] Multiple queries not supported, yet!')
			
			sqp = sqp[0];

			var $parsed = {
				tableName: sqp.table,
				WHERE: sqp.where,
			}
			break;
		case 'SELECT':




			if (sqp.length > 1)
				throw new SyntaxException('[AWSPILOT] Multiple queries not supported, yet!')

			sqp = sqp[0];

			if (sqp.selects.from.length > 1)
				throw new SyntaxException('[AWSPILOT] Select from multiple tables not supported')

			var $parsed = {
				tableName: sqp.selects.from[0].table,
				WHERE: {},
				FIELDS: null,
				FILTER: {},
				CONSISTENT_READ: false,
			}

			if (!sqp.selects.where)
				throw new SyntaxException('[AWSPILOT] Expected WHERE in SELECT, Please use SCAN statement instead')

			if ( sqp.selects.index )
				$parsed.indexName = sqp.selects.index

			var w = sqp.selects.where



			switch (w.op) {
				case '=':
					// WHERE a = 'a'
					if (!w.left.column)
						throw new SyntaxException('[AWSPILOT] Left side assignment in WHERE needs to be a column')

					$parsed.WHERE[ w.left.column ] = {
						op: w.op,
						value: extract_value(w.right),
					}
					break;
				case 'AND':
					// WHERE a = 'a' and b OP 'b'

					// at least one of left.op or right.op must be '=' because hash requires =
					if ([w.left.op, w.right.op].indexOf('=') === -1 )
						throw '[AWSPILOT] Expected at least one of operators in WHERE to be \'=\' '

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
								throw "[AWSPILOT] Unsupported LIKE, must use LIKE 'text' "

							if (eval(and2.right.string).substr(-1) !== '%')
								throw "[AWSPILOT] Unsupported LIKE 'text', text must end in % "

							$parsed.WHERE[ and2.left.column ] = {
								op: 'begins_with',
								value: eval(and2.right.string).slice(0,-1),
							}
							break;
						default:
							throw "[AWSPILOT] Unexpected operation for key ( " + and2.left.column + " ) in WHERE, expected one of =, >, >=, <, <=, BETWEEN, LIKE  "
					}
					break;
				case '>':
				case '>=':
				case '<':
				case '<=':
				case '!=':
				case 'like':
					throw "[AWSPILOT] Expected '$KEY = ' in WHERE, found '" + w.left.column + " " + w.op + " '  instead "
					break;
				case 'or':
					throw "[AWSPILOT] 'OR' not supported in WHERE, use HAVING to filter results"
				default:
					throw '[AWSPILOT] Unhandled operation ' + w.op // there is only one op and is not '='
			}

			if ( sqp.limit )
				$parsed.LIMIT = parseInt(sqp.limit)

			if ( sqp.sort === 'DESC' )
				$parsed.DESC = true

			// there is always at least 1 element, the *
			// make sure we dont have no SELECT *, field
			if (sqp.selects.columns.length > 1 ) {
				
				if (sqp.selects.columns.map(function(c) { return c.type }).indexOf('star') !== -1)
					throw "[AWSPILOT] you can not have both * and column names in SELECT"
			}
			sqp.selects.columns = sqp.selects.columns.filter(function(c) { return c.type !== 'star'})

			if (sqp.selects.columns.filter(function(c) { return c.hasOwnProperty('alias') }).length)
				throw "[AWSPILOT] 'SELECT field AS alias' not supported, yet!"


			// after removing *, handle remaining fields
			if (sqp.selects.columns.length) {
				$parsed.FIELDS = sqp.selects.columns.map(function(c) { 
					return c.column 
				})
			}


			if (sqp.consistent_read === true)
				$parsed.CONSISTENT_READ = true


			// FILTER
			if (sqp.selects.having) {
				var h = sqp.selects.having
				switch (h.op) {
					case 'LIKE':
						if (h.right.type !== 'string')
							throw "[AWSPILOT] Unsupported LIKE, must use LIKE 'text' "

						if (eval(h.right.string).substr(-1) !== '%')
							throw "[AWSPILOT] Unsupported LIKE 'text', text must end in % "

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
							throw new SyntaxException('[AWSPILOT] Left side assignment in HAVING needs to be a column')

						$parsed.FILTER[ h.left.column ] = {
							op: h.op,
							value: extract_value(h.right)
						}
						break;
					case 'OR':
						throw "[AWSPILOT] 'OR' not supported in HAVING, yet!"
						break;
					
					case 'AND':
						throw "[AWSPILOT] 'AND' not supported in HAVING, yet!"
						break;

					default:
						throw '[AWSPILOT] Unhandled operation ' + w.op // there is only one op and is not '='
					
				}

			}

			
			if (global.DDBSQL === true )
				console.log("[AWSPILOT] parsed=", JSON.stringify($parsed,null,"\t"))
			break;
		case 'SCAN':



				
			if (sqp.length > 1)
				throw new SyntaxException('[AWSPILOT] Multiple queries not supported, yet!')

			sqp = sqp[0];

			var $parsed = {
				tableName: sqp.scans.table,
				FIELDS: null,
				FILTER: {},
				CONSISTENT_READ: false,
			}
			if ( sqp.scans.index )
				$parsed.indexName = sqp.scans.index

			if ( sqp.limit )
				$parsed.LIMIT = parseInt(sqp.limit)

			// there is always at least 1 element, the *
			// make sure we dont have no SELECT *, field

			if (sqp.scans.columns.length > 1 ) {
				if (sqp.scans.columns.map(function(c) { return c.type }).indexOf('star') !== -1)
					throw "[AWSPILOT] you can not have both * and column names in SCAN"
			}

			sqp.scans.columns = sqp.scans.columns.filter(function(c) { return c.type !== 'star'})

			if (sqp.scans.columns.filter(function(c) { return c.hasOwnProperty('alias') }).length)
				throw "[AWSPILOT] 'SCAN field AS alias' not supported, yet!"

			// after removing *, handle remaining fields
			if (sqp.scans.columns.length) {
				$parsed.FIELDS = sqp.scans.columns.map(function(c) { 
					return c.column 
				})
			}

			if (sqp.consistent_read === true)
				$parsed.CONSISTENT_READ = true

			// FILTER
			if (sqp.scans.having) {
				var h = sqp.scans.having
				switch (h.op) {
					case 'LIKE':
						if (h.right.type !== 'string')
							throw "[AWSPILOT] Unsupported LIKE, must use LIKE 'text' "

						if (eval(h.right.string).substr(-1) !== '%')
							throw "[AWSPILOT] Unsupported LIKE 'text', text must end in % "

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
							throw new SyntaxException('[AWSPILOT] Left side assignment in HAVING needs to be a column')

						$parsed.FILTER[ h.left.column ] = {
							op: h.op,
							value: extract_value(h.right)
						}
						break;
					case 'OR':
						throw "[AWSPILOT] 'OR' not supported in HAVING, yet!"
						break;
					
					case 'AND':
						throw "[AWSPILOT] 'AND' not supported in HAVING, yet!"
						break;

					default:
						throw '[AWSPILOT] Unhandled operation ' + w.op // there is only one op and is not '='
					
				}

			}

			
			if (global.DDBSQL === true )
				console.log("[AWSPILOT] parsed=", JSON.stringify($parsed,null,"\t"))

			break;
		case 'CREATE':




			if (sqp.length > 1)
				throw new SyntaxException('[AWSPILOT] Multiple queries not supported, yet!')

			sqp = sqp[0];

			var $parsed = {
				TableName: sqp.table,
				KeySchema: sqp.KeySchema,
				AttributeDefinitions: sqp.AttributeDefinitions,
				LocalSecondaryIndexes: sqp.LocalSecondaryIndexes,
				GlobalSecondaryIndexes: sqp.GlobalSecondaryIndexes,
				ProvisionedThroughput: sqp.ProvisionedThroughput,
			}

			break;
		case 'SHOW_TABLES':

			var $parsed = {}
			break;
		case 'DESCRIBE_TABLE':



			if (sqp.length > 1)
				throw new SyntaxException('[AWSPILOT] Multiple queries not supported, yet!')

			sqp = sqp[0];

			var $parsed = {
				tableName: sqp.table,
			}
			break;
		case 'DROP_TABLE':



			if (sqp.length > 1)
				throw new SyntaxException('[AWSPILOT] Multiple queries not supported, yet!')

			sqp = sqp[0];

			var $parsed = {
				tableName: sqp.table,
			}

			break;
		case 'DROP_INDEX':



			if (sqp.length > 1)
				throw new SyntaxException('[AWSPILOT] Multiple queries not supported, yet!')

			sqp = sqp[0];

			var $parsed = {
				TableName: sqp.table,
				GlobalSecondaryIndexUpdates: [
					{
						Delete: {
							IndexName: sqp.index
						}
					}
				]
			}

			break;
		default:
			throw new SyntaxException("unsupported query type " + $split_sql[0])
	}
	return { type: $query_type, o: $parsed }

}


SqlParser.cleanup_sql = function($q) {
	//var $q = JSON.parse(JSON.stringify($q))

	var in_quote = false
	var in_quote_word = ''

	var splits = []

	// for each char in query
	for (var i = 0, len = $q.length; i < len; i++) {
		if (!in_quote) {
			// see if now its the begining of a quote
			["\"","'","`","/*"].map(function(v) {
				if ($q.substr(i).indexOf(v) === 0 ) {
					// opening quote
					in_quote = v
					in_quote_word+=v
				}
			})

			// if we now are in quote advance with the quote lenght, else just add the current char
			if (in_quote) {
				i =  i + in_quote.length; // advance the size of the quote
				splits.push(' ')
			} else {
				// replace new line and tabs with space
				if (["{", "}", "(", ")", "[", "]", ","].indexOf($q[i]) !== -1 ) {
					splits.push(' ',$q[i],' ')
				} else {
					splits.push($q[i].replace("\n",' ').replace("\r",' ').replace("\t",' ') )
				}
			}
		}

		if (in_quote) {
			// see if it is the end of quote
			EXPECT[in_quote].map(function(v) {
				if ($q.substr(i).indexOf(v) === 0 ) {
					// closing double quote if its not escaped
					if (! (($q[i] == '"') && ($q[i-1] == "\\")) ) {
						splits.push(' ')
						if (in_quote !== '/*')
							splits.push(in_quote_word+v, ' ')

						in_quote_word = ''
						in_quote = false
						i =  i + v.length-1; // advance the size of the quote
					}
				}
			})

			// if we are still in quote, just add it at the end of quote_word
			if (in_quote) {
				in_quote_word+=$q[i]
			} else {

			}
		}
	}

	// remove multiple spaces
	var $space = false
	splits = splits.filter(function(v) {
		if (v === ' ') {
			if ($space)
				return false

			$space = true
			return true
		}
		$space = false
		return true
	})

	return splits.join('')
}
SqlParser.split_sql = function($query, BLANK, STR ) {
	var in_quotes = []
	var word_index = 0
	var splits = []
	for (var i = 0, len = $query.length; i < len; i++) {
		;(in_quotes.length ? EXPECT[in_quotes[in_quotes.length-1]] : STR).map(function(v) {
			if ($query.substr(i).indexOf(v) === 0 ) {
				// begin or end quote
				if (in_quotes.length && SqlParser.is_closing(in_quotes[in_quotes.length-1], v )) {
						// closing quote
						in_quotes.pop()
				} else {
						// opening quote
						in_quotes.push(v)
				}
			}
		})
		if (!in_quotes.length && (BLANK.indexOf($query[i]) !== -1) ) {
			word_index++
		} else {
			splits[word_index] = (splits[word_index] || '') + $query[i]
		}
	}
	return splits
		.filter(function(v) { return (BLANK.indexOf(v) === -1) })
		.map(function(v) { return v.trim() } )
		.filter(function(v) { return !(v.indexOf('/*') === 0 && v.indexOf('*/') == v.length-2 )}) // remove comments
		.map(function(v) { return KW.indexOf(v.toUpperCase()) !== -1 ? v.toUpperCase() : v })
}




SqlParser.is_closing = function($begin,$end) {
	return [["\"","\""],["'","'"],["`","`"],["{","}"],["[","]"],["(",")"],["/*","*/"]].filter(function(v) { return (v[0] === $begin) && (v[1] === $end ) }).length === 1
}

module.exports = SqlParser










var SqlParserV2 = {}
SqlParserV2.query_type = function( $query ) {

	var $query_split = $query.toUpperCase().split("\t").join(' ').split("\n").join(' ').split("\r").join(' ').split(' ').filter(function(t) { return t !== ''})
	if (["INSERT","UPDATE","REPLACE","SELECT","SCAN","DELETE","CREATE",].indexOf($query_split[0]) !== -1 )
		return $query_split[0]

	if (["SHOW_TABLES","DESCRIBE_TABLE","DROP_TABLE","DROP_INDEX"].indexOf($query_split.slice(0,2).join('_')) !== -1 )
		return $query_split.slice(0,2).join('_')

	return false
}
