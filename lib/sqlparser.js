'use strict';
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
		"INSERT", "INTO", "SET",
		"UPDATE", "SET",  "WHERE", "AND",
		"REPLACE", "INTO", "SET",
		"SELECT", "CONSISTENT_READ","FROM", "USE", "INDEX", "WHERE", "BEGINS_WITH", "BETWEEN", "AND", "HAVING", "DESC", "LIMIT",
		"DELETE", "FROM", "WHERE",
		"CREATE", "TABLE", // "STRING", "NUMBER", "PRIMARY", "KEY", "INDEX", "GSI", "LSI",
		"SHOW","TABLES",
		"DESCRIBE","TABLE",
		"DROP","TABLE",
		"DROP", "INDEX", "ON"
	]
var OP = ["INSERT","UPDATE","REPLACE","SELECT","DELETE","CREATE","SHOW","DESCRIBE_TABLE","DROP_TABLE","DROP_INDEX"]

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
	var $split_sql = SqlParser.split_sql($query, BLANK, STR )
	var $query_type = SqlParser.query_type($split_sql)
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
		case 'DELETE':
			var $parsed = SqlParser.split_delete($split_sql)
			break;
		case 'SELECT':
			var $parsed = SqlParser.split_select($split_sql)
			break;
		case 'CREATE':
			var $parsed = SqlParser.split_create_table($split_sql)
			break;
		case 'SHOW':
			var $parsed = SqlParser.split_show_tables($split_sql)
			$query_type = 'SHOW_TABLES'
			break;
		case 'DESCRIBE_TABLE':
			var $parsed = SqlParser.split_describe_table($split_sql)
			$query_type = 'DESCRIBE_TABLE'
			break;
		case 'DROP_TABLE':
			var $parsed = SqlParser.split_drop_table($split_sql)
			$query_type = 'DROP_TABLE'
			break;
		case 'DROP_INDEX':
			var $parsed = SqlParser.split_drop_index($split_sql)
			$query_type = 'DROP_INDEX'
			break;
		default:
			throw new SyntaxException("unsupported query type " + $split_sql[0])
	}
	return { type: $query_type, o: $parsed }

}


