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
var db = require('dynamodb-sql')(new AWS.DynamoDB());
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
VALUE for partition_key and sort_key can be string or number, all other attributes can be string, number, boolean, array, object, null or any nested combination of these

Insert will fail if another item with same key exists 


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

VALUE for partition_key and sort_key can be string or number, all other attributes can be string, number, boolean, array, object, null or any nested combination of these

Update will fail if the key specified in WHERE does not exist

WHERE condition must match the exact partition or partition/sort definition, UPDATE will only update one item!

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


###### Replace

Inserts the item if it does not exists or fully replaces it.

```
REPLACE INTO 
    tbl_name 
SET 
     partition_key = <VALUE>, sort_key = <VALUE> [, other_key = <VALUE>, ... ]
```
```
REPLACE INTO users SET
    domain         = 'test.com',
    user           = 'testuser',
    pending_delete = true
```

###### Delete

WHERE condition must match the exact partition or partition/sort definition, DELETE will only delete one item!

```
DELETE FROM 
    tbl_name 
WHERE 
    partition_key = <VALUE> AND sort_key = <VALUE>
```

###### Select

for sort_key in WHERE OP can be: =, <, >, <= or >=

```
SELECT
    *
FROM
    tbl_name 
WHERE 
    partition_key = <VALUE> 
    [ AND sort_key OP <VALUE> ]

[ HAVING attribute OP <VALUE> [ AND attribute OP <VALUE> ] ]
[ DESC ]
[ LIMIT <number> ]
```

```
SELECT * FROM users WHERE  domain = 'test.com' AND user = 'testuser'

SELECT * FROM stats WHERE  domain = 'test.com' AND date <= '2016-01-01 23:59:59 HAVING pageviews > 0 DESC LIMIT 5'


```
