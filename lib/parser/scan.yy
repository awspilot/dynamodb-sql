scan_stmt
	: def_scan def_scan_limit_clause def_scan_consistent_read
		{
			$$ = {
				statement: 'SCAN', 
				dynamodb: {
				
				},
			};
			yy.extend($$.dynamodb, $1 )
			yy.extend($$.dynamodb,$2);
			yy.extend($$.dynamodb,$3);
		}
	;
def_scan
	: SCAN def_scan_columns FROM dynamodb_table_name def_scan_use_index def_scan_having
		{
			$$ = {
				TableName: $4,
				columns:$2
			}; //columns

			yy.extend($$,$5); // index
			yy.extend($$,$6); // filter
		}
	;

def_scan_limit_clause
	:
		{ $$ = undefined; }
	| LIMIT signed_number
		{ $$ = {limit: $2}; }
	;


def_scan_consistent_read
	:
		{ $$ = undefined; }
	| CONSISTENT_READ
		{ $$ = { consistent_read: true }; }
	;



def_scan_columns
	: def_scan_columns COMMA def_scan_onecolumn
		{ $$ = $1; $$.push($3); }
	| def_scan_onecolumn
		{ $$ = [$1]; }
	;

def_scan_onecolumn
	: STAR
		{ $$ = {type: 'star', star:true}; }
	| name
		{ $$ = {type: 'column', column: $1}; }
	| name AS name
		{ $$ = {type: 'column', column: $1, alias: $3 }; }
	;

def_scan_from
	:
		{ $$ = undefined; }
	| FROM database_table_name
		{ $$ = $2 }
	;


def_scan_use_index
	:
		{ $$ = undefined; }
	| USE INDEX database_index_name
		{ $$ = $3; }
	;


def_scan_having
	: HAVING def_scan_having_expr
		{ $$ = {having: $2}; }
	|
	;

def_scan_having_expr
	: literal_value
		{ $$ = $1; }
	| boolean_value
		{ $$ = $1; }

	| bind_parameter
		{ $$ = {bind_parameter: $1}; }

	| name
		{ $$ = {column: $1}; }

	| def_scan_having_expr AND def_scan_having_expr
		{ $$ = {op: 'AND', left: $1, right: $3}; }
	| def_scan_having_expr OR def_scan_having_expr
		{ $$ = {op: 'OR', left: $1, right: $3}; }

	| def_scan_having_expr EQ def_scan_having_expr
		{ $$ = {op: '=', left: $1, right: $3}; }
	| def_scan_having_expr GT def_scan_having_expr
		{ $$ = {op: '>', left: $1, right: $3}; }
	| def_scan_having_expr GE def_scan_having_expr
		{ $$ = {op: '>=', left: $1, right: $3}; }
	| def_scan_having_expr LT def_scan_having_expr
		{ $$ = {op: '<', left: $1, right: $3}; }
	| def_scan_having_expr LE def_scan_having_expr
		{ $$ = {op: '<=', left: $1, right: $3}; }


	| def_scan_having_expr BETWEEN where_between
		{ $$ = {op: 'BETWEEN', left: $1, right:$3 }; }
	| def_scan_having_expr LIKE string_literal
		{ $$ = {op: 'LIKE', left:$1, right: { type: 'string', string: $3 } }; }
	| def_scan_having_expr CONTAINS string_literal
		{ $$ = {op: 'CONTAINS', left:$1, right: { type: 'string', string: $3 } }; }
	| def_scan_having_expr CONTAINS signed_number
		{ $$ = {op: 'CONTAINS', left:$1, right: { type: 'number', number: $3 } }; }
	| def_scan_having_expr CONTAINS boolean_value
		{ $$ = {op: 'CONTAINS', left:$1, right: { type: 'boolean', value: $3 } }; }
	;