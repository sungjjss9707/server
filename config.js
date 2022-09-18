var mysql = require('mysql2/promise');

var inform = {
    host : "localhost",
    user : "root",
    password : "password",
    port : 3306,
    database : "SERVER_DB"
};

exports.secret = 'sjh_secret';
exports.inform = inform;
/*
module.exports = {
    'secret' : 'sjh_secret'
};
*/


