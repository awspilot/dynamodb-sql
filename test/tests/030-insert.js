

describe('insert', function () {
	it('hash_range: should insert when item does not exist', function(done) {
		DynamoSQL.query("\
		 				INSERT INTO `" + $tableName + "`	\
						SET									\
							hash =  'hash1',				\
							range =  1,						\
							number = 1,						\
							test_increment = 1,				\
							boolean =true,					\
							nulled = null,					\
							array = [1,2, 3 ],				\
							object= { aaa:1,bbb:2, ccc:\" some string \", ddd: {ddd1: 1}, eee: [1,'eee1']}, \
							string_set=:string_set,			\
							number_set=:number_set,			\
							delete_me = 'delete_me'			\
						", {}, function(err, data ) {
			if (err)
				throw err

			DynamoSQL.db
				.table($tableName)
				.where('hash').eq('hash1')
				.where('range').eq(1)
				.get(function(err, item) {
					if (err)
						throw err

					assert.equal(item.number, 1)
					assert.equal(item.boolean, true)
					assert.equal(item.nulled, null)
					assert.deepEqual(item.array, [1,2,3])
					done()
				})
		})
	})
	it('hash: should insert when item does not exist', function(done) {
		DynamoSQL.query(" INSERT INTO `" + $hashTable + "` " +
						" SET " +
						"	hash =  'hash1',      \n" +
						"   `number`=1,           \n" +
						"   `boolean`=true,       \n" +
						"	`nulled`=null,        \n" +
						"   array=[1,2, 3 ],      \n" +
						"   object= { aaa:1,bbb:2, ccc:\" some string \", ddd: {ddd1: 1}, eee: [1,'eee1']}, \n" +
						"   string_set=:string_set, \n" +
						"   number_set=:number_set  \n", {}, function(err, data ) {
			if (err)
				throw err

			DynamoSQL.db
				.table($hashTable)
				.where('hash').eq('hash1')
				.get(function(err, item) {
					if (err)
						throw err

					assert.equal(item.number, 1)
					assert.equal(item.boolean, true)
					assert.equal(item.nulled, null)
					assert.deepEqual(item.array, [1,2,3])
					done()
				})
		})
	})
	it('hash_range: should throw error on duplicate key', function(done) {
		DynamoSQL.query(" INSERT INTO `" + $tableName + "` " +
						" SET " +
						"	hash =  'hash1',      \n" +
						"	range =  1            \n",
						{}, function(err, data ) {

			if (err && err.code === 'ConditionalCheckFailedException')
				return done()

			if (err)
				throw err || 'expected to throw ConditionalCheckFailedException'

		})
	})
	it('hash: should throw error on duplicate key', function(done) {
		DynamoSQL.query(" INSERT INTO `" + $hashTable + "` " +
						" SET " +
						"	hash =  'hash1'      \n",
						{}, function(err, data ) {

			if (err && err.code === 'ConditionalCheckFailedException')
				return done()

			if (err)
				throw err || 'expected to throw ConditionalCheckFailedException'

		})
	})
})
