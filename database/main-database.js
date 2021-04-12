const mysql = require('mysql2')

module.exports = mysql.createConnection({
    host: 'localhost',
    user: 'user',
    password: 'user',
    database: 'fire-hall',
    port: 8889,

})