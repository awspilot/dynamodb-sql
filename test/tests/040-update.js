describe('update', function () {
	it('hash_range: should update existing item', function(done) {
		DynamoSQL.query("\
			UPDATE `table_hash_string_range_number` 			\
			SET 									\
				number=2,							\
				test_increment += 5,				\
				boolean=false,						\
				array= [ 1,2,3,4 ], 				\
				new = 'new_item',	 				\
				object= { key : {subkey: 1 } },		\
				delete_me = undefined				\
			WHERE 									\
				hash = 'hash1' and	 				\
				range = 1							\
			", {}, function(err, data ) {
			if (err)
				throw err

			DynamoSQL.db
				.table('table_hash_string_range_number')
				.where('hash').eq('hash1')
				.where('range').eq(1)
				.get(function(err, item) {
					if (err)
						throw err

					//console.log(item,null,"\t")
					assert.equal(item.number, 2)
					assert.equal(item.test_increment, 6)
					assert.equal(item.boolean, false)
					assert.equal(item.nulled, null)
					assert.deepEqual(item.array, [1,2,3,4])
					assert.deepEqual(item.object, { key : {subkey: 1 } })

					assert.equal(item.new, 'new_item')
					done()
				})
		})
	})
	it('hash: should update existing item', function(done) {
		DynamoSQL.query("update `" + $hashTable + "` set `number`=2,`boolean`=false, `array`= [ 1,2,3,4 ], `new` = 'new_item', object= { key : {subkey: 1 } } where `hash` = 'hash1' ", {}, function(err, data ) {
			if (err)
				throw err

			DynamoSQL.db
				.table($hashTable)
				.where('hash').eq('hash1')
				.get(function(err, item) {
					if (err)
						throw err

					assert.equal(item.number, 2)
					assert.equal(item.boolean, false)
					assert.equal(item.nulled, null)
					assert.deepEqual(item.array, [1,2,3,4])
					assert.deepEqual(item.object, { key : {subkey: 1 } })

					assert.equal(item.new, 'new_item')
					done()
				})
		})
	})
})
