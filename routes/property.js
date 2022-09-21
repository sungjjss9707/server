var express = require('express'); 
var bcrypt = require('bcrypt');
var router = express.Router(); 
var con;
var db = require('mysql2/promise');
var mysql = require('../config');
var crypto = require('crypto');
var inform = mysql.inform;
var verify = require('../routes/verify');

async function myQuery(sql, param){
    try{
        const [row, field] = await con.query(sql,param);
        return true;
    }catch(error){
        console.log(error);
        return false;
    }
}


router.get('/show', async function(req, res, next) {
    console.log("show-PAGE");
/*
	const user_id = req.body.id;
    const accessToken = req.header('Authorization');
    if (accessToken == null) {
        res.send({status:400, message:'Bad Request', data:null});
        return;
    }
    var verify_success = await verify.verifyFunction(accessToken, user_id);
    if(!verify_success){
        res.send({status:400, message:'Bad Request', data:null});
        return;
    }
*/
    con = await db.createConnection(inform);
    var select_property_sql = "select * from property;";
    const [select_property_result, select_property_field1] = await con.query(select_property_sql);
    if(select_property_result.length==0){
        res.send({status:400, message:"Bad Request"});
    }
    else{
		var data = [];
		var log_arr = [];
		var Individual_data;
		var select_log_result, select_log_field;
		var id, name, amount, unit, storagePlace, expirationDate, created_time, updated_time, select_log_sql, select_log_param;
		for(let i=0; i<select_property_result.length; ++i){
			id = select_property_result[i].id;
			name = select_property_result[i].name;
        	amount = select_property_result[i].amount;
        	unit = select_property_result[i].unit;
        	storagePlace = select_property_result[i].storagePlace;
        	expirationDate = select_property_result[i].expirationDate;
        	created_time = select_property_result[i].createdAt;
        	updated_time = select_property_result[i].updatedAt;
        	select_log_sql = "select id from payment_log where property_id = ?;";
        	select_log_param = id;
			[select_log_result, select_log_field] = await con.query(select_log_sql,select_log_param);
			log_arr = [];
			for(let k=0; k<select_log_result.length; ++k){
                log_arr.push(select_log_result[k].id);
            }
			individual_data = {id :id, name : name, amount:amount, unit:unit, storagePlace:storagePlace,expirationDate:expirationDate,logRecord:log_arr ,createdAt:created_time, updatedAt : updated_time};
			data.push(individual_data);
		}
		res.send({status:200, message:"Ok", data:data});
    }
});


router.get('/show/:id', async function(req, res, next) {
    console.log("show-PAGE");
    const id = req.params.id;

/*
    const user_id = req.body.id;
    const accessToken = req.header('Authorization');
    if (accessToken == null) {
        res.send({status:400, message:'Bad Request', data:null});
        return;
    }
    var verify_success = await verify.verifyFunction(accessToken, user_id);
    if(!verify_success){
        res.send({status:400, message:'Bad Request', data:null});
        return;
    }
*/

    con = await db.createConnection(inform);
    var select_property_sql = "select * from property where id = ?;";
    var select_property_param = id;
    const [select_property_result, select_property_field1] = await con.query(select_property_sql,select_property_param);
    if(select_property_result.length==0){
        res.send({status:400, message:"Bad Request"});
    }
    else{
        //console.log(select_result1);
        var name = select_property_result[0].name;
        var amount = select_property_result[0].amount;
        var unit = select_property_result[0].unit;
        var storagePlace = select_property_result[0].storagePlace;
        var expirationDate = select_property_result[0].expirationDate;
        var created_time = select_property_result[0].createdAt;
        var updated_time = select_property_result[0].updatedAt;
		var select_log_sql = "select id from payment_log where property_id = ?;";
    	var select_log_param = id;
    	const [select_log_result, select_log_field] = await con.query(select_log_sql,select_log_param);
        //console.log(created_time+" "+updated_time);
		if(select_log_result.length==0){	//재산이 있다면 로그가 없을수가 없음 절대로 
        	res.send({status:400, message:"Bad Request"});
    	}
		else{
			var log_arr = [];
			//console.log(select_log_result);
			for(let i=0; i<select_log_result.length; ++i){
				log_arr.push(select_log_result[i].id);
			}			
			var data = {id :id, name : name, amount:amount, unit:unit, storagePlace:storagePlace,expirationDate:expirationDate,logRecord:log_arr ,createdAt:created_time, updatedAt : updated_time};
        	res.send({status:200, message:"Ok", data:data});	
		}
    }
});

module.exports = router;
