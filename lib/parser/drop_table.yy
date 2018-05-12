
drop_table_stmt
	: DROP TABLE dynamodb_table_name
		{
			$$ = {
				statement: 'DROP_TABLE',
				dynamodb: {
					TableName: $3
				}
			};
		}
	;