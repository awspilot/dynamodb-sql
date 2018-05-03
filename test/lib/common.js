
async = require('async')
assert = require('assert')

$rangeTable = $tableName = 'table_hash_string_range_number'

$hashTable = 'test_hash'

var dynalite = require('dynalite'),
dynaliteServer = dynalite({ createTableMs: 50,db: require('memdown')})
dynaliteServer.listen(4567, function(err) {
	if (err) throw err
})

var AWS = require('aws-sdk')
DynamoSQL = require('../../lib/dynamodb')( new AWS.DynamoDB({endpoint: 'http://localhost:4567', "accessKeyId": "akid", "secretAccessKey": "secret", "region": "us-east-1" }))
