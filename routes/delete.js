var express = require('express'); 
var bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../config');
var router = express.Router(); 
var db = require('mysql2/promise');
var new_issue = require('../routes/issue');
var del_ref = require('../routes/del_refresh');
var inform = config.inform;
var refresh_time = config.refresh_time;
var access_time = config.access_time;
var con;

async function verify_token(token){
	//console.log("받은 토큰 : "+token);
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

async function updateQuery(sql, param){
    try{
        //console.log(update_sql);
        const [row, field] = await con.query(sql, param);
        return true;
    }catch(error){
        return false;
    }
}

async function insertQuery(sql, param){
    try{
        const [row, field] = await con.query(sql, param);
        return true;
    }catch(error){
        return false;
    }
}

async function deleteQuery(sql, param){
    try{
        //console.log(sql);
        const [row, field] = await con.query(sql, param);
        return true;
    }catch(error){
        return false;
    }
}

router.delete('/', async function(req, res, next) {
    //const accessToken = req.body.token; 
	const accessToken = req.header('Authorization');
	const id = req.body.id;
	if (accessToken == null) {
		res.status(403).json({status:400, message:'Bad Request', data:null});
	} else {
		//console.log(accessToken);
		var access = await verify_token(accessToken);
		con = await db.createConnection(inform);
		//con = await db.createConnection(inform);
		var select_user_inform_sql = "select email, name from user where id = ?;";
		var select_user_inform_param = id;
		const [select_user_inform_result, field3] = await con.query(select_user_inform_sql ,select_user_inform_param);
		if(select_user_inform_result.length==0){
			res.send({status:400, message:"Bad Request", data:null});
			return;
		}
		var name = select_user_inform_result[0].name;
		var email = select_user_inform_result[0].email;
		var select_token_sql = "select token from refresh_token where id = ?;";
		var select_token_param = id;
		var del_user_sql = "delete from user where id = ?;";
		var del_user_param = id;
		var del_refresh_token_sql = "delete from refresh_token where id = ?";
		var del_refresh_token_param = id;
		const [select_token_result, field1] = await con.query(select_token_sql, select_token_param);
		if(select_token_result.length==0){	//db에 등록된 리프래쉬 토큰이 없을때 
			if(access.success){
				var refresh_token_obj = await new_issue.issue_new_token(email, name, refresh_time);
                var new_refresh_token = refresh_token_obj.Token;
				var insert_sql = "insert into refresh_token values (?,?);";
				var insert_param = [id, new_refresh_token];
                //var sql2 = "update refresh_token set token = '"+new_refresh_token+"' where mil_num = '"+mil_num+"';";
                var insert_success = await insertQuery(insert_sql, insert_param);
                if(insert_success){
                    console.log("리프래쉬 다시 발급");
                }
			}
			else{
                console.log("로그이읏");
			}
			await deleteQuery(del_user_sql, del_user_param);
			await deleteQuery(del_refresh_token_sql, del_refresh_token_param);
			const [check_token_result] = await con.query(select_token_sql, select_token_param);
			const [check_user_inform_result] = await con.query(select_user_inform_sql ,select_user_inform_param);
			if(check_token_result.length==0&&check_user_inform_result.length==0){
				res.send({status:200, message:"Ok", data:null});
			}
			return;
		} 
        const refresh_token = select_token_result[0].token;
		console.log("시발 "+refresh_token);
		var refresh = await verify_token(refresh_token);				
		//console.log(access.message);
		//console.log(refresh.message);
		if(access.success){
			if(refresh.success){	//인증 성공 
				//console.log("인증성공");
			}
			else if(refresh.message=="jwt expired"){	//리프래쉬 다시 발급
				var new_refresh_token_obj = await new_issue.issue_new_token(email, name, refresh_time);
				var new_refresh_token = new_refresh_token_obj.Token;
				var update_sql = "update refresh_token set token = ? where id = ?;";
				var update_param = [new_refresh_token, id]; 
				//console.log(sql2);
				var update_success = await updateQuery(update_sql, update_param);
				if(update_success){
					console.log("리프래쉬 다시 발급");
				}
				else{
					console.log("리프래쉬 발급 실패");
				}
			}
			else{}
		}
		else if(access.message=="jwt expired"){	//access token이 유효하지 않은 상태면 
			if(refresh.success){	//엑세스 다시발급 
				var new_access_token_obj = await new_issue.issue_new_token(email, name, access_time);
                var new_access_token = new_access_token_obj.Token;
			}
			else if(refresh.message=="jwt expired"){	//로그아웃
				//var delete_refresh = await del_ref.del_query(mil_num);
				//console.log("로그이읏");
                //res.send("로그아웃");
			}
 			else{}
		}
		await deleteQuery(del_user_sql, del_user_param);
        await deleteQuery(del_refresh_token_sql, del_refresh_token_param);
		const [check_token_result] = await con.query(select_token_sql, select_token_param);
        const [check_user_inform_result] = await con.query(select_user_inform_sql ,select_user_inform_param);
        if(check_token_result.length==0&&check_user_inform_result.length==0){
            res.send({status:200, message:"Ok", data:null});
        }
	}
});

module.exports = router;
