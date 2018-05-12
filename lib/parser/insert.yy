
insert_stmt
	: INSERT INTO dynamodb_table_name SET def_insert_columns
		{
			var $kv = {}
			$5.map(function(v) { $kv[v[0]] = v[1] })

			$$ = {
				statement: 'INSERT', 
				dynamodb: {
					TableName: $3,
					set: $kv 
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









