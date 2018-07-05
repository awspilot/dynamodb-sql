

#dynamodb-sql



[![npm version](https://badge.fury.io/js/%40awspilot%2Fdynamodb-sql.svg)](https://badge.fury.io/js/%40awspilot%2Fdynamodb-sql) 
[![Build Status](https://travis-ci.org/awspilot/dynamodb-sql.svg?branch=master)](https://travis-ci.org/awspilot/dynamodb-sql) 
[![Downloads](https://img.shields.io/npm/dm/@awspilot/dynamodb-sql.svg?maxAge=2592000)](https://www.npmjs.com/package/@awspilot/dynamodb-sql) 
[![Downloads](https://img.shields.io/npm/dy/@awspilot/dynamodb-sql.svg?maxAge=2592000)](https://www.npmjs.com/package/@awspilot/dynamodb-sql) 
[![Downloads](https://img.shields.io/npm/dt/@awspilot/dynamodb-sql.svg?maxAge=2592000)](https://www.npmjs.com/package/@awspilot/dynamodb-sql) 
![License](https://img.shields.io/github/license/awspilot/dynamodb-sql.svg)
[![Dependencies](https://david-dm.org/awspilot/dynamodb-sql.svg)](https://david-dm.org/awspilot/dynamodb-sql) 



## Install

```
npm install @awspilot/dynamodb-sql
```

## Init


```
var db = require('@awspilot/dynamodb-sql')({
    "accessKeyId": "XXXXXXXXXXXXXXXX",
    "secretAccessKey": "ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ",
    "region": "eu-west-1"
})

or

var AWS = require('aws-sdk');
var db = require('@awspilot/dynamodb-sql')(new AWS.DynamoDB());
```

## Execute Queries

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

## Comments

dynamodb-sql supports the following comment style
```

/* this is an in-line comment */

/*
this is a
multiple-line comment
*/

```

## SQL Operations

### List Tables

```

SHOW TABLES

```

### Describe Table

```

DESCRIBE TABLE tbl_name

```


### Create Table

DATA_TYPE can be STRING or NUMBER

provision throughput defaults to 1 1 for both table and GSI

index projection defaults to all attributes


```

CREATE TABLE tbl_name (
	partition_key DATA_TYPE,
	[ sort_key DATA_TYPE, ]
	[ gsi_partition_key DATA_TYPE [ , gsi_sort_key DATA_TYPE ] ,]
	[ lsi_sort_key DATA_TYPE, ]
	PRIMARY KEY( partition_key [, sort_key ] ) [ THROUGHPUT number number ] ,
	[ ,
		INDEX indexname GSI ( gsi_partition_key [, gsi_sort_key ] )
		[ PROJECTION ALL | KEYS_ONLY | ( atr1, atr2 [, atr3 ]) ]
		[ THROUGHPUT NUMBER NUMBER ]
	]
	[ ,
		INDEX indexname LSI ( partition_key , lsi_sort_key )
		[ PROJECTION ALL | KEYS_ONLY | ( atr1, atr2 [, atr3 ]) ]
	]
	[ , more index defintions ]
)

```

Create table with partition key only, default throughput is 1 read/s 1 write/s

```

CREATE TABLE tbl_name (
    hash_key STRING,
    PRIMARY KEY ( hash_key )
)

```

Create table with partition and sort key, specifying throughput

```

CREATE TABLE tbl_name (
    hash_key STRING,
    range_key NUMBER,
    PRIMARY KEY ( hash_key, range_key  ) THROUGHPUT 5 5
)

```

Create table with Global Seconday Index and Local Secondary Index and throughput for GSI

```

CREATE TABLE messages (
    user STRING,
    message_id STRING,
    shared_with STRING,
    starred NUMBER,
    PRIMARY KEY ( user, message_id ),
    INDEX shared GSI ( shared_with, message_id ) PROJECTION KEYS_ONLY,
    INDEX starred LSI ( user, starred ),
    INDEX test GSI ( alternate_partition ) PROJECTION ( starred, folder ) THROUGHPUT 9 9
)

```

### Delete Index

Only supported for GSI type indexes

```

DROP index idx_name ON tbl_name

```



### Delete Table

```

DROP TABLE tbl_name

```

### Insert
VALUE for partition_key and sort_key can be string or number, all other attributes can be string, number, boolean, array, object, null or any nested combination of these

Insert will fail if another item with same key exists


```

INSERT INTO
    tbl_name
SET
    partition_key = <VALUE>,
    sort_key = <VALUE>
    [, other_key = <VALUE>, ... ]

or 

INSERT INTO
    tbl_name
VALUES
    ( <JSON> )
    [, ( <JSON> ) , ... ]
```
```

	INSERT INTO `users` SET
		`domain`        = 'test.com',
		`user`          = 'testuser',
		`email`         = "testuser@test.com",
		`password`      = 'qwert',
		`created_at`    = 1468137790,
		`updated_at`    = null,
		`active`        = false,
		`tags`          = new StringSet(['dev','nodejs']),
		`lucky_numbers` = new NumberSet([ 12, 23 ]),
		`profile`       = {
			`name`: "Demo Account",
			`contact` : {
				`phone`: ["+1 (908) 866 6336"],
				`emails`: ["testuser@test.com", "demo.test@test.com"]
			}
		},
		subscriptions = [{
			newsletter_id: 1234,
			interval: 'daily',
		},{
			newsletter_id: 1234,
			interval: 'weekly',
		}]

	// insert up to 25 items
	INSERT INTO `users` VALUES
		( "domain": 'test.com', "user": 'testuser1', "active": true),
		( "domain": 'test.com', "user": 'testuser2', "active": false)

```

### Update

VALUE for partition_key and sort_key can be string or number, all other attributes can be string, number, boolean, array, object, null or any nested combination of these

Update will fail if the key specified in WHERE does not exist

WHERE condition must match the exact partition or partition/sort definition, UPDATE will only update one item!

Delete an item attribute by setting its value to undefined ( not "undefined" )

OP can be "=" or "+="

Increment an item's value by using attribute += value, attribute = attribute + value is not supported yet

```

UPDATE
    tbl_name
SET
    key1 OP <VALUE> [, key2 OP <VALUE>, ... ]
WHERE
    partition_key = <VALUE> AND sort_key = <VALUE>

```

```

UPDATE
    users
SET
    `active`          = true,
	`nulled`          = null,
	`updated_at`      = 1468137844,
	`activation_code` = undefined,
	`login_count`    += 1,
	`list`            = ['a',1,true, null, {}, [] ],
	`map`             = {
		nonkeyword = 'value1',
		"sqlkeyword1" = 'value2',
		'sqlkeyword2' = 'value3'
	},
	`tags`            = new StringSet(['dev','nodejs']),
	`lucky_numbers`   = new NumberSet([ 12, 23 ])
WHERE
	domain = 'test.com' AND user = 'testuser'

```


### Replace

Inserts the item if it does not exists or fully replaces it.

```

REPLACE INTO
	tbl_name
SET
	partition_key = <VALUE>, sort_key = <VALUE> [, other_key = <VALUE>, ... ]

```

```

REPLACE INTO 
	`users`
SET
	`domain`  = 'test.com',
	`user`    = 'testuser',

	`string`  = 'text', 
	`number`  = 1,
	`boolean` = true,
	`array`   = ['a',1,true,null],
	`object`  = { 
		'string': 'text',
		'number': 1,
		'bool'  : true,
		'null'  : null, 
	},
	`null`    = null,
	ss = new StringSet(['a','b','c']), 
	ns = new NumberSet([1,2,3])

```

### Delete

WHERE condition must match the exact partition or partition/sort definition, DELETE will only delete one item!

```

DELETE FROM
    tbl_name
WHERE
    partition_key = <VALUE> AND sort_key = <VALUE>

```

### Select

for sort_key in WHERE OP can be:
* =  equal
* <  less than
* \>  greater than
* <= less then or equal
* \>= greater than or equal
* BEGINS_WITH
* BETWEEN

```

SELECT
    [ * | field [, field ] ]
FROM
    tbl_name
[ USE INDEX index_name ]
WHERE
    partition_key = <VALUE>
    [ AND sort_key OP <VALUE> ]

[ HAVING attribute OP <VALUE> [ AND attribute OP <VALUE> ] ]
[ DESC ]
[ LIMIT <number> ]
[ CONSISTENT_READ ]

```

```

SELECT
    *
FROM
    users
WHERE
    domain = 'test.com' AND
    user = 'testuser'

```

```

SELECT
    ip, browser
FROM
    stats
WHERE
    domain = 'test.com' AND
    date BETWEEN [ '2016-01-01 00:00:00', '2016-01-01 23:59:59' ]
HAVING
    pageviews > 0 AND
    visitors > 0
DESC
LIMIT 5
CONSISTENT_READ

```

### Scan

```
SCAN * FROM users_table
SCAN username,password FROM users_table
```


## ToDo
- General
	- [ ] support for binary data type
	- [ ] support for stringSet and numberSet
	- [ ] placeholder for values for all SQL operations ( attribute = :value )
	- [ ] promises

- CREATE TABLE
	- [x] CREATE TABLE support
	- [x] support GSI and LSI
	- [x] support projection definition
	- [x] THROUGHPUT support

- INSERT
	- [x] String, Number, List, Map, Null, Boolean support  
	- [x] StringSet, NumberSet support
	- [x] INSERT IGNORE support
	- [x] `INSERT INTO tbl_name VALUES [{},{},{}] ` batch insert
	- [ ] `INSERT INTO tbl_name VALUES [{},{},{}] ` StringSet, NumberSet support
	- [ ] BinarySet support
	- [ ] Conditional insert
	- [ ] ON DUPLICATE KEY UPDATE

- UPDATE
	- [x] String, Number, List, Map, Null, Boolean support
	- [x] StringSet, NumberSet support
	- [x] increment support
	- [x] UPDATE: delete attribute support
	- [ ] StringSet, NumberSet add remove items
	- [ ] conditional update
	- [ ] placeholder for values ( attribute = :value )


- REPLACE
	- [x] String, Number, List, Map, Null, Boolean support
	- [x] StringSet, NumberSet support
	- [ ] REPLACE: conditional replace
	- [ ] REPLACE: return all_old/updated_old/all_new/updated_new

- SELECT
	- [ ] `SELECT * FROM tbl_name` should do SCAN
	- [ ] `SELECT * FROM tbl_name  CONTINUE { hash: 'aaa', range: 5 }`
	- [x] `SELECT field1, field1 FROM tbl_name`
	- [ ] `SELECT field AS alias FROM tbl_name`	
	- [ ] `SELECT PROJECTED FROM tbl_name`
	- [x] `SELECT * FROM tbl_name HAVING key1=val AND key2 >= 5`
	- [ ] `SELECT * FROM tbl_name HAVING boolean = true` boolean support
	- [ ] `SELECT * FROM tbl_name HAVING string CONTAINS 'text'` CONTAINS support for string
	- [ ] `SELECT * FROM tbl_name HAVING string NOT CONTAINS 'text'` NOT CONTAINS support for string
	- [ ] `SELECT * FROM tbl_name HAVING array  CONTAINS ...` CONTAINS support for Array, StringSet, NumberSet
	- [ ] `SELECT * FROM tbl_name HAVING field NULL` NULL support
	- [ ] `SELECT * FROM tbl_name HAVING field NOT NULL` NULL support
	
	- [ ] `SELECT * FROM tbl_name HAVING key1=val OR key2 >= 5` OR support
	- [ ] `SELECT * FROM tbl_name HAVING key1=val AND key2 IN [ 3,4,5 ] ` IN support
	- [ ] `SELECT * FROM tbl_name HAVING object.array[1].property = true` XPath support
	- [ ] `SELECT count(*) FROM tbl_name`
	- [x] `SELECT * FROM tbl_name CONSISTENT_READ`
	- [x] `SELECT * FROM tbl_name USE INDEX index_name`

- GET
	- [ ] get item and batch get item

- SCAN
	- [x] `SCAN * FROM tbl_name`
	- [ ] `SCAN * FROM tbl_name HAVING key1=val AND key2 >= 5` FILTER support
	- [ ] `SCAN * FROM tbl_name LIMIT 10`
	- [ ] `SCAN * FROM tbl_name CONTINUE { hash: 'aaa', range: 5 }`
	- [x] `SCAN field1, field2 FROM tbl_name`

- SHOW CREATE TABLE
	- [ ] `SHOW CREATE TABLE tbl_name`

- ALTER TABLE
	- [ ] `ALTER TABLE tbl_name ADD INDEX` support for GSI
	- [ ] `ALTER TABLE tbl_name DROP INDEX` support for GSI

- DESCRIBE TABLE
	- [x] `DESCRIBE TABLE tbl_name`

- SHOW TABLES
	- [x] `SHOW TABLES`

- DROP table
	- [x] `DROP TABLE tbl_name`
	- [x] `DROP INDEX idx_name ON tbl_name`












