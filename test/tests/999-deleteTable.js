
describe('DROP TABLE', function () {
	it('DROP TABLE ' + $tableName, function(done) {
		DynamoSQL.query("DESCRIBE TABLE " + $tableName + "	\
			", function(err, data) {
				if (err) {
					if (err.code === 'ResourceNotFoundException')
						done()
					else
						throw err
				} else {
					DynamoSQL.query("DROP TABLE " + $tableName + "	\
						", function(err, data) {
							if (err)
								throw 'delete failed'
							else
								done()
						})
				}
			})
	});
	it('waiting for ' + $tableName + ' table to delete', function(done) {
		var $existInterval = setInterval(function() {
			DynamoSQL.query("DESCRIBE TABLE " + $tableName + "	\
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
