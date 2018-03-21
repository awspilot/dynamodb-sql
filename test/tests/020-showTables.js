
describe('SHOW TABLES; DROP INDEX', function () {

	it('SHOW TABLES', function(done) {
		DynamoSQL
			.query("SHOW TABLES", function(err, data) {
				assert.deepEqual(data [$tableName,'test_hash'])
				done()
			})
	});
	xit('DROP INDEX gsi_string ON '+$tableName, function(done) {
		DynamoSQL
			.query("DROP INDEX gsi_string ON "+$tableName, function(err, data) {
				if (err)
					throw err
				//console.log(err, data)
				done()
			})
	});

})
