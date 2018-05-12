%lex
%options case-insensitive
%%

/*
\[([^\]])*?\]									return 'BRALITERAL'
*/

([`](\\.|[^"]|\\\")*?[`])+                    	return 'BRALITERAL'
/*
X(['](\\.|[^']|\\\')*?['])+                     return 'XSTRING'
*/
(['](\\.|[^']|\\\')*?['])+                  	return 'SINGLE_QUOTED_STRING'
(["](\\.|[^"]|\\\")*?["])+                    	return 'DOUBLE_QUOTED_STRING'



"--"(.*?)($|\r\n|\r|\n)							/* skip -- comments */

\s+   											/* skip whitespace */

'ABORT'			return 'ABORT'
'ADD'			return 'ADD'
'AFTER'			return 'AFTER'

'ALTER'			return 'ALTER'
'ANALYZE'		return 'ANALYZE'
'AND'			return 'AND'
'AS'			return 'AS'
'ASC'			return 'ASC'
'ATTACH'		return 'ATTACH'
'BEFORE'		return 'BEFORE'
'BEGIN'			return 'BEGIN'
'BETWEEN'		return 'BETWEEN'
'BY'			return 'BY'
'CASCADE'		return 'CASCADE'
'CASE'			return 'CASE'
'CAST'			return 'CAST'
'CHECK'			return 'CHECK'
'COLLATE'		return 'COLLATE'
'COLUMN'		return 'COLUMN'
'CONFLICT'		return 'CONFLICT'
'CONSISTENT_READ' return 'CONSISTENT_READ'
'CONSTRAINT'	return 'CONSTRAINT'
'CREATE'		return 'CREATE'
'CROSS'			return 'CROSS'
'CURRENT_DATE'	return 'CURRENT DATE'
'CURRENT_TIME'	return 'CURRENT TIME'
'CURRENT_TIMESTAMP'		return 'CURRENT TIMESTAMP'
'DATABASE'		return 'DATABASE'
'DEFAULT'		return 'DEFAULT'
'DEFERRABLE'	return 'DEFERRABLE'
'DEFERRED'		return 'DEFERRED'
'DELETE'		return 'DELETE'
'DESC'			return 'DESC'
'DETACH'		return 'DETACH'
'DISTINCT'		return 'DISTINCT'
'DROP'			return 'DROP'
'DESCRIBE'		return 'DESCRIBE'
'EACH'			return 'EACH'
'ELSE'			return 'ELSE'
'END'			return 'END'
'ESCAPE'		return 'ESCAPE'
'EXCEPT'		return 'EXCEPT'
'EXCLUSIVE'		return 'EXCLUSIVE'
'EXISTS'		return 'EXISTS'
'EXPLAIN'		return 'EXPLAIN'
'FAIL'			return 'FAIL'
'FOR'			return 'FOR'
'FOREIGN'		return 'FOREIGN'
'FROM'			return 'FROM'
'FULL'			return 'FULL'
'GLOB'			return 'GLOB'
'GROUP'			return 'GROUP'
'HAVING'		return 'HAVING'
'IF'			return 'IF'
'IGNORE'		return 'IGNORE'
'IMMEDIATE'		return 'IMMEDIATE'
'IN'			return 'IN'
'USE'			return 'USE'
'INDEX'			return 'INDEX'
'INDEXED'		return 'INDEXED'
'INITIALLY'		return 'INITIALLY'
'INNER'			return 'INNER'
'INSERT'		return 'INSERT'
'INSTEAD'		return 'INSTEAD'
'INTERSECT'		return 'INTERSECT'
'INTO'			return 'INTO'
'IS'			return 'IS'
'ISNULL'		return 'ISNULL'
'JOIN'			return 'JOIN'
'KEY'			return 'KEY'
'LEFT'			return 'LEFT'
'LIKE'			return 'LIKE'
'CONTAINS'		return 'CONTAINS'
'LIMIT'			return 'LIMIT'
'MATCH'			return 'MATCH'
'NATURAL'		return 'NATURAL'
'NO'			return 'NO'
'NOT'			return 'NOT'
'NOTNULL'		return 'NOTNULL'
'NULL'			return 'NULL'
'UNDEFINED'		return 'UNDEFINED'
'OF'			return 'OF'
'OFFSET'		return 'OFFSET'
'ON'			return 'ON'
'OR'			return 'OR'
'ORDER'			return 'ORDER'
'OUTER'			return 'OUTER'
'PLAN'			return 'PLAN'
'PRAGMA'		return 'PRAGMA'
'PRIMARY'		return 'PRIMARY'
'QUERY'			return 'QUERY'
'RAISE'			return 'RAISE'
'RECURSIVE'		return 'RECURSIVE'
'REFERENCES'	return 'REFERENCES'
'REGEXP'		return 'REGEXP'
'REINDEX'		return 'REINDEX'
'RELEASE'		return 'RELEASE'
'RENAME'		return 'RENAME'
'REPLACE'		return 'REPLACE'
'RESTRICT'		return 'RESTRICT'
'RIGHT'			return 'RIGHT'
'ROLLBACK'		return 'ROLLBACK'
'ROW'			return 'ROW'
'SELECT'		return 'SELECT'
'SCAN'			return 'SCAN'
'SET'			return 'SET'
'TABLE'			return 'TABLE'
'TEMP'			return 'TEMP'
'THEN'			return 'THEN'
'TO'			return 'TO'
'TRIGGER'		return 'TRIGGER'
'UNION'			return 'UNION'
'UNIQUE'		return 'UNIQUE'
'UPDATE'		return 'UPDATE'
'USING'			return 'USING'
'VACUUM'		return 'VACUUM'
'VALUES'		return 'VALUES'
'VIEW'			return 'VIEW'
'WHEN'			return 'WHEN'
'WHERE'			return 'WHERE'
'WITH'			return 'WITH'
'TRUE'			return 'TRUE'
'FALSE'			return 'FALSE'
'SHOW'			return 'SHOW'
'TABLES'		return 'TABLES'

