
dynamodb_data_string
	: SINGLE_QUOTED_STRING
		{ $$ = eval($1); }
	| DOUBLE_QUOTED_STRING
		{ $$ = eval($1); }
	;
