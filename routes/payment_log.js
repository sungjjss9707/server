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


router.post('/write', async function(req, res, next) {
	con = await db.createConnection(inform);
	const accessToken = req.header('Authorization');
	if (accessToken == null) {
        res.send({status:400, message:'Bad Request', data:null});
		return;
    }
	const receiptPayment = req.body.receiptPayment;
	const name = req.body.name;
	const amount = req.body.amount;
	const unit = req.body.unit;
	const target = req.body.target;
	const storagePlace = req.body.storagePlace;
	const expirationDate = req.body.expirationDate;
	const confirmor_id = req.body.confirmor_id;
    var verify_success = await verify.verifyFunction(accessToken, confirmor_id);
    console.log(verify_success);
    if(!verify_success){
        res.send({status:400, message:'Bad Request', data:null});
        return;
    }
	//var myhash = crypto.createHash('sha1');
	//var encoded_id = crypto.createHash('sha256').update(name+" "+expirationDate).digest('base64');
	var property_id = name+" "+expirationDate;
	//var log_id = property_Id+" "+
	var select_sql = "select * from payment_log where property_id = ?;";
    var select_param = property_id;
    const [select_result1, field1] = await con.query(select_sql,select_param);
	if(select_result1.length==0){	//이 약의 수불로그가 하나도 없다는 뜻 => 지금 새로쓰는 수불로그는 무조건 처음 '받는'거여야함
		if(receiptPayment=="수입"){
			var insert_property_sql = "insert into property values (?,?,?,?,?,?,now(), now());";
        	var insert_property_param = [property_id, name, amount, unit, storagePlace, expirationDate];
        	var insert_property_success = await myQuery(insert_property_sql, insert_property_param);
        	if(insert_property_success){
				var insert_log_sql = "insert into payment_log values (?,?,?,?,?,?,now(), now());";
				var id = property_id+" 1";
            	var insert_log_param = [id, "수입", property_id, 1,target, confirmor_id];
            	var insert_log_success = await myQuery(insert_log_sql, insert_log_param);
				if(insert_log_success){
					var select_user_sql = "select * from user where id = ?;";
					var select_user_param =confirmor_id;
					const [select_user_result, select_user_field] = await con.query(select_user_sql,select_user_param);
					if(select_user_result.length==0){
						res.send({status:400, message:'Bad Request', data:null});
					}
					else{
						var user_name = select_user_result[0].name;
						var user_email = select_user_result[0].email;
						//var user_password = select_user_result[0].password;
						var user_phoneNumber = select_user_result[0].phoneNumber;
						var user_serviceNumber = select_user_result[0].serviceNumber;
						var user_mil_rank = select_user_result[0].rank;
						var user_enlistmentDate = select_user_result[0].enlistmentDate;
						var user_dischargeDate = select_user_result[0].dischargeDate;
						var user_militaryUnit = select_user_result[0].militaryUnit;
						var user_createdAt = select_user_result[0].createdAt;
						var user_updatedAt = select_user_result[0].updatedAt;
						var user_data = {id:confirmor_id, name:user_name, email:user_email, phoneNumber:user_phoneNumber,serviceNumber:user_serviceNumber, rank:user_mil_rank, enlistmentDate:user_enlistmentDate, dischargeDate:user_dischargeDate, militaryUnit:user_militaryUnit, createdAt:user_createdAt, updatedAt:user_updatedAt };
						var select_log_sql = "select createdAt, updatedAt from payment_log where id = ?;";
    					var select_log_param = id;
						const [select_log_result, select_log_field] = await con.query(select_log_sql,select_log_param);
						if(select_user_result.length==0){
                     	   	res.send({status:400, message:'Bad Request', data:null});
                    	}
						else{
							var createdAt = select_user_result[0].createdAt;
							var updatedAt = select_user_result[0].updatedAt;
							var data = {id:id, receiptPayment:receiptPayment, name:name, amount:amount, unit:unit, target:target, storagePlace:storagePlace, expirationDate:expirationDate, confirmor:user_data, createdAt:createdAt, updatedAt:updatedAt};
							res.send({status:200, message:"Ok", data:data});
						}
					}
				}
				else res.send("실패");
        	}
     //res.send("가입 완료");
        	else res.send({status:400, message:"Bad Request"});
		}
		else{	//수불로그가 하나도 없는데 불출부터 할려는 경우 배드리퀘스트 
			res.send({status:400, message:"Bad Request"});
		} 
	}
	else{/*
		var origin_amount = select_result1[0].amount;
		var final_amount = origin_amount+amount;
		var update_sql = "update property set amount = ?, updatedAt = now() where id = ?;";
		var update_param = [final_amount, encoded_id];
		var update_success = await myQuery(update_sql, update_param);
		if(update_success){
			const [select_result2, field2] = await con.query(select_sql,select_param);
            if(select_result2.length!=0){
                var created_time = select_result2[0].createdAt;
                var updated_time = select_result2[0].updatedAt;
            //console.log(created_time+" "+updated_time);
                var data = {id : encoded_id, name : name, amount:final_amount, unit:unit, storagePlace:storagePlace, expirationDate:expirationDate, createdAt:created_time, updatedAt : updated_time};
				//////////////////////////////////////////////////////////////////////여기도 마찬가지로 수불로그 업데이트 
                res.send({status:200, message:"Ok", data:data});
            }
            else{
                res.send({status:400, message:"Bad Request"});
            }
		}
		else{
			res.send({status:400, message:"Bad Request"});
		}
*/
	}
});


module.exports = router;
