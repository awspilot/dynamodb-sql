describe('query', function () {

    xit('prepare data for query', function (done) {
        async.parallel([
            function (cb) {
                DynamoSQL.query("\
							INSERT INTO `" + $tableName + "` 									\
							SET 																\
							`hash` =  'query',													\
							`range` =  1,														\
							`gsi_string` =  'gsi.com.domain',									\
							`lsi_string` =  'lsi.com.domain',									\
							`number`=1,															\
							`string` = \"one two three\", 										\
							`array`= [1,2,3,4],													\
							`object` = {aaa:1,bbb:2, ccc:3, ddd: {ddd1: 1}, eee: [1,'eee1']}, 	\
							`boolean`=true,														\
							`nulled`=null,														\
							`string_set`=:string_set,											\
							`number_set`=:number_set											\
							", {}, function (err, data) {
                    cb(err)
                })
            },
            function (cb) {
                DynamoSQL.query("\
							INSERT INTO `" + $tableName + "` 									\
							SET 																\
							`hash` =  'query',													\
							`range` =  2,														\
							`gsi_string` =  'gsi.com.subdomain',								\
							`lsi_string` =  'lsi.com.subdomain',								\
							`number`=  2,														\
							`string` = \"one two three four\",									\
							`array`= [1,2,3,4],													\
							`object` = {aaa:1,bbb:2, ccc:3, ddd: {ddd1: 1}, eee: [1,'eee2']}, 	\
							`boolean`=true,														\
							`nulled`=null,														\
							`string_set`=:string_set,											\
							`number_set`=:number_set											\
							", {}, function (err, data) {
                    cb(err)
                })
            },
            function (cb) {
                DynamoSQL.query("\
							INSERT INTO `" + $tableName + "` 									\
							SET 																\
							`hash` =  'query',													\
							`range` =  99,														\
							`gsi_string` =  'gsi.org.wikipedia',									\
							`lsi_string` =  'lsi.org.wikipedia',									\
							`number`=  3,														\
							`string` = \"three four five\",										\
							`array`= [1,2,3,4],													\
							`object` = {aaa:1,bbb:2, ccc:3, ddd: {ddd1: 1}, eee: [1,'eee1']}, 	\
							`boolean`=true,														\
							`nulled`=null,														\
							`string_set`=:string_set,											\
							`number_set`=:number_set											\
							", {}, function (err, data) {
                    cb(err)
                })
            }
        ], function (err) {
            if (err)
                throw err

            done()
        })
    })

    xit('where without index field - show error use `having`', () => {
        return DynamoSQL.queryp(`
                select * from ${$tableName} where a=1
        `).then(args => {
            var [err, data] = args
            if (err && err.stack && (err.stack.indexOf("Use 'having' insted of 'where'") != -1)) {
                return true
            } else {
                throw "wrong error message"
            }

        })
    })

    xit('Promise call', function (done) {
        DynamoSQL.queryp("						\
			SELECT *  							\
			FROM `" + $tableName + "`		\
			", {}).then(args => {
            console.log("args", args)
            done();
        })
    })

    xit('SELECT * FROM ' + $tableName + ' without where', function (done) {
        DynamoSQL.query("						\
			SELECT *  							\
			FROM `" + $tableName + "`		\
			", {}, function (err, data) {
            if (err)
                throw err
            done();
            //console.log(JSON.stringify(data,null,"\t"))
        })
    })

    xit('SELECT * FROM ' + $tableName + ' with where and having', function (done) {
        DynamoSQL.query("						\
			SELECT *  							\
			FROM `" + $hashTable + "`		\
			having number = 2		\
			", {}, function (err, data) {
            if (err)
                throw err
            if (data.length != 1) {
                throw "Result not filtered"
            }
            done()
        })
    })

    xit('SELECT * FROM ' + $tableName, function (done) {
        DynamoSQL.query("						\
			SELECT * 							\
			FROM `" + $tableName + "` 			\
			WHERE 								\
				`hash` = 'query' AND 			\
				range > 0 						\
			HAVING 								\
				number between [ 0, 1 ] AND 	\
				boolean = true AND 				\
				string begins_with 'one' 		\
			DESC 								\
			LIMIT 5								\
			CONSISTENT_READ						\
			", {}, function (err, data) {
            if (err)
                throw err
            //console.log(JSON.stringify(data,null,"\t"))
            done()
        })
    })

    xit('SELECT * FROM ' + $tableName + ' USE INDEX gsi_string', function (done) {
        DynamoSQL.query("							\
			SELECT * 								\
			FROM `" + $tableName + "`				\
			USE INDEX gsi_string					\
			WHERE 									\
				`hash` = 'query' AND 				\
				gsi_string begins_with 'gsi.org.'	\
			HAVING 									\
				number between [ 0, 10 ] AND 		\
				boolean = true AND 					\
				string begins_with 'one' 			\
			DESC 									\
			LIMIT 5									\
			", {}, function (err, data) {
            if (err)
                throw err

            //console.log(JSON.stringify(data,null,"\t"))
            assert.equal(data.length, 1)
            done()
        })
    })

    xit('SELECT * FROM ' + $tableName + ' USE INDEX lsi_string', function (done) {
        DynamoSQL.query("							\
			SELECT * 								\
			FROM `" + $tableName + "`				\
			USE INDEX lsi_string					\
			WHERE 									\
				`hash` = 'query' AND 				\
				lsi_string begins_with 'lsi.org.'	\
			HAVING 									\
				number between [ 0, 10 ] AND 		\
				boolean = true AND 					\
				string begins_with 'one' 			\
			DESC 									\
			LIMIT 5									\
			", {}, function (err, data) {
            if (err)
                throw err
            assert.equal(data.length, 1)
            //console.log(JSON.stringify(data,null,"\t"))
            done()
        })
    })

    it('SELECT * Fand scan multiple pages (integration test in remark)', function (done) {
        DynamoSQL.query(`						
			SELECT *  							
			FROM projects
			having projectName = 'ga-api' 
					
			`, {}, function (err, data) {
            //			having ExpressionAttributeValues = 'error'

            //mgoyal@zendesk.com
            if (err)
                throw err
            // if (data.length != 1) {
            //     throw "Result not filtered"
            // }
            done()
        })
    })

    /*
    it('.where(RANGE).le()', function(done) {
        DynamoDB
            .table($tableName)
            .where('hash').eq('query')
            .where('range').le(99)
            .query( function(err, data) {
                if (err)
                    throw err

                if (data.length !== 3)
                    throw "expected 3 got " + data.length

                done()
            })
    })
    */
    /*
    it('.where(RANGE).lt()', function(done) {
        DynamoDB
            .table($tableName)
            .where('hash').eq('query')
            .where('range').lt(99)
            .query( function(err, data) {
                if (err)
                    throw err

                if (data.length !== 2)
                    throw "expected 2 got " + data.length

                done()
            })
    })
    */
    /*
    it('.where(RANGE).ge()', function(done) {
        DynamoDB
            .table($tableName)
            .where('hash').eq('query')
            .where('range').ge(2)
            //.on('beforeRequest', function(op, payload) {
            //	console.log(op, JSON.stringify(payload,null,"\t"))
            //})
            .query( function(err, data) {
                if (err)
                    throw err

                if (data.length !== 2)
                    throw "expected 2 got " + data.length

                done()
            })
    })
    */
    /*
    it('.where(RANGE).gt()', function(done) {
        DynamoDB
            .table($tableName)
            .where('hash').eq('query')
            .where('range').gt(2)
            //.on('beforeRequest', function(op, payload) {
            //	console.log(op, JSON.stringify(payload,null,"\t"))
            //})
            .query( function(err, data) {
                if (err)
                    throw err

                if (data.length !== 1)
                    throw "expected 1 got " + data.length

                done()
            })
    })
    */
    /*
    it('.where(RANGE).between()', function(done) {
        DynamoDB
            .table($tableName)
            .where('hash').eq('query')
            .where('range').between(2,99)
            //.on('beforeRequest', function(op, payload) {
            //	console.log(op, JSON.stringify(payload,null,"\t"))
            //})
            .query( function(err, data) {
                if (err)
                    throw err

                if (data.length !== 2)
                    throw "expected 2 got " + data.length

                done()
            })
    })
    */

    /* No begins with for type N
    it('.where(RANGE).begins_with()', function(done) {
        DynamoDB
            .table($tableName)
            .where('hash').eq('query')
            .where('range').begins_with(1)
            .on('beforeRequest', function(op, payload) {
                console.log(op, JSON.stringify(payload,null,"\t"))
            })
            .query( function(err, data) {
                if (err)
                    throw err

                if (data.length !== 2)
                    throw "expected 2 got " + data.length

                done()
            })
    })
    */
    /*
    it('.select().where().having().query()', function(done) {
        DynamoDB
            .table($tableName)
            .select('hash','range','number','object.ccc','object.ddd', 'object.eee','string_set[0]', 'number_set[0]','array[0]','array[1]','array[2]')
            .where('hash').eq('query')
            .where('range').gt(0)
            .having('object.ccc').eq(3)
            //.having('number').eq(1)
            .having('number').ne(99)
            .having('array[1]').between(0,2)
            .having('array[2]').in([3,4,'a'])
            .having('object.eee').not_null()
            .having('object.fff').null()
            .having('object.eee[1]').begins_with('eee')
            .having('object.eee[1]').contains('eee')
            .having('string_set').contains('aaa')
            .having('string_set').not_contains('ddd1')
            //.on('beforeRequest', function(op, payload) {
            //	console.log(op, JSON.stringify(payload,null,"\t"))
            //})
            .query( function(err, data) {
                if (err)
                    throw err

                // @todo: check returned value
                done()
            })
    })
    */

    // having in string
    /*
    it('.select().where().having(string).contains().not_contains().query()', function(done) {
        DynamoDB
            .table($tableName)
            .select('number','string')
            .where('hash').eq('query')
            .having('string').contains('one')
            .having('string').contains('two')
            .having('string').not_contains('four')
            //.on('beforeRequest', function(op, payload) {
            //	console.log(op, JSON.stringify(payload,null,"\t"))
            //})
            .query( function(err, data) {
                if (err)
                    throw err

                //console.log(JSON.stringify(data))
                // @todo: check returned value
                done()
            })
    })
    */
    // having in stringset

    /*
    it('.select().where().having(stringset).contains().not_contains().query()', function(done) {
        DynamoDB
            .table($tableName)
            .select('string_set')
            .where('hash').eq('query')
            .having('string_set').contains('aaa')
            .having('string_set').contains('bbb')
            .having('string_set').not_contains('ddd1')
            //.on('beforeRequest', function(op, payload) {
            //	console.log(op, JSON.stringify(payload,null,"\t"))
            //})
            .query( function(err, data) {
                if (err)
                    throw err

                //console.log(JSON.stringify(data))
                // @todo: check returned value
                done()
            })
    })
    */
})
