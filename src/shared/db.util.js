const mysql = require('mysql');

const dbCom = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'telehealth',
});

module.exports = dbCom;
