const mysql = require('mysql2')

module.exports = mysql.createConnection({
    host: 'localhost',
    user: 'guest',
    password: 'guest',
    database: 'fire-hall',
    port: 8889,

})