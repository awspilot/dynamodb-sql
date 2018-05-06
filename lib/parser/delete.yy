
delete_stmt
	: DELETE FROM database_table_name WHERE def_delete_where
		{
			$$ = {statement: 'DELETE', set: $kv, where: $5 }
			yy.extend($$,$3);
		}
	;

def_delete_where
	: def_delete_where_cond
		{ $$ = [ $1 ]; }
	| def_delete_where_cond AND def_delete_where_cond
		{ $$ = [$1, $3]; }
	;



def_delete_where_cond
	: name EQ dynamodb_data_string
		{ $$ = {k: $1, v: $3 }; }
	| name EQ dynamodb_data_number
		{ $$ = {k: $1, v: $3 }; }
	;
