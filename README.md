[![npm page](https://nodei.co/npm/dynamodb-sql.png?downloads=true&downloadRank=true&stars=true)](https://www.npmjs.com/package/dynamodb-sql)

#dynamodb-sql



[![npm version](https://badge.fury.io/js/dynamodb-sql.svg)](https://badge.fury.io/js/dynamodb-sql)
[![Build Status](https://travis-ci.org/databank/dynamodb-sql.svg?branch=master)](https://travis-ci.org/databank/dynamodb-sql)
[![Chat ](https://badges.gitter.im/databank/dynamodb-sql.png)](https://gitter.im/databank/dynamodb-sql)

##### Install

```
npm install dynamodb-sql
```

##### Init


```
var db = require('dynamodb-sql')({
    "accessKeyId": "XXXXXXXXXXXXXXXX",
    "secretAccessKey": "ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ",
    "region": "eu-west-1"
})

or 

var AWS = require('aws-sdk');
var db = require('aws-dynamodb')(new AWS.DynamoDB());
```

##### Execute Queries
```
db.query($query)
or
db.query( $query, callback )
```

```
db.query(
    "   INSERT INTO                 " +
    "       users                   " +
    "   SET                         " +
    "       id='user@host',         " + 
    "       userame=\"userhost\",   " +
    "       password=\"qwert\"      ", 
    function(err, data) {
        console.log( err, data )
    })
```

###### Insert

```
INSERT INTO 
    tbl_name 
SET 
    partition_key = <VALUE>, sort_key = <VALUE> [, other_key = <VALUE>, ... ]
```
```
INSERT INTO users SET
  domain     = 'test.com',
  user       = 'testuser',
  email      = \"testuser@test.com\",
  password   = 'qwert',
  created_at = 1468137790,
  updated_at = null,
  active     = false,
  profile    = { 
                name: "Demo Account", 
                contact :{ 
                  phone: ["+1 (908) 866 6336"], 
                  emails: ["testuser@test.com", "demo.test@test.com"] 
                }
              }
```

###### Update
```
UPDATE 
    tbl_name 
SET 
    key1=<VALUE> [, key2=<VALUE>, ... ] 
WHERE 
    partition_key = <VALUE> AND sort_key = <VALUE>
```
```
UPDATE 
    users 
SET 
    active=true, updated_at=1468137844 
WHERE 
    domain = 'test.com' AND user = 'testuser'
```
