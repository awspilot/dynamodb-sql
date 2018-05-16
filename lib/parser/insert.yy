
insert_stmt
	: INSERT def_insert_ignore INTO dynamodb_table_name SET def_insert_columns
		{
			var $kv = {}
			$6.map(function(v) { $kv[v[0]] = v[1] })

			$$ = {
				statement: 'INSERT', 
				operation: 'putItem',
				ignore: $2,
				dynamodb: {
					TableName: $4,
					Item: $kv,
				},
				
			};

		}
	;

def_insert_ignore
	:
		{{ $$ = false }}
	| IGNORE
		{{ $$ = true }}
	;

def_insert_columns
	: def_insert_columns COMMA def_insert_onecolumn
		{ $$ = $1; $$.push($3); }
	| def_insert_onecolumn
		{ $$ = [$1]; }
	;
def_insert_onecolumn
	: name EQ dynamodb_raw_string
		{ $$ = [ $1, $3 ]; }
	| name EQ dynamodb_raw_number
		{ $$ = [ $1, $3 ]; }
	| name EQ dynamodb_raw_boolean
		{ $$ = [ $1, $3 ]; }
	| name EQ dynamodb_raw_null
		{ $$ = [ $1, $3 ]; }
	| name EQ dynamodb_raw_json
		{ $$ = [ $1, $3 ]; }
	| name EQ dynamodb_raw_array
		{ $$ = [ $1, $3 ]; }
	| name EQ dynamodb_raw_stringset
		{ $$ = [ $1, $3 ]; }
	| name EQ dynamodb_raw_numberset
		{ $$ = [ $1, $3 ]; }
	;










