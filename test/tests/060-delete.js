
describe('delete()', function () {
	it('should deleate existing item', function(done) {
		DynamoSQL.query("delete from `" + $tableName + "` where `hash` = 'hash1' and range = 1", {}, function(err, data ) {
			if (err) throw err

			done()
		})
	})

})
