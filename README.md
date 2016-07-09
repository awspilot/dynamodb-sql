[![npm page](https://nodei.co/npm/dynamodb-sql.png?downloads=true&downloadRank=true&stars=true)](https://www.npmjs.com/package/dynamodb-sql)

#dynamodb-sql



[![npm version](https://badge.fury.io/js/dynamodb-sql.svg)](https://badge.fury.io/js/dynamodb-sql)
[![Build Status](https://travis-ci.org/databank/dynamodb-sql.svg?branch=master)](https://travis-ci.org/databank/dynamodb-sql)
[![Chat ](https://badges.gitter.im/databank/dynamodb-sql.png)](https://gitter.im/databank/dynamodb-sql)

##### Install

```
npm install dynamodb-sql
```

##### Usage

###### Insert

```
INSERT INTO tbl_name SET partition_key = <VALUE>, sort_key = <VALUE>, [ other_key = <VALUE>, ... ]
```
```
INSERT INTO users SET
  email      = 'test@test.com',
  password   = 'qwert',
  created_at = new Date().getTime(),
  updated_at = null,
  profile    = { 
                name: "Demo Account", 
                contact :{ 
                  phone: ["+1 (908) 866 6336"], 
                  emails: ["test@test.com", "demo.test@test.com"] 
                }
              }
```
