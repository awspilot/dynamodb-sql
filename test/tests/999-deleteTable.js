
describe('DROP TABLE', function () {
	it('DROP TABLE table_hash_string_range_number', function(done) {
		DynamoSQL.query("DESCRIBE TABLE table_hash_string_range_number	\
			", function(err, data) {
				if (err) {
					if (err.code === 'ResourceNotFoundException')
						done()
					else
						throw err
				} else {
					DynamoSQL.query("DROP TABLE table_hash_string_range_number	\
						", function(err, data) {
							if (err)
								throw 'delete failed'
							else
								done()
						})
				}
			})
	});
	it('waiting for table_hash_string_range_number table to delete', function(done) {
		var $existInterval = setInterval(function() {
			DynamoSQL.query("DESCRIBE TABLE table_hash_string_range_number	\
				", function(err, data) {

					if (err && err.code === 'ResourceNotFoundException') {
						clearInterval($existInterval)
						return done()
					}
					if (err) {
						clearInterval($existInterval)
						throw err
					}
				})
		}, 1000)
	})
	it('DROP TABLE ' + $hashTable, function(done) {
		DynamoSQL.query("DESCRIBE TABLE " + $hashTable + "	\
			", function(err, data) {
				if (err) {
					if (err.code === 'ResourceNotFoundException')
						done()
					else
						throw err
				} else {
					DynamoSQL.query("DROP TABLE " + $hashTable + "	\
						", function(err, data) {
							if (err)
								throw 'delete failed'
							else
								done()
						})
				}
			})
	});
	it('waiting for ' + $hashTable + ' table to delete', function(done) {
		var $existInterval = setInterval(function() {
			DynamoSQL.query("DESCRIBE TABLE " + $hashTable + "	\
				", function(err, data) {

					if (err && err.code === 'ResourceNotFoundException') {
						clearInterval($existInterval)
						return done()
					}
					if (err) {
						clearInterval($existInterval)
						throw err
					}
				})
		}, 1000)
	})
})
