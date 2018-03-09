async = require('async')
assert = require('assert')

$rangeTable = $tableName = 'test_hash_range'
$hashTable = 'test_hash'
var AWS = require('aws-sdk')
global.awsdynamo = awsDynamo()

if (global.awsdynamo ) {
    console.log("**************** Working with Real Dynamo *********************")
    AWS.config.update({
        region:'us-west-1'
    })
    DynamoSQL = require('../../lib/dynamodb')(
        new AWS.DynamoDB({maxRetries: 0})
    )
} else {
    console.log("**************** Working With Mock Dynamo *********************")
    var port = 4569
    var dynalite = require('dynalite'),
        dynaliteServer = dynalite({createTableMs: 50, db: require('memdown')})
    dynaliteServer.listen(port, function (err) {
        if (err) throw err
    })

    DynamoSQL = require('../../lib/dynamodb')(
        new AWS.DynamoDB({
            endpoint: 'http://localhost:'+port, "accessKeyId": "akid", "secretAccessKey": "secret", "region": "us-east-1"
        })
    )
}

function awsDynamo(){
    return process.argv.filter(function (v,u){
        return v=='awsDynamo'
    }).length
}



