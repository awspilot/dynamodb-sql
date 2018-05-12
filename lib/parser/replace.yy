
replace_stmt
	: REPLACE INTO dynamodb_table_name SET def_replace_columns
		{
			var $kv = {}
			$5.map(function(v) { 
				$kv[v[0]] = v[1]
			})
			$$ = {
				statement: 'REPLACE', 
				dynamodb: {
					TableName: $3,
					set: $kv 
				},
			}
		}
	;


def_replace_columns
	: def_replace_columns COMMA def_replace_onecolumn
		{ $$ = $1; $$.push($3); }
	| def_replace_onecolumn
		{ $$ = [$1]; }
	;
def_replace_onecolumn
	: name EQ dynamodb_data_string
		{ $$ = [ $1, $3 ]; }
	| name EQ dynamodb_data_number
		{ $$ = [ $1, $3 ]; }
	| name EQ dynamodb_data_boolean
		{ $$ = [ $1, $3 ]; }
	| name EQ dynamodb_data_null
		{ $$ = [ $1, $3 ]; }
	| name EQ dynamodb_data_json
		{ $$ = [ $1, $3 ]; }
	| name EQ dynamodb_data_array
		{ $$ = [ $1, $3 ]; }
	;







