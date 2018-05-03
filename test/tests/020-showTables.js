
describe('SHOW TABLES; DROP INDEX', function () {

	it('SHOW TABLES', function(done) {
		DynamoSQL
			.query("SHOW TABLES", function(err, data) {
				assert.deepEqual(data ['table_hash_string_range_number','test_hash'])
				done()
			})
	});
	it('DROP INDEX gsi_string ON table_hash_string_range_number', function(done) {
		DynamoSQL
			.query("DROP INDEX gsi_string ON table_hash_string_range_number ", function(err, data) {
				if (err)
					throw err
				//console.log(err, data)
				done()
			})
	});

})
