

describe('insert', function () {
	it('should insert when item does not exist', function(done) {
		DynamoSQL.query(" INSERT INTO `" + $tableName + "` " +
						" SET " +
						"	hash =  'hash1',      \n" +
						"	\"range\" =  1,       \n" +
						"   `number`=1,           \n" +
						"	delete_me=\"aaa aaa\",\n" +
						"   gsi_range= 'a a',     \n" +
						"   array=[1,2, 3 ],      \n" +
						"   object= { aaa:1,bbb:2, ccc:\" some string \", ddd: {ddd1: 1}, eee: [1,'eee1']}, \n" +
						"   string_set=:string_set, \n" +
						"   number_set=:number_set  \n", {}, function(err, data ) {
			if (err)
				throw err

			DynamoSQL.db
				.table($tableName)
				.where('hash').eq('hash1')
				.where('range').eq(1)
				.get(function(err, item) {
					if (err)
						throw err

					//console.log(item)
					done()
				})
		})
	})
})
