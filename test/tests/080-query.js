var fs = require('fs')
var yml = yaml.safeLoad(fs.readFileSync('test/res/080-query.yaml', 'utf8'));

//console.log(yml.Tests);

var query_handler = function(idx, done ) {
	return function(done) {
		if (yml.Tests.query[idx].log === true)
			global.DDBSQL = true
		else
			global.DDBSQL = false

		DynamoSQL.query(this.test.title, function(err, data ) {
			if (yml.Tests.query[idx].shouldFail) {
				if (err)
					return done()

				throw 'query expected to fail'
			} else {
				if (err)
					throw err

				if (yml.Tests.query[idx].log === true)
					console.log("result=", JSON.stringify(data, null, "\t"))

				if (yml.Tests.query[idx].results)
					assert.equal(data.length, yml.Tests.query[idx].results)

				if (yml.Tests.query[idx].validations) {
					yml.Tests.query[idx].validations.forEach(function(el) {
						assert.equal(eval( el.key ), eval( el.value ))
					})
				}
				done()
			}
		})
	}
}

describe('query', function () {

	// before(func)
	// beforeEach

	it('prepare data for query', function(done) {
		async.each(yml.Prepare.Data, function(q, cb ) {
			DynamoSQL.query(q, {}, cb )
		}, function(err) {
			if (err)
				throw err

			done()
		})
	})

	it(yml.Tests.query[0].query, query_handler(0) ) // no where, should fail ... will do scan in the future
	it(yml.Tests.query[1].query, query_handler(1) ) // hash = string
	it(yml.Tests.query[2].query, query_handler(2) ) // hash = number
	it(yml.Tests.query[3].query, query_handler(3) ) // hash = .. AND range > ..
	it(yml.Tests.query[4].query, query_handler(4) ) // hash = .. AND range = ..
	it(yml.Tests.query[5].query, query_handler(5) ) // BETWEEN number number
	it(yml.Tests.query[6].query, query_handler(6) ) // BETWEEN string string
	it(yml.Tests.query[7].query, query_handler(7) ) // LIKE
	it(yml.Tests.query[8].query, query_handler(8) ) // USE INDEX
	it(yml.Tests.query[9].query, query_handler(9) ) // LIMIT
	it(yml.Tests.query[10].query, query_handler(10) ) // DESC
	it(yml.Tests.query[11].query, query_handler(11) ) // SELECT field
	it(yml.Tests.query[12].query, query_handler(12) ) // SELECT field, inexistent_field
	it(yml.Tests.query[13].query, query_handler(13) ) // SELECT field , field
	it(yml.Tests.query[14].query, query_handler(14) ) // Select field , STAR <!-- should fail
	it(yml.Tests.query[15].query, query_handler(15) ) // Select field AS alias <- should fail
	
	
	

})
