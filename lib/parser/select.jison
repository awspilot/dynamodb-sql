limit_clause
	:
		{ $$ = undefined; }
	| LIMIT signed_number
		{ $$ = {limit: $2}; }
	;

sort_clause
	:
		{ $$ = undefined; }
	| DESC
		{ $$ = { sort: 'DESC' }; }
	;

select_stmt
	: select sort_clause limit_clause
		{
			$$ = {statement: 'SELECT', selects: $1};
			yy.extend($$,$2);
			yy.extend($$,$3);
		}
	;

distinct_all
	:
		{ $$ = undefined; }
	| DISTINCT
		{ $$ = {distinct:true}; }
	| ALL
		{ $$ = {all:true}; }
	;
result_columns
	: result_columns COMMA result_column
		{ $$ = $1; $$.push($3); }
	| result_column
		{ $$ = [$1]; }
	;

result_column
	: STAR
		{ $$ = {star:true}; }
	| name DOT STAR
		{ $$ = {table: $1, star:true}; }
	| expr alias
		{ $$ = {expr: $1}; yy.extend($$,$2);  }
	;


join_clause
	: table_or_subquery
		{ $$ = [$1]; }
	;

table_or_subquery
	: database_table_name
		{ $$ = $1; }
	;

from
	:
		{ $$ = undefined; }
	| FROM join_clause
		{ $$ = {from:$2}; }
	;

use_index
	:
		{ $$ = undefined; }
	| USE INDEX database_index_name
		{ $$ = $3; }
	;

where
	: WHERE where_expr
		{ $$ = {where: $2}; }
	|
	;

select
	: SELECT distinct_all result_columns from use_index where
		{
			$$ = {columns:$3};
			yy.extend($$,$2);
			yy.extend($$,$4);
			yy.extend($$,$5);
			yy.extend($$,$6);
		}
	;

where_expr
	: literal_value
		{ $$ = $1; }
	| bind_parameter
		{ $$ = {bind_parameter: $1}; }
	| name
		{ $$ = {column: $1}; }

	| where_expr AND where_expr
		{ $$ = {op: 'AND', left: $1, right: $3}; }
	| where_expr OR where_expr
		{ $$ = {op: 'OR', left: $1, right: $3}; }

	| where_expr EQ where_expr
		{ $$ = {op: '=', left: $1, right: $3}; }
	| where_expr GT where_expr
		{ $$ = {op: '>', left: $1, right: $3}; }
	| where_expr GE where_expr
		{ $$ = {op: '>=', left: $1, right: $3}; }
	| where_expr LT where_expr
		{ $$ = {op: '<', left: $1, right: $3}; }
	| where_expr LE where_expr
		{ $$ = {op: '<=', left: $1, right: $3}; }


	| where_expr BETWEEN where_between
		{
			$$ = {op: 'BETWEEN', left: $1, right:$3 };
		}
	| where_expr LIKE string_literal
		{
			$$ = {op: 'LIKE', left:$1, right: { type: 'string', string: $3 } };
		}
	;

where_between
	: signed_number AND signed_number
		{ $$ = {left: { type: 'number', number: $1}, right: {type: 'number', number: $3 } }; }
	| string_literal AND string_literal
		{ $$ = {left: { type: 'string', string: $1}, right: {type: 'string', string: $3 } }; }
	;
