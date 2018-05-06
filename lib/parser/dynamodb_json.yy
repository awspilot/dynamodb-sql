
dynamodb_data_json
	: JSONLPAR dynamodb_data_json_list JSONRPAR
		{ 
			var $kv = {}
			if ($2) {
				$2.map(function(v) {
					if (v)
						$kv[v[0]] = v[1]
				})
			}
			$$ = $kv
		}
	;

dynamodb_data_json_list
	: dynamodb_data_json_list COMMA dynamodb_data_json_kv
		{ $$ = $1; $$.push($3); }
	| dynamodb_data_json_kv
		{ $$ = [$1]; }
	;

dynamodb_data_json_kv
	:
		{ $$ = undefined; }
	| name COLON dynamodb_data_number
		{ $$ = [$1, $3 ] }
	| name COLON dynamodb_data_string
		{ $$ = [$1, $3 ] }
	| name COLON dynamodb_data_boolean
		{ $$ = [$1, $3 ] }
	| name COLON dynamodb_data_null
		{ $$ = [$1, $3 ] }
	| name COLON dynamodb_data_array
		{ $$ = [$1, $3 ] }
	| name COLON dynamodb_data_json
		{ $$ = [$1, $3 ] }
	;
