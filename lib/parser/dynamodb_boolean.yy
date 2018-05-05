dynamodb_data_boolean
	: TRUE
		{ $$ = true; }
	| FALSE
		{ $$ = false; }
	;