SqlParser.cleanup_sql = function($q) {
	//var $q = JSON.parse(JSON.stringify($q))
	var NON_BREAKING_START_QUOTES = ["\"","'","`","/*"]
	var NEED_SOME_SPACE = ["{", "}", "(", ")", "[", "]", ","]

	var in_quote = false
	var in_quote_word = ''

	var splits = []

	// for each char in query
	for (var i = 0, len = $q.length; i < len; i++) {
		if (!in_quote) {
			// see if now its the begining of a quote
			NON_BREAKING_START_QUOTES.map(function(v) {
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
				if (NEED_SOME_SPACE.indexOf($q[i]) !== -1 ) {
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

SqlParser.split_show_tables = function($query) {
	var $parsed = {}
	var $q = JSON.parse(JSON.stringify($query))
	if ($q[0] !== 'SHOW')
		throw new SyntaxException("expected SHOW found " + $q[0])
	$q.shift()

	if ($q[0] !== 'TABLES')
		throw new SyntaxException("expected TABLES found " + $q[0])
	$q.shift()

	if ($q.length)
		throw new SyntaxException("SHOW TABLES does not support additional parameters")


	return $parsed
}
SqlParser.split_describe_table = function($query) {
	var $parsed = {}
	var $q = JSON.parse(JSON.stringify($query))
	if ($q[0] !== 'DESCRIBE')
		throw new SyntaxException("expected DESCRIBE found " + $q[0])
	$q.shift()

	if ($q[0] !== 'TABLE')
		throw new SyntaxException("expected TABLE found " + $q[0])
	$q.shift()

	if ($q.length == 0)
		throw new SyntaxException("DESCRIBE TABLE expected table name")

	if ($q.length != 1)
		throw new SyntaxException("DESCRIBE TABLE only supports one parameter")

	$parsed.tableName = $q[0].replace(/^`(.+(?=`$))`$/, '$1')

	return $parsed
}
SqlParser.split_drop_table = function($query) {
	var $parsed = {}
	var $q = JSON.parse(JSON.stringify($query))
	if ($q[0] !== 'DROP')
		throw new SyntaxException("expected DROP found " + $q[0])
	$q.shift()

	if ($q[0] !== 'TABLE')
		throw new SyntaxException("expected TABLE found " + $q[0])
	$q.shift()

	if ($q.length == 0)
		throw new SyntaxException("DROP TABLE expected table name")

	if ($q.length != 1)
		throw new SyntaxException("DROP TABLE only supports one parameter")

	$parsed.tableName = $q[0].replace(/^`(.+(?=`$))`$/, '$1')

	return $parsed
}
SqlParser.split_drop_index = function($query) {
	var $parsed = {}
	var $q = JSON.parse(JSON.stringify($query))
	if ($q[0] !== 'DROP')
		throw new SyntaxException("expected DROP found " + $q[0])
	$q.shift()

	if ($q[0] !== 'INDEX')
		throw new SyntaxException("expected INDEX found " + $q[0])
	$q.shift()

	if ($q.length == 0)
		throw new SyntaxException("DROP INDEX expected index name")

	$parsed.GlobalSecondaryIndexUpdates = [
		{
			Delete: {
				IndexName: $q[0].replace(/^`(.+(?=`$))`$/, '$1')
			}
		}
	]
	$q.shift()

	if ($q.length == 0)
		throw new SyntaxException("DROP INDEX expected ON after index name")

	if ($q[0] !== 'ON')
		throw new SyntaxException("DROP INDEX expected ON, found " + $q[0])
	$q.shift()

	$parsed.TableName = $q[0].replace(/^`(.+(?=`$))`$/, '$1')
	$q.shift()

	if ($q.length > 0)
		throw new SyntaxException("DROP INDEX unexpected content after table name" + $q[0])

	return $parsed
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
	$parsed.K_V_OP = {}
	$parsed.raw_K_V.map(function(kv) {
		var kv = SqlParser.split_kv(kv, ["=", "+="])
		$parsed.K_V_OP[kv[0]] = { v: kv[1], op: kv[2] }
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

	return $parsed
}
SqlParser.split_delete = function($query) {
	var $parsed = {}
	var $q = JSON.parse(JSON.stringify($query))
	if ($q[0] !== 'DELETE')
		throw new SyntaxException("expected DELETE, found " + $q[0])
	$q.shift()

	if ($q[0] !== 'FROM')
		throw new SyntaxException("expected FROM, found " + $q[0])
	$q.shift()

	$parsed.tableName = $q[0].replace(/^`(.+(?=`$))`$/, '$1')
	$q.shift()

	if ($q[0] !== 'WHERE')
		throw new SyntaxException("expected WHERE, found " + $q[0])
	$q.shift()

	$parsed.raw_WHERE = $q.join(' ')
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
SqlParser.split_select = function($query) {
	var $parsed = {}
	var $q = JSON.parse(JSON.stringify($query))

	var $split = SqlParser.array_split($q,  ['SELECT','CONSISTENT_READ','FROM','USE','INDEX','WHERE','HAVING','DESC','LIMIT'] )

	if ($q[0] !== 'SELECT')
		throw new SyntaxException("expected SELECT found " + $q[0])
	$q.shift()

	if (!$split.hasOwnProperty('FROM'))
		throw new SyntaxException("expected FROM")

	$parsed.raw_SELECT = $split['SELECT'].join(' ')

	if ($parsed.raw_SELECT !== '*')
		throw new SyntaxException("expected * after SELECT")

	$q = $q.slice($q.indexOf('FROM')+1 )

	$parsed.tableName = $split['FROM'].join(' ').replace(/^`(.+(?=`$))`$/, '$1')
	$q.shift()

	if ($q[0] == 'USE') {
		$q.shift()
		if ($q[0] !== 'INDEX')
			throw new SyntaxException("expected INDEX after USE")

		$q.shift()
		$parsed.indexName = $q[0].replace(/^`(.+(?=`$))`$/, '$1')
		$q.shift()
	}

	if ($q[0] !== 'WHERE'){
        // throw new SyntaxException("expected WHERE, found " + $q[0] )
	}else{
        $q.shift()


        //################### WHERE
        $parsed.raw_WHERE = $split['WHERE'].join(' ')
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
            var kv = SqlParser.split_kv_where(kv)
            $parsed.WHERE[kv[0]] = { op: kv[2], value: kv[1] }
        })
        delete $parsed.raw_WHERE_KV

	}

	//################### HAVING
	if ($split.hasOwnProperty('HAVING')) {
		$parsed.raw_FILTER = $split['HAVING'].join(' ')
		$parsed.raw_FILTER_KV = [[]]
		SqlParser.split_sql($parsed.raw_FILTER, BLANK, KV_STR ).map(function(v) {
			if (v === 'AND')
				$parsed.raw_FILTER_KV.push([])
			else {
				$parsed.raw_FILTER_KV[$parsed.raw_FILTER_KV.length-1].push(v)
			}
		})
		$parsed.raw_FILTER_KV = $parsed.raw_FILTER_KV.map(function(v) {return v.join(' ')})
		delete $parsed.raw_FILTER

		$parsed.FILTER = {}
		$parsed.raw_FILTER_KV.map(function(kv) {
			var kv = SqlParser.split_kv_where(kv)
			$parsed.FILTER[kv[0]] = { op: kv[2], value: kv[1] }
		})
		delete $parsed.raw_FILTER_KV
	}

	if ($split.hasOwnProperty('DESC'))
		$parsed.DESC = true

	if ($split.hasOwnProperty('CONSISTENT_READ'))
		$parsed.CONSISTENT_READ = true

	if ($split.hasOwnProperty('LIMIT'))
		$parsed.LIMIT = parseInt($split.LIMIT.join(' '))

	//console.log($split,null,"\t")
	//console.log($parsed,null, "\t")
	return $parsed
}

SqlParser.split_create_table = function($query) {
	var $parsed = {}
	var $q = JSON.parse(JSON.stringify($query))

	if ($q[0] !== 'CREATE')
		throw new SyntaxException("expected CREATE found " + $q[0])
	$q.shift()

	if ($q[0] !== 'TABLE')
		throw new SyntaxException("expected TABLE found " + $q[0])
	$q.shift()

	if (!$q.length)
		throw new SyntaxException("expected table name")

	$parsed.TableName = $q[0].replace(/^`(.+(?=`$))`$/, '$1')
	$q.shift()

	if ($q[0] !== '(')
		throw new SyntaxException("expected ( found " + $q[0])
	$q.shift()

	if ($q[$q.length-1] !== ')')
		throw new SyntaxException("expected ) found " + $q[0])
	$q = $q.slice(0,-1)

	$parsed.KeySchema = []
	$parsed.AttributeDefinitions = []
	//$parsed.LocalSecondaryIndexes = []
	SqlParser.split_sql($q.join(' '), KV_BLANK, KV_STR ).map(function(v,k) {
		return SqlParser.split_sql(v, BLANK, STR )
	}).map(function(v) {
		if (v.length === 2 && (v[1] === 'STRING' || v[1] === 'NUMBER' )) {
			$parsed.AttributeDefinitions.push({
				AttributeName: v[0],
				AttributeType: v[1] === 'STRING' ? 'S' : (v[1] === 'NUMBER' ? 'N' : '' )
			})
		} else if (v[0] == 'PRIMARY') {
			var $split = SqlParser.array_split(v,  ['PRIMARY','KEY','THROUGHPUT'] )
			v.shift()
			if (v[0] !== 'KEY')
				throw new SyntaxException("expected KEY found " + v[0])
			v.shift()

			var v =  SqlParser.split_sql($split['KEY'].join(' ') , BLANK, STR )


			if (v[0] !== '(')
				throw new SyntaxException("PRIMARY KEY expected ( found " + v[0])
			v.shift()
			if (v[v.length-1] !== ')')
				throw new SyntaxException("PRIMARY KEY expected ) found " + v[v.length-1])
			v = v.slice(0,-1)
			v = v.join(' ').split(',').map(function(v) { return v.trim()}).filter(function(v) { return v !== ''})
			if (!v.length)
				throw new SyntaxException("expected partition key name for PRIMARY KEY")

			if (v.length > 2)
				throw new SyntaxException("maximum 2 attributes for PRIMARY KEY ( partision, sort )")

			$parsed.KeySchema.push({
				AttributeName: v[0],
				KeyType: "HASH"
			})
			v.shift()
			if (v.length) {
				$parsed.KeySchema.push( {
					AttributeName: v[0],
					KeyType: "RANGE"
				})
			}

			if (!$split.hasOwnProperty('THROUGHPUT')) {
				$parsed.ProvisionedThroughput = {
					ReadCapacityUnits: 1,
					WriteCapacityUnits: 1
				}
			} else {
				if (!$split['THROUGHPUT'].length)
					throw new SyntaxException("PRIMARY KEY nothing specified for THROUGHPUT ")

				var v =  SqlParser.split_sql($split['THROUGHPUT'].join(' ') , BLANK, STR )
				if (v.length !== 2)
					throw new SyntaxException("PRIMARY KEY THROUGHPUT requires exacly 2 number values ")

				if (!parseInt(v[0]))
					throw new SyntaxException("PRIMARY KEY THROUGHPUT requires exacly 2 number values ")

				if (!parseInt(v[1]))
					throw new SyntaxException("PRIMARY KEY THROUGHPUT requires exacly 2 number values ")

					$parsed.ProvisionedThroughput = {
						ReadCapacityUnits: v[0],
						WriteCapacityUnits: v[1]
					}
			}


		} else if (v[0] == 'INDEX') {
			var $split = SqlParser.array_split(v,  ['INDEX','PROJECTION','THROUGHPUT'] )
			//console.log('split=',JSON.stringify($split,null,"\t"))
			var v =  SqlParser.split_sql($split['INDEX'].join(' ') , BLANK, STR )

			var $thisIndex = {}
			$thisIndex.KeySchema = []

			//v.shift()
			$thisIndex.IndexName = v[0]
			v.shift()

			var $index_type = v[0]
			if ($index_type !== 'GSI' && $index_type !== 'LSI')
				throw new SyntaxException("expected index type GSI or LSI , found " + v[0])
			v.shift()

			if (v[0] !== '(')
				throw new SyntaxException("expected ( found " + v[0])
			v.shift()
			if (v[v.length-1] !== ')')
				throw new SyntaxException("expected ) found " + v[v.length-1])
			v = v.slice(0,-1)
			v = v.join(' ').split(',').map(function(v) { return v.trim()}).filter(function(v) { return v !== ''})
			if (!v.length)
				throw new SyntaxException("expected partition key name for INDEX")

			if (v.length > 2)
				throw new SyntaxException("maximum 2 attributes for INDEX type gsi ( partision, sort ) and 1 attribute for index type lsi ( sort ) ")

			$thisIndex.KeySchema.push({
				AttributeName: v[0],
				KeyType: "HASH"
			})
			v.shift()
			if (v.length) {
				$thisIndex.KeySchema.push( {
					AttributeName: v[0],
					KeyType: "RANGE"
				})
			}

			if ($index_type === 'GSI') {
				$thisIndex.ProvisionedThroughput = {
					ReadCapacityUnits: 1,
					WriteCapacityUnits: 1
				}
			}

			if ($index_type === 'GSI') {
				if (!$parsed.hasOwnProperty('GlobalSecondaryIndexes') )
					$parsed.GlobalSecondaryIndexes = []

				$parsed.GlobalSecondaryIndexes.push($thisIndex)
			} else if ($index_type === 'LSI') {
				if (!$parsed.hasOwnProperty('LocalSecondaryIndexes') )
					$parsed.LocalSecondaryIndexes = []

				$parsed.LocalSecondaryIndexes.push($thisIndex)

			} else {
				throw new SyntaxException("INDEX type " + $index_type  + " not yet supported ")
			}

			if (!$split.hasOwnProperty('PROJECTION')) {
				$thisIndex.Projection = {
					ProjectionType: "ALL"
				}
			} else {
				if (!$split['PROJECTION'].length)
					throw new SyntaxException("INDEX " + $thisIndex.IndexName  + " nothing specified for PROJECTION ")

				if ($split['PROJECTION'].length === 1) {
					switch ($split['PROJECTION'][0].toUpperCase()) {
						case 'ALL':
						$thisIndex.Projection = {
							ProjectionType: "ALL"
						}
						break
						case 'KEYS_ONLY':
						$thisIndex.Projection = {
							ProjectionType: "KEYS_ONLY"
						}
						break
						default:
							throw new SyntaxException("Unsupported projection type for INDEX " + $thisIndex.IndexName  + " : " + $split['PROJECTION'][0])

					}
				} else {
					$thisIndex.Projection = {
						ProjectionType: "INCLUDE"
					}
					var v =  SqlParser.split_sql($split['PROJECTION'].join(' ') , BLANK, STR )

					if (v[0] !== '(')
						throw new SyntaxException("PROJECTION expected ( found " + v[0])
					v.shift()
					if (v[v.length-1] !== ')')
						throw new SyntaxException("PROJECTION expected ) found " + v[v.length-1])
					v = v.slice(0,-1)
					v = v.join(' ').split(',').map(function(v) { return v.trim()}).filter(function(v) { return v !== ''})
					if (!v.length)
						throw new SyntaxException("PROJECTION no attribute specified")

					$thisIndex.Projection.NonKeyAttributes = v
					return
				}


			}

			// GSI supports ProvisionedThroughput
			if ($index_type === 'GSI') {
				if (!$split.hasOwnProperty('THROUGHPUT')) {
					$thisIndex.ProvisionedThroughput = {
						ReadCapacityUnits: 1,
						WriteCapacityUnits: 1
					}
				} else {
					if (!$split['THROUGHPUT'].length)
						throw new SyntaxException("INDEX " + $thisIndex.IndexName  + " nothing specified for THROUGHPUT ")

					var v =  SqlParser.split_sql($split['THROUGHPUT'].join(' ') , BLANK, STR )
					if (v.length !== 2)
						throw new SyntaxException("INDEX " + $thisIndex.IndexName  + " THROUGHPUT requires exacly 2 number values ")

					if (!parseInt(v[0]))
						throw new SyntaxException("INDEX " + $thisIndex.IndexName  + " THROUGHPUT requires exacly 2 number values ")

					if (!parseInt(v[1]))
						throw new SyntaxException("INDEX " + $thisIndex.IndexName  + " THROUGHPUT requires exacly 2 number values ")

					$thisIndex.ProvisionedThroughput = {
						ReadCapacityUnits: v[0],
						WriteCapacityUnits: v[1]
					}
				}
			} else if ($index_type === 'LSI') {
				if ($split.hasOwnProperty('THROUGHPUT'))
					throw new SyntaxException("INDEX type LSI " + $thisIndex.IndexName  + " does not support THROUGHPUT ")
			}


		} else {
			throw new SyntaxException("unexpected " + v[0] )
		}
		return v
	})


	//console.log(JSON.stringify($q,null,"\t"))
	//console.log(JSON.stringify($split,null,"\t"))

	return $parsed
}

SqlParser.split_kv = function (kv, split_by ) {
	var $k,$v
	if ( split_by === undefined )
		split_by = ['=']

	var $op_idx = Math.min.apply(Math,
		split_by.map(function(v) {
			return kv.indexOf(v)
		}).filter(function(v) {
		return v !== -1
	}))
	var op = null
	split_by.map(function(v) {
		if ($op_idx === kv.indexOf(v) ) op = v
	})

	$k = kv.split(op)[0]
	$v = kv.split(op,2)[1]
	return [SqlParser.unqoute_key($k),SqlParser.unquote_value($v), op ]
}

SqlParser.split_kv_where = function (kv) {
	var $k,$v

	var $comparison_idx = Math.min.apply(Math, [
		kv.indexOf('='),
		kv.indexOf('>'),
		kv.indexOf('>='),
		kv.indexOf('<'),
		kv.indexOf('<='),
		//kv.indexOf('^'),
		kv.indexOf('BEGINS_WITH'),
		kv.indexOf('BETWEEN')
	].filter(function(v) {
		return v !== -1
	}))

	if ($comparison_idx === kv.indexOf('BEGINS_WITH') ) {
		var $operation = '^'
		$k = kv.split('BEGINS_WITH')[0]
		$v = kv.split('BEGINS_WITH',2)[1]
	} else if($comparison_idx === kv.indexOf('BETWEEN')) {
		var $operation = '><'
		$k = kv.split('BETWEEN')[0]
		$v = kv.split('BETWEEN',2)[1]
	} else {
		var $operation = kv.substr($comparison_idx,2).replace(/[^<>=]/g, '')
		$k = kv.split($operation)[0]
		$v = kv.split($operation,2)[1]
	}

	return [SqlParser.unqoute_key($k),SqlParser.unquote_value($v),$operation]
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

	if (OP.indexOf($q[0] + '_' + $q[1]) !== -1)
		return $q[0] + '_' + $q[1]

	return OP.indexOf($q[0]) !== -1 ? $q[0] : false

}
SqlParser.is_closing = function($begin,$end) {
	return [["\"","\""],["'","'"],["`","`"],["{","}"],["[","]"],["(",")"],["/*","*/"]].filter(function(v) { return (v[0] === $begin) && (v[1] === $end ) }).length === 1
}

module.exports = SqlParser
