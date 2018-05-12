require('./lib/common')

require("./tests/010-createTable.js")
run_test('TABLES', 'test/res/020-showTables.yaml' )
run_test('INSERT', 'test/res/030-insert.yaml' )
run_test('UPDATE', 'test/res/040-update.yaml' )

require("./tests/050-replace.js")
run_test('DELETE', 'test/res/060-delete.yaml' )
run_test('SELECT', 'test/res/080-query.yaml' )
run_test('SCAN', 'test/res/090-scan.yaml' )
require("./tests/999-deleteTable.js")