'STRING'		return 'STRING'
'NUMBER'		return 'NUMBER'
'THROUGHPUT'	return 'THROUGHPUT'
'GSI'			return 'GSI'
'LSI'			return 'LSI'
'PROJECTION'	return 'PROJECTION'
'ALL'			return 'ALL'
'KEYS_ONLY'		return 'KEYS_ONLY'


[-]?(\d*[.])?\d+[eE]\d+							return 'NUMBER'
[-]?(\d*[.])?\d+								return 'NUMBER'

'~'												return 'TILDEs'
'+='											return 'PLUSEQ'
'+'												return 'PLUS'
'-' 											return 'MINUS'
'*'												return 'STAR'
'/'												return 'SLASH'
'%'												return 'REM'
'>>'											return 'RSHIFT'
'<<'											return 'LSHIFT'
'<>'											return 'NE'
'!='											return 'NE'
'>='											return 'GE'
'>'												return 'GT'
'<='											return 'LE'
'<'												return 'LT'
'='												return 'EQ'
'&'												return 'BITAND'
'|'												return 'BITOR'

'('												return 'LPAR'
')'												return 'RPAR'

'{'												return 'JSONLPAR'
'}'												return 'JSONRPAR'

'['												return 'ARRAYLPAR'
']'												return 'ARRAYRPAR'

'.'												return 'DOT'
','												return 'COMMA'
':'												return 'COLON'
';'												return 'SEMICOLON'
'$'												return 'DOLLAR'
'?'												return 'QUESTION'
'^'												return 'CARET'

[a-zA-Z_][a-zA-Z_0-9]*                       	return 'LITERAL'

<<EOF>>               							return 'EOF'
.												return 'INVALID'

/lex

/* %left unary_operator binary_operator  */

%left OR
%left AND
%left BETWEEN
%right NOT
%left IS MATCH LIKE CONTAINS IN ISNULL NOTNULL NE EQ
%left ESCAPE
%left GT LE LT GE
%left BITAND BITOR LSHIFT RSHIFT
$left PLUS MINUS
%left STAR SLASH REM
%left CONCAT
%left COLLATE
%right BITNOT


%start main

%%
main
	: sql_stmt_list EOF
		{
			$$ = $1;
			return $$;
		}
	;

sql_stmt_list
	: sql_stmt_list SEMICOLON sql_stmt
		{ $$ = $1; if($3) $$.push($3); }
	| sql_stmt
		{ $$ = [$1]; }
	;
/*
sql_stmt
	: alter_table_stmt
	| create_index_stmt



	;
*/
sql_stmt
	: select_stmt
	| insert_stmt
	| update_stmt
	| replace_stmt
	| delete_stmt
	| create_table_stmt
	| show_tables_stmt
	| drop_table_stmt
	| describe_table_stmt
	| drop_index_stmt
	| scan_stmt
	;

name
	: LITERAL
		{ $$ = $1; }
	| BRALITERAL
		{ $$ = $1.substr(1,$1.length-2); }
	;

database_table_name
	: name DOT name
		{ $$ = {database:$1, table:$3}; }
	| name
		{ $$ = {table:$1}; }
	;

dynamodb_table_name
	: name
		{ $$ = $1; }
	;


database_index_name
	: name
		{ $$ = {index:$1}; }
	;

dynamodb_index_name
	: name
		{ $$ = $1; }
	;


signed_number
	: NUMBER
		{ $$ = $1; }
	;

string_literal
	: SINGLE_QUOTED_STRING
		{ $$ = $1; }
	| DOUBLE_QUOTED_STRING
		{ $$ = $1; }
	| XSTRING
		{ $$ = $1; }
	;

literal_value
	: signed_number
		{ $$ = {type:'number', number:$1}; }
	| string_literal
		{ $$ = {type:'string', string: $1}}
	;

boolean
	: TRUE
		{ $$ = true; }
	| FALSE
		{ $$ = false; }
	;

boolean_value
	: TRUE
		{ $$ = {type:'boolean', value: true }; }
	| FALSE
		{ $$ = {type:'boolean', value: false }; }
	;
