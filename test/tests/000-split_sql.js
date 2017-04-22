var sqlparser = require('../../lib/sqlparser')
var $ct = "" +
	"CREATE/*asda*/TABLE/*comment*/\"weirdtablename/**/noremovecomment\"(`hash`/* comment */STRING,\"range\"/*comment*/NUMBER,'gsi_\"string' STRING," +
	"/*comment\n\"multiline'/lala*/gsi_number NUMBER,"+
	"`lsi/*(')*/string`/*comment*/STRING/*comment*/,"+
	"'lsi/*[\"]*/number'/*comment*/NUMBER," +
	"\"lsi/*{\\\"}*/number\"/*comment*/NUMBER," +
	"PRIMARY KEY(hash,range)THROUGHPUT 5 5,INDEX gsi_string GSI ( hash, gsi_string)  THROUGHPUT 5 5,"+
	"INDEX gsi_number GSI ( hash, gsi_number ) PROJECTION KEYS_ONLY," +
	"INDEX lsi_string LSI ( hash, lsi_string ) PROJECTION ALL ," +
	"INDEX lsi_number LSI ( hash, lsi_number ) PROJECTION(at1,at2))/*comment*/"

console.log(sqlparser.cleanup_sql($ct ))
