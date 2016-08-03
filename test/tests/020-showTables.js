
describe('SHOW TABLES', function () {

	it('list tables', function(done) {
		DynamoSQL
			.query("SHOW TABLES", function(err, data) {
				assert.deepEqual(data ['test_hash_range','test_hash'])
				done()
			})
	});


})
