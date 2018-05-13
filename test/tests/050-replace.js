

describe('replace', function () {
	it('hash_range: should replace when item exists', function(done) {
		DynamoSQL.query("	REPLACE INTO `table_hash_string_range_number`        \n" +
						"	SET                                      \n" +
						"		`hash` =  'hash1',                   \n" +
						"		`range` =  1,                        \n" +
						"		`Anumber`=1,                         \n" +
						"		`Aboolean`=true,                     \n" +
						"		`Anulled`=null,                      \n" +
						"		`Aarray`=[1,2, 3 ],                  \n" +
						"		`Aobject`= { aaa:1,bbb:2, ccc:\" some string \", ddd: {ddd1: 1}, eee: [1,'eee1']} \n" +

						"",  {}, function(err, data ) {

			if (err)
				throw err

			DynamoSQL.db
				.table('table_hash_string_range_number')
				.where('hash').eq('hash1')
				.where('range').eq(1)
				.get(function(err, item) {
					if (err)
						throw err

					assert.equal(item.Anumber, 1)
					assert.equal(item.Aboolean, true)
					assert.equal(item.Anulled, null)
					assert.deepEqual(item.Aarray, [1,2,3])
					done()
				})
		})
	})

	it('hash: should replace when item exists', function(done) {
		DynamoSQL.query("	REPLACE INTO `" + $hashTable + "`        \n" +
						"	SET                                      \n" +
						"		`hash` =  'hash1',                   \n" +
						"		`Anumber`=1,                         \n" +
						"		`Aboolean`=true,                     \n" +
						"		`Anulled`=null,                      \n" +
						"		`Aarray`=[1,2, 3 ],                  \n" +
						"		`Aobject`= { aaa:1,bbb:2, ccc:\" some string \", ddd: {ddd1: 1}, eee: [1,'eee1']} \n" +
						"",  {}, function(err, data ) {

			if (err)
				throw err

			DynamoSQL.db
				.table($hashTable)
				.where('hash').eq('hash1')
				.get(function(err, item) {
					if (err)
						throw err

					assert.equal(item.Anumber, 1)
					assert.equal(item.Aboolean, true)
					assert.equal(item.Anulled, null)
					assert.deepEqual(item.Aarray, [1,2,3])
					done()
				})
		})
	})

	it('hash_range: should replace when item does not exist', function(done) {
		DynamoSQL.query(" REPLACE INTO `table_hash_string_range_number` " +
						" SET                               " +
						"	`hash` =  'hash_inexisting',      " +
						"	`range` =  1,                     " +
						"	something = 1                   ",
						{}, function(err, data ) {

			if (err)
				throw err

			DynamoSQL.db
				.table('table_hash_string_range_number')
				.where('hash').eq('hash_inexisting')
				.where('range').eq(1)
				.get(function(err, item) {
					if (err)
						throw err

					assert.equal(item.something, 1)
					done()
				})

		})
	})
	it('hash: should replace when item does not exist', function(done) {
		DynamoSQL.query(" REPLACE INTO `" + $hashTable + "` " +
						" SET                               " +
						"	`hash` =  'hash_inexisting',      " +
						"	something = 1                   ",
						{}, function(err, data ) {

			if (err)
				throw err

			DynamoSQL.db
				.table($hashTable)
				.where('hash').eq('hash_inexisting')
				.get(function(err, item) {
					if (err)
						throw err

					assert.equal(item.something, 1)
					done()
				})

		})
	})
})
