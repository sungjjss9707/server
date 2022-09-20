var express = require('express'); 
var bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../config');
var new_issue = require('../routes/issue');
var router = express.Router(); 
var con;
var db = require('mysql2/promise');
var inform = config.inform;
var refresh_time = config.refresh_time;
var access_time = config.access_time;

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
	
    console.log("login page");
	const email = req.body.email;
    const password = req.body.password;
	con = await db.createConnection(inform);
	var select_sql = "select * from user where email = ?;";
	var select_param = email;
	//console.log(sql1);
	const [select_result1, select_field1] = await con.query(select_sql, select_param);
	if(select_result1.length==0){
        console.log("없는 계정입니다.");
        res.send({status:400, message:"Bad Request"});
    }
    else{
		const real_my_encoded_pw = select_result1[0].password;
		if(bcrypt.compareSync(password, real_my_encoded_pw)){
			//console.log("로그인 성공");
			const name = select_result1[0].name;
			const id = select_result1[0].id;
			const phoneNumber = select_result1[0].phoneNumber;
			const serviceNumber = select_result1[0].serviceNumber;
			const mil_rank = select_result1[0].mil_rank;
			const enlistmentDate = select_result1[0].enlistmentDate;
			const dischargeDate = select_result1[0].dischargeDate;
			const militaryUnit = select_result1[0].militaryUnit;
			const createdAt = select_result1[0].createdAt;
			const updatedAt = select_result1[0].updatedAt;
			const check_sql = "select * from refresh_token where id = ?;";
			const check_param = id;
			const [select_result2, select_field2] = await con.query(check_sql, check_param);
			if(select_result2.length!=0){
				const delete_sql = "delete from refresh_token where id = ?;";
            	const delete_param = id;
				const delete_success = myQuery(delete_sql, delete_param);
				if(delete_success) console.log("삭제완료");
				else console.log("삭제 불가");

			}
			//console.log("내이름 : "+my_name);
			var access_token_obj = await new_issue.issue_new_token(email, name, access_time);
			var refresh_token_obj = await new_issue.issue_new_token(email, name, refresh_time);
			var access_token = access_token_obj.Token;
			var refresh_token = refresh_token_obj.Token;
			//console.log("액세스토큰 : "+access_token);
			//console.log("리프래시토큰 : "+refresh_token);
			var insert_sql = "insert into refresh_token values (?, ?);";
			var insert_param = [id, refresh_token];
/////////////////////////////////////////////////////insert 해줘야함
			var insert_success = await myQuery(insert_sql, insert_param);
			if(insert_success){
				console.log(access_token);
				console.log(refresh_token);
				var data = {id :id, name : name, email : email, password : password, phoneNumber:phoneNumber, serviceNumber:serviceNumber, rank:mil_rank, enlistmentDate:enlistmentDate, dischargeDate : dischargeDate, militaryUnit : militaryUnit, createdAt:createdAt, updatedAt : updatedAt};
				res.setHeader("Authorization", access_token);
				res.send({status:200, message:"Ok", data:data});
			}
    		else res.send({status:400, message:"Bad Request"});    	
		}
		else{
			console.log("로그인 실패");
			res.send({status:400, message:"Bad Request"});
		}
    }
});

module.exports = router;
