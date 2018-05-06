
drop_table_stmt
	: DROP TABLE database_table_name
		{
			$$ = {statement: 'DROP_TABLE' };
			yy.extend($$,$3);
		}
	;