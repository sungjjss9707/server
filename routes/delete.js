var express = require('express'); 
var bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../config');
var router = express.Router(); 
var db = require('mysql2/promise');
var new_issue = require('../routes/issue');
var del_ref = require('../routes/del_refresh');
var verify = require('../routes/verify'); 
var inform = config.inform;
var refresh_time = config.refresh_time;
var access_time = config.access_time;
var con;

async function myQuery(sql, param){
    try{
        //console.log(update_sql);
        const [row, field] = await con.query(sql, param);
        return true;
    }catch(error){
        return false;
    }
}

router.delete('/', async function(req, res, next) {
    const id = req.body.id;	
/*
	const accessToken = req.header('Authorization');
	if (accessToken == null) {
		res.send({status:400, message:'Bad Request', data:null});
		return;
	}
	var verify_success = await verify.verifyFunction(accessToken, id);
	if(!verify_success){
		res.send({status:400, message:'Bad Request', data:null});
        return;
	}
*/
	con = await db.createConnection(inform);
    var select_user_inform_sql = "select email, name from user where id = ?;";
    var select_user_inform_param = id;
    var select_token_sql = "select token from refresh_token where id = ?;";
    var select_token_param = id;
    var del_user_sql = "delete from user where id = ?;";
    var del_user_param = id;
    var del_refresh_token_sql = "delete from refresh_token where id = ?";
    var del_refresh_token_param = id;
    await myQuery(del_user_sql, del_user_param);
    await myQuery(del_refresh_token_sql, del_refresh_token_param);
    const [check_token_result] = await con.query(select_token_sql, select_token_param);
    const [check_user_inform_result] = await con.query(select_user_inform_sql ,select_user_inform_param);
    if(check_token_result.length==0&&check_user_inform_result.length==0){
        res.send({status:200, message:"Ok", data:null});
    }
    else res.send({status:400, message:"Bad Request", data:null});
});

module.exports = router;
