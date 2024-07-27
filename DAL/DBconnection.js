var mysql = require('mysql2');

var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    database: "nodeproject"
});

con.connect(e => {
    if (e) throw e;
    console.log("Connected to database");
});

module.exports = con;
