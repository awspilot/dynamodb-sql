
delete_stmt
	: DELETE FROM dynamodb_table_name WHERE def_delete_where
		{
			var $kv = {}
			$5.map(function(v) { $kv[v.k] = v.v })

			$$ = {
				statement: 'DELETE',
				operation: 'deleteItem',
				dynamodb: {
					TableName: $3,
					Key: $kv,
				}
			}
		}
	;

def_delete_where
	: def_delete_where_cond
		{ $$ = [ $1 ]; }
	| def_delete_where_cond AND def_delete_where_cond
		{ $$ = [$1, $3]; }
	;



def_delete_where_cond
	: name EQ javascript_raw_expr
		{ $$ = {k: $1, v: $3 }; }
/*
	: name EQ dynamodb_raw_string
		{ $$ = {k: $1, v: $3 }; }
	| name EQ dynamodb_raw_number
		{ $$ = {k: $1, v: $3 }; }
	| name EQ javascript_raw_obj_date
		{ $$ = {k: $1, v: $3 }; }
	| name EQ javascript_raw_obj_math
		{ $$ = {k: $1, v: $3 }; }
*/
	;
