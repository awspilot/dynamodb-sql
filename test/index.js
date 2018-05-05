require('./lib/common')

require("./tests/010-createTable.js")
run_test('TABLES', 'test/res/020-showTables.yaml' )
run_test('INSERT', 'test/res/030-insert.yaml' )
run_test('UPDATE', 'test/res/040-update.yaml' )

require("./tests/050-replace.js")
require("./tests/060-delete.js")
run_test('SELECT', 'test/res/080-query.yaml' )
require("./tests/999-deleteTable.js")
//require("./tests/090-scan.js")
