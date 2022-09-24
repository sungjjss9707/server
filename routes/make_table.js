var express = require('express'); 
var bcrypt = require('bcrypt');
var router = express.Router(); 
var con;
var db = require('mysql2/promise');
var mysql = require('../config');
var crypto = require('crypto');
var table = require('../routes/table');
var inform = mysql.inform;


async function myQuery(sql, param){
    try{
        const [row, field] = await con.query(sql,param);
        return true;
    }catch(error){
        console.log(error);
        return false;
    }
}

router.post('/', async function(req, res, next) {
	con = await db.createConnection(inform);
	const militaryUnit = req.body.militaryUnit;
	const code = req.body.code;
	var insert_mil_and_code = myQuery("insert into mil_and_code values (?,?);", [militaryUnit, code]);
	if(!insert_mil_and_code){
		res.send("Fail");
		return;
	}
	var property_make_success = await table.makeProperty(militaryUnit);
	var log_make_success = await table.makeLog(militaryUnit);
	var storagePlace_make_success = await table.makeStoragePlace(militaryUnit);
	if(property_make_success.success&&log_make_success.success&&storagePlace_make_success){
		res.send("success");
	} 
	else res.send({status:400, message:"Bad Request"});
});

module.exports = router;
