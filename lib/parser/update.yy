
update_stmt
	: UPDATE database_table_name SET def_update_columns WHERE def_update_where
		{
			var $kv = {}
			$4.map(function(v) { $kv[v[0]] = v[1] })
			$$ = {statement: 'UPDATE', set: $kv, where: $6 }
			yy.extend($$,$2);
		}
	;


def_update_columns
	: def_update_columns COMMA def_update_onecolumn
		{ $$ = $1; $$.push($3); }
	| def_update_onecolumn
		{ $$ = [$1]; }
	;
def_update_onecolumn
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

def_update_where
	: def_update_where_cond
		{ $$ = $1; }
	| def_update_where_cond AND def_update_where_cond
		{ $$ = [$1, $3]; }
	;



def_update_where_cond
	: name EQ dynamodb_data_string
		{ $$ = {k: $1, v: $3 }; }
	| name EQ dynamodb_data_number
		{ $$ = {k: $1, v: $3 }; }
	;
