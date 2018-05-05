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

def_consistent_read
	:
		{ $$ = undefined; }
	| CONSISTENT_READ
		{ $$ = { consistent_read: true }; }
	;

select_stmt
	: def_select sort_clause limit_clause def_consistent_read
		{
			$$ = {statement: 'SELECT', selects: $1};
			yy.extend($$,$2);
			yy.extend($$,$3);
			yy.extend($$,$4);
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
def_select_columns
	: def_select_columns COMMA def_select_onecolumn
		{ $$ = $1; $$.push($3); }
	| def_select_onecolumn
		{ $$ = [$1]; }
	;

def_select_onecolumn
	: STAR
		{ $$ = {type: 'star', star:true}; }
	| name
		{ $$ = {type: 'column', column: $1}; }
	| name AS name
		{ $$ = {type: 'column', column: $1, alias: $3 }; }
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

def_where
	: WHERE where_expr
		{ $$ = {where: $2}; }
	|
	;

def_having
	: HAVING having_expr
		{ $$ = {having: $2}; }
	|
	;


def_select
	: SELECT distinct_all def_select_columns from use_index def_where def_having
		{
			$$ = {columns:$3};
			yy.extend($$,$2);
			yy.extend($$,$4);
			yy.extend($$,$5);
			yy.extend($$,$6);
			yy.extend($$,$7);
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
		{ $$ = {op: 'BETWEEN', left: $1, right:$3 }; }
	| where_expr LIKE string_literal
		{ $$ = {op: 'LIKE', left:$1, right: { type: 'string', string: $3 } }; }
	;

where_between
	: signed_number AND signed_number
		{ $$ = {left: { type: 'number', number: $1}, right: {type: 'number', number: $3 } }; }
	| string_literal AND string_literal
		{ $$ = {left: { type: 'string', string: $1}, right: {type: 'string', string: $3 } }; }
	;






having_expr
	: literal_value
		{ $$ = $1; }
	| boolean_value
		{ $$ = $1; }

	| bind_parameter
		{ $$ = {bind_parameter: $1}; }

	| name
		{ $$ = {column: $1}; }

	| having_expr AND having_expr
		{ $$ = {op: 'AND', left: $1, right: $3}; }
	| having_expr OR having_expr
		{ $$ = {op: 'OR', left: $1, right: $3}; }

	| having_expr EQ having_expr
		{ $$ = {op: '=', left: $1, right: $3}; }
	| having_expr GT having_expr
		{ $$ = {op: '>', left: $1, right: $3}; }
	| having_expr GE having_expr
		{ $$ = {op: '>=', left: $1, right: $3}; }
	| having_expr LT having_expr
		{ $$ = {op: '<', left: $1, right: $3}; }
	| having_expr LE having_expr
		{ $$ = {op: '<=', left: $1, right: $3}; }


	| having_expr BETWEEN where_between
		{ $$ = {op: 'BETWEEN', left: $1, right:$3 }; }
	| having_expr LIKE string_literal
		{ $$ = {op: 'LIKE', left:$1, right: { type: 'string', string: $3 } }; }
	| having_expr CONTAINS string_literal
		{ $$ = {op: 'CONTAINS', left:$1, right: { type: 'string', string: $3 } }; }
	| having_expr CONTAINS signed_number
		{ $$ = {op: 'CONTAINS', left:$1, right: { type: 'number', number: $3 } }; }
	| having_expr CONTAINS boolean_value
		{ $$ = {op: 'CONTAINS', left:$1, right: { type: 'boolean', value: $3 } }; }
	;