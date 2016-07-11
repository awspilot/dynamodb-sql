

describe('replace', function () {
	it('should replace when item exists', function(done) {
		DynamoSQL.query("	REPLACE INTO `" + $tableName + "`        \n" +
						"	SET                                      \n" +
						"		`Anumber`=1,                         \n" +
						"		`Aboolean`=true,                     \n" +
						"		`Anulled`=null,                      \n" +
						"		`Aarray`=[1,2, 3 ],                  \n" +
						"		`Aobject`= { aaa:1,bbb:2, ccc:\" some string \", ddd: {ddd1: 1}, eee: [1,'eee1']}, \n" +
						"		`Astring_set`=:string_set,           \n" +
						"		`Anumber_set`=:number_set            \n" +
						"	WHERE                                    \n" +
						"		`hash` =  'hash1' AND `range` =  1   \n",  {}, function(err, data ) {

			if (err)
				throw err

			DynamoSQL.db
				.table($tableName)
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
	it('should throw error on when item does not exist', function(done) {
		//DynamoSQL.db.on('beforeRequest', console.log)
		DynamoSQL.query(" REPLACE INTO `" + $tableName + "` " +
						" SET                               " +
						"	something = 1                   " +
						" WHERE                             " +
						"	hash =  'hash_inexisting' AND   " +
						"	range =  1                      ",
						{}, function(err, data ) {

			//console.log("finished 2nd query", err, data )
			if (err && err.code === 'ConditionalCheckFailedException')
				return done()

			if (err)
				throw err || 'expected to throw ConditionalCheckFailedException'

		})
	})
})
