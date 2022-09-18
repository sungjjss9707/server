var express = require('express'); 
const jwt = require('jsonwebtoken');
var new_issue = require('../routes/issue');
var con;
var db = require('mysql2/promise');
var mysql = require('../config');
var inform = mysql.inform;

var del_query = async function(mil_num){
	con =  await db.createConnection(inform);
	var sql = "delete from refresh_token where mil_num='"+mil_num+"';";
    try{
        console.log(sql);
        const [row1, field1] = await con.query(sql);
        return true;
    }catch(error){
        return false;
    }
}

exports.del_query = del_query;
