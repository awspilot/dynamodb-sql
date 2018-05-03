
describe('delete()', function () {
	it('hash_range: should deleate existing item', function(done) {
		DynamoSQL.query("delete from `table_hash_string_range_number` where `hash` = 'hash1' and range = 1", {}, function(err, data ) {
			if (err) throw err

			DynamoSQL.db
				.table('table_hash_string_range_number')
				.where('hash').eq('hash1')
				.where('range').eq(1)
				.get(function(err, item) {
					if (err)
						throw err

					assert.deepEqual(item, {})
					done()
				})
		})
	})
	it('hash: should deleate existing item', function(done) {
		DynamoSQL.query("delete from `" + $hashTable + "` where `hash` = 'hash1'", {}, function(err, data ) {
			if (err) throw err

			DynamoSQL.db
				.table($hashTable)
				.where('hash').eq('hash1')
				.get(function(err, item) {
					if (err)
						throw err

					assert.deepEqual(item, {})
					done()
				})
		})
	})
})
