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

	async function myinsert(insert_sql){
        try{
            console.log(insert_sql);
            const [row1, field1] = await con.query(insert_sql);
            return true;
        }catch(error){
            return false;
        }
    }
 
    console.log("REST API Post Method - Member Login And JWT Sign");
	const my_mil_num = req.body.mil_num;
	//var my_name;
    const my_password = req.body.password;
	console.log(my_mil_num+" "+my_password);
    const my_encoded_password = bcrypt.hashSync(my_password, 10);
	console.log(my_mil_num+" "+my_password+" "+my_encoded_password);
	con = await db.createConnection(inform);
	var sql1 = "select * from user_inform where mil_num = '"+my_mil_num+"';";
	console.log(sql1);
	const [row1, field1] = await con.query(sql1);
	if(row1.length==0){
        console.log("없는 계정입니다.");
        res.send("없는 계정입니다.");
    }
    else{
		const real_my_en_pw = row1[0].password;
		if(bcrypt.compareSync(my_password, real_my_en_pw)){
			console.log("로그인 성공");
			const my_name = row1[0].name;
			console.log("내이름 : "+my_name);
			var access_token_obj = await new_issue.issue_new_token(my_mil_num, my_name, '2m');
			var refresh_token_obj = await new_issue.issue_new_token(my_mil_num, my_name, '15m');
			var access_token = access_token_obj.Token;
			var refresh_token = refresh_token_obj.Token;
			console.log("액세스토큰 : "+access_token);
			console.log("리프래시토큰 : "+refresh_token);
			var sql2 = "insert into refresh_token values ('"+my_mil_num+"', '"+refresh_token+"');";
/////////////////////////////////////////////////////insert 해줘야함
			var insert_query = await myinsert(sql2);
			if(insert_query) res.send({"access_token" : access_token, "refresh_token" : refresh_token});
    		else res.send("토큰생성 실패");     	
		}
		else{
			console.log("로그인 실패");
            res.send("로그인 실패.");
		}
    }
});

module.exports = router;
