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
	var delete_mil_and_code = myQuery("delete from mil_and_code where militaryUnit = ?;", militaryUnit);
	if(!delete_mil_and_code){
		res.send("Fail");
		return;
	}
	var property_drop_success = await table.propertyDrop(militaryUnit);
	var log_drop_success = await table.paymentLogDrop(militaryUnit);
	var storagePlace_drop_success = await table.storagePlaceDrop(militaryUnit);
	if(property_drop_success.success&&log_drop_success.success&&storagePlace_drop_success){
		res.send("success");
	} 
	else res.send({status:400, message:"Bad Request"});
});

module.exports = router;
