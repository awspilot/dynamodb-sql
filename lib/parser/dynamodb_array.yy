/* there is a bug that causes array to return last element in array  as null, eg: [ null ] */

dynamodb_data_array
	: ARRAYLPAR array_list ARRAYRPAR
		{
			if ($2.slice(-1) == "\0") {
				$$ = $2.slice(0,-1)
			} else
				$$ = $2;
		}
	;
array_list
	: array_list COMMA array_value
		{
			$$ = $1 
			$$.push($3); 
		}
	| array_value
		{ $$ = [$1]; }
	;

array_value
	:
		{ $$ = "\0" }
	| dynamodb_data_number
		{ $$ = $1 }
	| dynamodb_data_string
		{ $$ = $1 }
	| dynamodb_data_boolean
		{ $$ = $1 }
	| dynamodb_data_null
		{ $$ = $1 }
	| dynamodb_data_array
		{ $$ = $1 }
	| dynamodb_data_json
		{ $$ = $1 }
	;
