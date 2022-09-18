var express = require('express'); 
var bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../config');
var router = express.Router(); 
var mysql = require('../config');
var db = require('mysql2/promise');
var new_issue = require('../routes/issue');
var del_ref = require('../routes/del_refresh');
var inform = mysql.inform;
var con;

async function verify_token(token){
	console.log("받은 토큰 : "+token);
	try {
        const tokenInfo = await new Promise((resolve, reject) => {
            jwt.verify(token, config.secret,
                (err, decoded) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(decoded);
                    }
            });
        });
		return {success:true, decoded:tokenInfo};
            //res.send("인증성공");
    } catch(err) {
        //console.log(err.message);
        console.log("인증실패");
        return {success:false , message : err.message};
    }
}

async function myupdate(update_sql){
    try{
        console.log(update_sql);
        const [row3, field3] = await con.query(update_sql);
        return true;
    }catch(error){
        return false;
    }
}

async function myinsert(sql){
    try{
        console.log(sql);
        const [row3, field3] = await con.query(sql);
        return true;
    }catch(error){
        return false;
    }
}

router.post('/', async function(req, res, next) {
    //const accessToken = req.body.token; 
	const accessToken = req.header('Access_Token');
	const mil_num = req.header('Mil_Num');
	if (accessToken == null) {
		res.status(403).json({success:false, errormessage:'Authentication fail'});
	} else {
		var access = await verify_token(accessToken);
		var sql1 = "select token from refresh_token where mil_num='"+mil_num+"';"; 
		con = await db.createConnection(inform);
		//con = await db.createConnection(inform);
		var sql3 = "select name from user_inform where mil_num='"+mil_num+"';";
		const [row3, field3] = await con.query(sql3);
		var my_name = row3[0].name;
		const [row1, field1] = await con.query(sql1);
		if(row1.length==0){
			if(access.success){
				var refresh_token_obj = await new_issue.issue_new_token(mil_num, my_name, '15m');
                var new_refresh_token = refresh_token_obj.Token;
				var sql2 = "insert into refresh_token values ('"+mil_num+"', '"+new_refresh_token+"');";		
                //var sql2 = "update refresh_token set token = '"+new_refresh_token+"' where mil_num = '"+mil_num+"';";
                var insert_success = await myinsert(sql2);
                if(insert_success){
                    console.log("리프래쉬 다시 발급");
                    res.send({token : accessToken, msg : "리프래쉬 재발급"});
                }
			}
			else{
                console.log("로그이읏");
                res.send("로그아웃");
			}
			return;
		} 
        const refresh_token = row1[0].token;
		console.log(refresh_token);
		var refresh = await verify_token(refresh_token);				
		console.log(access.message);
		console.log(refresh.message);
		if(access.success){
			if(refresh.success){	//인증 성공 
				console.log("인증성공");
				res.send("인증성공");
			}
			else if(refresh.message=="jwt expired"){	//리프래쉬 다시 발급
				var refresh_token_obj = await new_issue.issue_new_token(mil_num, my_name, '15m');
				var new_refresh_token = refresh_token_obj.Token;
				var sql2 = "update refresh_token set token = '"+new_refresh_token+"' where mil_num = '"+mil_num+"';";
				console.log(sql2);
				var update_success = await myupdate(sql2);
				if(update_success){
					console.log("리프래쉬 다시 발급");
					res.send({token : accessToken, msg : "리프래쉬 재발급"});
				}
				else{
					console.log("리프래쉬 발급 실패");
					res.send({success : "fail", msg : "리프래쉬 재발급"});
				}
			}
			else{}
		}
		else if(access.message=="jwt expired"){	//access token이 유효하지 않은 상태면 
			if(refresh.success){	//엑세스 다시발급 
				var access_token_obj = await new_issue.issue_new_token(mil_num, my_name, '2m');
                var access_token = access_token_obj.Token;
				res.send({token : accessToken, msg : "액세스 재발급"});
                res.send("액세스 다시 발급");
			}
			else if(refresh.message=="jwt expired"){	//로그아웃
				var delete_refresh = await del_ref.del_query(mil_num);
				console.log("로그이읏");
                res.send("로그아웃");
			}
 			else{}
		}
	}
});

module.exports = router;
