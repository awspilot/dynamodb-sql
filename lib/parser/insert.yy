
insert_stmt
	: INSERT INTO dynamodb_table_name SET def_insert_columns
		{
			var $kv = {}
			$5.map(function(v) { $kv[v[0]] = v[1] })

			$$ = {
				statement: 'INSERT', 
				operation: 'putItem',
				
				dynamodb: {
					TableName: $3,
					Item: $kv,
				},
				
			};

		}
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
	;







/*
	yylloc
	first_index
	last_index
	first_yylloc
	last_yylloc
	dont_look_back
	lexer.options
	yylineno
	yytext
	yyleng
	
*/









