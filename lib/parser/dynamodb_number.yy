dynamodb_data_number
	: NUMBER
		{ $$ = eval($1); }
	;
