var express = require('express'); 
var router = express.Router(); 
var db = require('mysql2/promise');
var mysql = require('../config');
var inform = mysql.inform;


var makeProperty = async function(militaryUnit){
    try{
		var con = await db.createConnection(inform);
		var sql = "create table property_"+militaryUnit+" ( id varchar(100), name varchar(100), amount int, unit varchar(20), storagePlace varchar(100), expirationDate datetime, createdAt datetime, updatedAt datetime, primary key(id) );";
		var param = militaryUnit;
        const [row, field] = await con.query(sql,param);
        return {success:true};
    }catch(error){
        console.log(error);
        return {success:false, error:error};
    }
}

var makeLog = async function(militaryUnit){
    try{
        var con = await db.createConnection(inform);
		var sql = "create table payment_log_"+militaryUnit+"( id varchar(100), receiptPayment varchar(20), name varchar(100), amount int,  unit varchar(20), target varchar(100), storagePlace varchar(100), expirationDate varchar(100), confirmor_id varchar(100), property_id varchar(100), property_log_num int, createdAt datetime, updatedAt datetime, primary key(id) );"
        var param = militaryUnit;
        const [row, field] = await con.query(sql,param);
        return {success:true};
    }catch(error){
        console.log(error);
        return {success:false, error:error};
    }
}

exports.makeProperty = makeProperty;
exports.makeLog = makeLog;
