var express = require('express'); 
var bcrypt = require('bcrypt');
var router = express.Router(); 
var con;
var db = require('mysql2/promise');
var mysql = require('../config');
var crypto = require('crypto');
var inform = mysql.inform;

router.post('/', async function(req, res, next) {
    console.log("REISTER-PAGE");

	async function insertSql(my_sql, my_param){
        try{
			//console.log(my_sql);
			//console.log(my_param);
            const [row, field] = await con.query(my_sql,my_param);
            return true;
        }catch(error){
			console.log(error);
            //console.log("이미 가입된 군번입니다");
			//res.send("이미 가입된 군번입니다.");
			return false;
        }
    }
	//console.log(inform);
	con = await db.createConnection(inform);
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
	//var myhash = crypto.createHash('sha1');
	var encoded_id = crypto.createHash('sha256').update(email).digest('base64');
	
	//const encoded_id = bcrypt.hashSync(email, 10); 
	//console.log(my_password+" "+my_encoded_password);
	var insert_sql = "insert into user values (?,?,?,?,?,?,?,?,?,?,now(), now());";
	var insert_param = [encoded_id, name, email, encoded_pw, phoneNumber, serviceNumber, mil_rank, enlistmentDate, dischargeDate, militaryUnit];
	var insert_success = await insertSql(insert_sql, insert_param);
	if(insert_success){
		var select_sql = "select * from user where id = ?;";
		var select_param = encoded_id;
		const [row, field] = await con.query(select_sql,select_param);
		if(row.length!=0){
			var created_time = row[0].createdAt;
			var updated_time = row[0].updatedAt;
			var data = {id : encoded_id, name : name, email : email, password : password, phoneNumber:phoneNumber, serviceNumber:serviceNumber, rank:mil_rank, enlistmentDate:enlistmentDate, dischargeDate : dischargeDate, militaryUnit : militaryUnit, createdAt:created_time, updatedAt : updated_time};
			res.send({status:200, message:"가입완료", data:data});
		}
		else{
		}

	}
	 //res.send("가입 완료");
	else res.send("가입 실패");
	//console.log("가입완료");
	//console.log(sql1);
	//const [row1, field1] = await con.query(sql1);
	//console.log(row1);
    //console.log(memberId+" "+memberPassword);
});

router.get('/', async function(req,res){
	
	con = await db.createConnection(inform);
    var sql1 = "select * from user;";
    var user_id, user_sadan;
	async function myfunction(){
		try{
			const [row1, field1] = await con.query(sql1);
			console.log("user 테이블 크기 : "+row1.length);
			if(row1.length==0){
				console.log("빈 테이블입니다");
				res.send("fail");
			}
			else{
				user_id = row1[0].sadan_num;
           		console.log(row1[0].id);
            	console.log("1번함수 실행 완료");
            	var sql2 = "select * from sadan where num = '"+user_id+"';";
            	const [row2, field2] = await con.query(sql2);
            	console.log(row2[0]);
			}
		}catch(error){
			console.log(error);
		}
	}
	myfunction();
});

module.exports = router;
