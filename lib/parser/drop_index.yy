
drop_index_stmt
	: DROP INDEX database_index_name ON database_table_name
		{
			$$ = {statement: 'DROP_INDEX' };
			yy.extend($$,$3);
			yy.extend($$,$5);
		}
	;