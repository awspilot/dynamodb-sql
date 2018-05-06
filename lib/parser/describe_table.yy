
describe_table_stmt
	: DESCRIBE TABLE database_table_name
		{
			$$ = {statement: 'DESCRIBE_TABLE' };
			yy.extend($$,$3);
		}
	;