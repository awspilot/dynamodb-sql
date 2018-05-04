limit_clause
	:
		{ $$ = undefined; }
	| LIMIT offset
		{ 
			$$ = {limit:$2};
			yy.extend($$, $3);
		}
	;

select_stmt
	: select limit_clause 
		{ 
			$$ = {statement: 'SELECT', selects: $1};
			yy.extend($$,$2);
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

where
	: WHERE expr
		{ $$ = {where: $2}; }
	|
	;

select
	: SELECT distinct_all result_columns from where
		{ 
			$$ = {columns:$3};
			yy.extend($$,$2);
			yy.extend($$,$4);
			yy.extend($$,$5);
		}
	;