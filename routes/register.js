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
    console.log("REISTER-PAGE");
	con = await db.createConnection(inform);
	//con.connect(err => {
	 // if (err) throw new Error(err);
	//});
	const name = req.body.name;
	const email = req.body.email;
	const password = req.body.password;
	const phoneNumber = req.body.phoneNumber;
	const serviceNumber = req.body.serviceNumber;
	const mil_rank = req.body.rank;
	const enlistmentDate = req.body.enlistmentDate;
	const dischargeDate = req.body.dischargeDate;
	const militaryUnit = req.body.militaryUnit;
	const encoded_pw = bcrypt.hashSync(password, 10);
	var check_militaryUnit_sql = "select * from mil_and_code where militaryUnit = ?;";
	var check_militaryUnit_param = militaryUnit;
	const[check_militaryUnit_result] = await con.query(check_militaryUnit_sql, check_militaryUnit_param);
	if(check_militaryUnit_result.length==0){
		res.send({status:400, message:"Bad Request"});
		return;
	}
//	var encoded_id = crypto.createHash('sha256').update(email).digest('base64');
	var encoded_id = email;	
	var insert_sql = "insert into user values (?,?,?,?,?,?,?,?,?,?,now(), now());";
	var insert_param = [encoded_id, name, email, encoded_pw, phoneNumber, serviceNumber, mil_rank, enlistmentDate, dischargeDate, militaryUnit];
	var insert_success = await myQuery(insert_sql, insert_param);
	if(insert_success){
		var select_sql = "select createdAt, updatedAt from user where id = ?;";
		var select_param = encoded_id;
		const [select_result, select_field] = await con.query(select_sql,select_param);
		if(select_result.length!=0){
			var created_time = select_result[0].createdAt;
			var updated_time = select_result[0].updatedAt;
			var data = {id : encoded_id, name : name, email : email, phoneNumber:phoneNumber, serviceNumber:serviceNumber, rank:mil_rank, enlistmentDate:enlistmentDate, dischargeDate : dischargeDate, militaryUnit : militaryUnit, createdAt:created_time, updatedAt : updated_time};
			res.send({status:200, message:"Ok", data:data});
		}
		else{
			res.send({status:400, message:"Bad Request"});
		}

	}
	 //res.send("가입 완료");
	else res.send({status:400, message:"Bad Request"});
});

module.exports = router;
