var express = require('express'); 
var bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../config');
var new_issue = require('../routes/issue');
var router = express.Router(); 
var con;
var db = require('mysql2/promise');
var mysql = require('../config')
var inform = mysql.inform;

router.post('/', async function(req, res, next) {
	
	async function insertQuery(my_sql, my_param){
        try{
            const [row, field] = await con.query(my_sql,my_param);
            return true;
        }catch(error){
            console.log(error);
            return false;
        }
    }
 	
	async function deleteQuery(my_sql, my_param){
        try{
            const [row, field] = await con.query(my_sql,my_param);
            return true;
        }catch(error){
            console.log(error);
            return false;
        }
    }

    console.log("login page");

	const email = req.body.email;
    const password = req.body.password;
	con = await db.createConnection(inform);
	var select_sql = "select * from user where email = ?;";
	var select_param = email;
	//console.log(sql1);
	const [row1, field1] = await con.query(select_sql, select_param);
	if(row1.length==0){
        console.log("없는 계정입니다.");
        res.send({status:400, message:"Bad Request"});
    }
    else{
		const real_my_encoded_pw = row1[0].password;
		if(bcrypt.compareSync(password, real_my_encoded_pw)){
			//console.log("로그인 성공");
			const name = row1[0].name;
			const id = row1[0].id;
			const phoneNumber = row1[0].phoneNumber;
			const serviceNumber = row1[0].serviceNumber;
			const mil_rank = row1[0].mil_rank;
			const enlistmentDate = row1[0].enlistmentDate;
			const dischargeDate = row1[0].dischargeDate;
			const militaryUnit = row1[0].militaryUnit;
			const createdAt = row1[0].createdAt;
			const updatedAt = row1[0].updatedAt;
			const check_sql = "select * from refresh_token where id = ?;";
			const check_param = id;
			const [row2, field2] = await con.query(check_sql, check_param);
			if(row2.length!=0){
				const delete_sql = "delete from refresh_token where id = ?;";
            	const delete_param = id;
				const delete_success = deleteQuery(delete_sql, delete_param);
				if(delete_success) console.log("삭제완료");
				else console.log("삭제 불가");

			}
			//console.log("내이름 : "+my_name);
			var access_token_obj = await new_issue.issue_new_token(email, name, '15m');
			var refresh_token_obj = await new_issue.issue_new_token(email, name, '1d');
			var access_token = access_token_obj.Token;
			var refresh_token = refresh_token_obj.Token;
			//console.log("액세스토큰 : "+access_token);
			//console.log("리프래시토큰 : "+refresh_token);
			var insert_sql = "insert into refresh_token values (?, ?);";
			var insert_param = [id, refresh_token];
/////////////////////////////////////////////////////insert 해줘야함
			var insert_success = await insertQuery(insert_sql, insert_param);
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
