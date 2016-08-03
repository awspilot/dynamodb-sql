
describe('CREATE TABLE', function () {

	it('deleting ' + $tableName + ' table if exists', function(done) {
		DynamoSQL
			.client
			.describeTable({
				TableName: $tableName
			}, function(err, data) {
				if (err) {
					if (err.code === 'ResourceNotFoundException')
						done()
					else
						throw err
				} else {
					DynamoSQL.db
						.client
						.deleteTable({
							TableName: $tableName
						}, function(err, data) {
							if (err)
								throw 'delete failed'
							else
								done()
						})
				}
			})
	});
	it('deleting ' + $hashTable + ' table if exists', function(done) {
		DynamoSQL
			.client
			.describeTable({
				TableName: $hashTable
			}, function(err, data) {
				if (err) {
					if (err.code === 'ResourceNotFoundException')
						done()
					else
						throw err
				} else {
					DynamoSQL.db
						.client
						.deleteTable({
							TableName: $hashTable
						}, function(err, data) {
							if (err)
								throw 'delete failed'
							else
								done()
						})
				}
			})
	});

	it('waiting for ' + $tableName + ' table to delete (within 25 seconds)', function(done) {
		var $existInterval = setInterval(function() {
			DynamoSQL
				.client
				.describeTable({
					TableName: $tableName
				}, function(err, data) {

					if (err && err.code === 'ResourceNotFoundException') {
						clearInterval($existInterval)
						return done()
					}
					if (err) {
						clearInterval($existInterval)
						throw err
					}

					if (data.TableStatus === 'DELETING')
						process.stdout.write('.')
				})
		}, 1000)
	})
	it('waiting for ' + $hashTable + ' table to delete (within 25 seconds)', function(done) {
		var $existInterval = setInterval(function() {
			DynamoSQL
				.client
				.describeTable({
					TableName: $hashTable
				}, function(err, data) {

					if (err && err.code === 'ResourceNotFoundException') {
						clearInterval($existInterval)
						return done()
					}
					if (err) {
						clearInterval($existInterval)
						throw err
					}

					if (data.TableStatus === 'DELETING')
						process.stdout.write('.')
				})
		}, 1000)
	})

	it('creating table ' + $tableName + ' ', function(done) {
		DynamoSQL.query("\
						CREATE TABLE " + $tableName + " (			\
							hash STRING,							\
							range NUMBER,							\
							gsi_range STRING,						\
							PRIMARY KEY ( hash, range ),			\
							INDEX gsi_index GSI ( hash, gsi_range ) \
						)											\
						", {}, function(err, data ) {
							//console.log("reply from sql create table ",err, JSON.stringify(data,null,"\t"))
				if (err)
					throw err

				if (data.TableDescription.TableStatus === 'CREATING' || data.TableDescription.TableStatus === 'ACTIVE' )
					done()
				else
					throw 'unknown table status after create: ' + data.TableDescription.TableStatus
		})




	})

	it('creating table ' + $hashTable + ' ', function(done) {
		DynamoSQL.query("\
						CREATE TABLE " + $hashTable + " (			\
							hash STRING,							\
							PRIMARY KEY ( hash  )					\
						)											\
						", {}, function(err, data ) {
				if (err) {
					throw err
				} else {
					if (data.TableDescription.TableStatus === 'CREATING' || data.TableDescription.TableStatus === 'ACTIVE' )
						done()
					else
						throw 'unknown table status after create: ' + data.TableDescription.TableStatus
				}
			})
	})

	it('waiting for table ' + $tableName + ' to become ACTIVE', function(done) {
		var $existInterval = setInterval(function() {
			DynamoSQL
				.client
				.describeTable({
					TableName: $tableName
				}, function(err, data) {
					if (err) {
						throw err
					} else {
						//process.stdout.write(".");
						//console.log(data.Table)
						if (data.Table.TableStatus === 'ACTIVE') {
							clearInterval($existInterval)
							done()
						}
					}
				})
		}, 3000)
	})
	it('waiting for table ' + $hashTable + ' to become ACTIVE', function(done) {
		var $existInterval = setInterval(function() {
			DynamoSQL
				.client
				.describeTable({
					TableName: $hashTable
				}, function(err, data) {
					if (err) {
						throw err
					} else {
						//process.stdout.write(".");
						//console.log(data.Table)
						if (data.Table.TableStatus === 'ACTIVE') {
							clearInterval($existInterval)
							done()
						}
					}
				})
		}, 3000)
	})

})
