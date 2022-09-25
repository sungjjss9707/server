var express = require('express'); 
var router = express.Router(); 
var db = require('mysql2/promise');
var mysql = require('../config');
var inform = mysql.inform;


var propertyMake = async function(militaryUnit){
    try{
		var con = await db.createConnection(inform);
		var sql = "create table property_"+militaryUnit+" ( id varchar(100), name varchar(100), totalAmount int, unit varchar(20), expirationDate datetime, createdAt datetime, updatedAt datetime, primary key(id) );";
        const [row, field] = await con.query(sql);
        return {success:true};
    }catch(error){
        console.log(error);
        return {success:false, error:error};
    }
}

var paymentLogMake = async function(militaryUnit){
    try{
        var con = await db.createConnection(inform);
		var sql = "create table paymentLog_"+militaryUnit+"( id varchar(100), receiptPayment varchar(20), name varchar(100), amount int,  unit varchar(20), target varchar(100), storagePlace varchar(100), expirationDate varchar(100), confirmor_id varchar(100), property_id varchar(100), property_log_num int, createdAt datetime, updatedAt datetime, primary key(id) );"
        const [row, field] = await con.query(sql);
        return {success:true};
    }catch(error){
        console.log(error);
        return {success:false, error:error};
    }
}

var storagePlaceMake = async function(militaryUnit){
    try{
        var con = await db.createConnection(inform);
        var sql = "create table storagePlace_"+militaryUnit+"( id varchar(150), property_id varchar(100), name varchar(100), amount int, primary key(id) );"
        const [row, field] = await con.query(sql);
        return {success:true};
    }catch(error){
        console.log(error);
        return {success:false, error:error};
    }
}

var propertyDrop = async function(militaryUnit){
    try{
        var con = await db.createConnection(inform);
        var sql = "drop table property_"+militaryUnit+";";
        const [row, field] = await con.query(sql);
        return {success:true};
    }catch(error){
        console.log(error);
        return {success:false, error:error};
    }
}

var paymentLogDrop = async function(militaryUnit){
    try{
        var con = await db.createConnection(inform);
        var sql = "drop table paymentLog_"+militaryUnit+";";
        const [row, field] = await con.query(sql);
        return {success:true};
    }catch(error){
        console.log(error);
        return {success:false, error:error};
    }
}

var storagePlaceDrop = async function(militaryUnit){
    try{
        var con = await db.createConnection(inform);
        var sql = "drop table storagePlace_"+militaryUnit+";";
        const [row, field] = await con.query(sql);
        return {success:true};
    }catch(error){
        console.log(error);
        return {success:false, error:error};
    }
}


exports.propertyMake = propertyMake;
exports.paymentLogMake = paymentLogMake;
exports.storagePlaceMake = storagePlaceMake;
exports.propertyDrop = propertyDrop;
exports.paymentLogDrop = paymentLogDrop;
exports.storagePlaceDrop = storagePlaceDrop;



