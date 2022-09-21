var mysql = require('mysql2/promise');

var inform = {
    host : "localhost",
    user : "sjh",
    password : "password",
    port : 3306,
    database : "SERVER_DB",
    dateStrings: 'date'
};

exports.secret = 'sjh_secret';
exports.access_time = "15m";
exports.refresh_time = "1d";
exports.inform = inform;
/*
module.exports = {
    'secret' : 'sjh_secret'
};
*/


