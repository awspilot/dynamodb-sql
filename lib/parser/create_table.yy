
create_table_stmt
	: CREATE TABLE database_table_name LPAR def_ct_typedef_list COMMA def_ct_pk def_ct_indexes RPAR
		{
			$$ = {
				statement: 'CREATE_TABLE',
				AttributeDefinitions: $5,
			};
			yy.extend($$,$3);
			yy.extend($$,$7); // extend with pk
			yy.extend($$,$8); // extend with indexes
		}
	;


def_ct_indexes
	:
		{ $$ = undefined; }
	| COMMA def_ct_index_list
		{ $$ = { indexes: $2 } }
	;
def_ct_index_list
	: def_ct_index_list COMMA def_ct_index
		{ $$ = $1; $$.push($3); }
	| def_ct_index
		{ $$ = [ $1 ]; }
	;

def_ct_index
	: INDEX name def_ct_index_type LPAR name RPAR def_ct_projection def_ct_throughput
		{ $$ = { name: $2, type: $3, pk: [ $5     ], projection: $7, throughput: $8 }  }
	|  INDEX name def_ct_index_type LPAR name COMMA name RPAR def_ct_projection def_ct_throughput
		{ $$ = { name: $2, type: $3, pk: [ $5, $7 ], projection: $9, throughput: $10 }  }
	;

def_ct_index_type
	: GSI
		{ $$ = 'GSI' }
	| LSI
		{ $$ = 'LSI' }
	;

def_ct_pk
	: PRIMARY KEY LPAR name            RPAR def_ct_throughput
		{ $$ = {pk: [ $4    ], throughput: $6 }  }
	| PRIMARY KEY LPAR name COMMA name RPAR def_ct_throughput
		{ $$ = {pk: [ $4,$6 ], throughput: $8 }  }
	;
def_ct_throughput
	:
		{ $$ = undefined; }
	| THROUGHPUT signed_number signed_number
		{ $$ = [ eval($2), eval($3) ] }
	;

def_ct_projection
	:
		{ $$ = 'ALL'; }
	| PROJECTION ALL
		{ $$ = 'ALL'; }
	| PROJECTION KEYS_ONLY
		{ $$ = 'KEYS_ONLY' }
	| PROJECTION LPAR def_ct_projection_list RPAR
		{ $$ = $3 }
	;

def_ct_projection_list
	: def_ct_projection_list COMMA dynamodb_data_string
		{ $$ = $1; $$.push($3); }
	| dynamodb_data_string
		{ $$ = [$1]; }
	;


def_ct_typedef_list
	: def_ct_typedef_list COMMA def_ct_typedef
		{ $$ = $1; $$.push($3) }
	| def_ct_typedef
		{ $$ = [ $1 ]; }
	;

def_ct_typedef
	: name STRING
		{ $$ = { AttributeName: $1, AttributeType: 'S'}; }
	| name NUMBER
		{ $$ = { AttributeName: $1, AttributeType: 'N'}; }
	;
