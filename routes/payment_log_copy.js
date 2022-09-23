var express = require('express'); 
var bcrypt = require('bcrypt');
var router = express.Router(); 
var con;
var db = require('mysql2/promise');
var mysql = require('../config');
var crypto = require('crypto');
var inform = mysql.inform;
var verify = require('../routes/verify');
var table = require('../routes/table');

async function myQuery(sql, param){
    try{
        const [row, field] = await con.query(sql,param);
        return true;
    }catch(error){
        console.log(error);
        return false;
    }
}

/*
router.put('/update', async function(req, res, next) {
    con = await db.createConnection(inform);
    const id = req.body.id;
    const receiptPayment = req.body.receiptPayment;
    const name = req.body.name;
    const amount = req.body.amount;
    const unit = req.body.unit;
    const target = req.body.target;
    const storagePlace = req.body.storagePlace;
    const expirationDate = req.body.expirationDate;
    const confirmor_id = req.body.confirmor_id;
    var update_log_sql = "update payment_log set receiptPayment = ?, name = ?, amount = ?,unit = ?, target=?, storagePlace = ?, expirationDate = ?, updatedAt = now() where id = ?;";
    var update_log_param = [final_amount, property_id];
                query_success = await myQuery(update_property_sql, update_property_param);
    const accessToken = req.header('Authorization');
    if (accessToken == null) {
        res.send({status:400, message:'Bad Request', data:null});
        return;
    }
    var verify_success = await verify.verifyFunction(accessToken, confirmor_id);
    if(!verify_success){
        res.send({status:400, message:'Bad Request', data:null});
        return;
    }

});
*/


router.get('/show', async function(req, res, next) {
    con = await db.createConnection(inform);
    const my_id = req.body.id;
/*
    const accessToken = req.header('Authorization');
    if (accessToken == null) {
        res.send({status:400, message:'Bad Request', data:null});
        return;
    }
    var verify_success = await verify.verifyFunction(accessToken, my_id);
    if(!verify_success){
        res.send({status:400, message:'Bad Request', data:null});
        return;
    }
*/
    var id ;
    var select_log_sql = "select * from payment_log;";
    const [select_log_result, select_log_field] = await con.query(select_log_sql);
    if(select_log_result.length==0){
        res.send({status:400, message:"Bad Request"});
    }
    else{
		var id, receiptPayment, name, amount, unit, target, storagePlace, expirationDate, createdAt, updatedAt, confirmor_id;
		var select_user_sql = "select * from user where id = ?;";
        var select_user_param, select_user_result, select_user_field;
		var user_data,data=[] ,individual_log;
		var user_name,email, phoneNumber, serviceNumber, rank, enlistmentDate, dischargeDate, militaryUnit , user_createdAt, user_updatedAt;
		for(let i=0; i<select_log_result.length; ++i){
			id = select_log_result[i].id;
        	receiptPayment = select_log_result[i].receiptPayment;
       	 	name = select_log_result[i].name;
        	amount = select_log_result[i].amount;
        	unit = select_log_result[i].unit;
        	target = select_log_result[i].target;
        	storagePlace = select_log_result[i].storagePlace;
        	expirationDate = select_log_result[i].expirationDate;
        	createdAt = select_log_result[i].createdAt;
        	updatedAt = select_log_result[i].updatedAt;
        	confirmor_id = select_log_result[i].confirmor_id;
			select_user_param = confirmor_id;
			[select_user_result, select_user_field] = await con.query(select_user_sql, select_user_param);
			user_name = select_user_result[0].name;
            email = select_user_result[0].email;
            phoneNumber = select_user_result[0].phoneNumber;
            serviceNumber = select_user_result[0].serviceNumber;
            rank = select_user_result[0].mil_rank;
            enlistmentDate = select_user_result[0].enlistmentDate;
            dischargeDate = select_user_result[0].dischargeDate;
            militaryUnit = select_user_result[0].militaryUnit;
            user_createdAt = select_user_result[0].createdAt;
            user_updatedAt = select_user_result[0].updatedAt;	
			user_data = {id:confirmor_id, name:user_name, email:email, phoneNumber:phoneNumber, serviceNumber:serviceNumber, rank:rank, enlistmentDate:enlistmentDate, dischargeDate:dischargeDate,militaryUnit:militaryUnit, createdAt:user_createdAt, updatedAt:user_updatedAt };
			individual_log = {id:id, receiptPayment:receiptPayment, name:name, amount:amount, unit:unit, target:target, storagePlace:storagePlace, expirationDate:expirationDate, confirmor:user_data, createdAt:createdAt, updatedAt:updatedAt};
			data.push(individual_log);	
		}
		res.send({status:200, message:"Ok", data:data});
    }
});



router.get('/show/:id', async function(req, res, next) {
    con = await db.createConnection(inform);
    const my_id = req.body.id;
/*
	const accessToken = req.header('Authorization');
    if (accessToken == null) {
        res.send({status:400, message:'Bad Request', data:null});
        return;
    }
    var verify_success = await verify.verifyFunction(accessToken, my_id);
    if(!verify_success){
        res.send({status:400, message:'Bad Request', data:null});
        return;
    }
*/
	var id = req.params.id;
	var select_log_sql = "select * from payment_log where id = ?;";
	var select_log_param = id;
	console.log(id);
    const [select_log_result, select_log_field] = await con.query(select_log_sql, select_log_param);
    if(select_log_result.length==0){
        res.send({status:400, message:"Bad Request"});
    }
    else{
		var receiptPayment = select_log_result[0].receiptPayment;
		var name = select_log_result[0].name;
		var amount = select_log_result[0].amount;
		var unit = select_log_result[0].unit;
		var target = select_log_result[0].target;
		var storagePlace = select_log_result[0].storagePlace;
		var expirationDate = select_log_result[0].expirationDate;
		var createdAt = select_log_result[0].createdAt;
		var updatedAt = select_log_result[0].updatedAt;
		var confirmor_id = select_log_result[0].confirmor_id;
		var select_user_sql = "select * from user where id = ?;";
		var select_user_param = confirmor_id;
		const [select_user_result, select_user_field] = await con.query(select_user_sql, select_user_param);
		if(select_user_result.length==0){
			res.send({status:400, message:"Bad Request"});
		}
		else{
			var user_name = select_user_result[0].name;
			var email = select_user_result[0].email;
			var phoneNumber = select_user_result[0].phoneNumber;
			var serviceNumber = select_user_result[0].serviceNumber;
			var rank = select_user_result[0].mil_rank;
			var enlistmentDate = select_user_result[0].enlistmentDate;
			var dischargeDate = select_user_result[0].dischargeDate;
			var militaryUnit = select_user_result[0].militaryUnit;
			var user_createdAt = select_user_result[0].createdAt;
			var user_updatedAt = select_user_result[0].updatedAt;
			var user_data = {id:confirmor_id, name:user_name, email:email, phoneNumber:phoneNumber, serviceNumber:serviceNumber, rank:rank, enlistmentDate:enlistmentDate, dischargeDate:dischargeDate,militaryUnit:militaryUnit, createdAt:user_createdAt, updatedAt:user_updatedAt };
			var data = {id:id, receiptPayment:receiptPayment, name:name, amount:amount, unit:unit, target:target, storagePlace:storagePlace, expirationDate:expirationDate, confirmor:user_data, createdAt:createdAt, updatedAt:updatedAt};
			res.send({status:200, message:"Ok", data:data});
		}
	}
});


/*
router.post('/update', async function(req, res, next) {
    con = await db.createConnection(inform);
	const id = req.body.id;
	const receiptPayment = req.body.receiptPayment;
    const name = req.body.name;
    const amount = req.body.amount;
    const unit = req.body.unit;
    const target = req.body.target;
    const storagePlace = req.body.storagePlace;
    const expirationDate = req.body.expirationDate;
	const confirmor_id = req.body.confirmor_id;
	var update_log_sql = "update payment_log set receiptPayment = ?, name = ?, amount = ?,unit = ?, target=?, storagePlace = ?, expirationDate = ?, updatedAt = now() where id = ?;";
    var update_log_param = [final_amount, property_id];
                query_success = await myQuery(update_property_sql, update_property_param);
    const accessToken = req.header('Authorization');
    if (accessToken == null) {
        res.send({status:400, message:'Bad Request', data:null});
        return;
    }
    var verify_success = await verify.verifyFunction(accessToken, confirmor_id);
    if(!verify_success){
        res.send({status:400, message:'Bad Request', data:null});
        return;
    }

});
*/

router.post('/write', async function(req, res, next) {
	con = await db.createConnection(inform);
	const confirmor_id = req.body.confirmor_id;
/*
    const accessToken = req.header('Authorization');
    if (accessToken == null) {
        res.send({status:400, message:'Bad Request', data:null});
        return;
    }
    var verify_success = await verify.verifyFunction(accessToken, confirmor_id);
    if(!verify_success){
        res.send({status:400, message:'Bad Request', data:null});
        return;
    }
*/
	const receiptPayment = req.body.receiptPayment;
	const name = req.body.name;
	const amount = req.body.amount;
	const unit = req.body.unit;
	const target = req.body.target;
	const storagePlace = req.body.storagePlace;
	const expirationDate = req.body.expirationDate;
	//var myhash = crypto.createHash('sha1');
	//var encoded_id = crypto.createHash('sha256').update(name+" "+expirationDate).digest('base64');
	var property_id = name+"-"+expirationDate;
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
				var insert_log_sql = "insert into payment_log values (?,?,?,?,?,?,?,?,?,?,?,now(), now());";
				var id = property_id+"-1";
            	var insert_log_param = [id, "수입",name, amount,unit, target, storagePlace, expirationDate,confirmor_id, property_id, 1];
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
	else{	//해당 재산의 수불로그가 처음이 아님 -> 일단 이 재산이 지금 있는지 없는지부터 검색해야함 
		var next_property_log_num = select_result1[select_result1.length-1].property_log_num +1;
		var id = property_id+"-"+String(next_property_log_num);
	 	var select_property_sql = "select * from property where id = ?;";
		var select_property_param = property_id;
		const [select_property_result, select_property_field] = await con.query(select_property_sql,select_property_param);
		if(select_property_result.length==0){	//지금 이 재산의 재고가 하나도 없음 => insert 해야함 
			if(receiptPayment=="불출"){	//재고가 하나도 없는데 불출할수가 없으니 
				res.send({status:400, message:"Bad Request"});
                return;
			}
			var insert_property_sql = "insert into property values (?,?,?,?,?,?,now(),now());";
            var insert_log_param = [property_id, name, amount,unit,storagePlace, expirationDate];
			var insert_property_success = await myQuery(insert_property_sql, insert_property_param);
			if(insert_property_success){
				console.log("재산 db에 넣기 성공");				
			}
			else{
				res.send({status:400, message:"Bad Request"});
				return;
			}
		}
		else{									//지금 이 재산의 재고가 있음 = > amount 바꿔서 update 해야함 
			var origin_amount = select_property_result[0].amount;
			var final_amount;
			if(receiptPayment=="불출") final_amount=origin_amount-amount;
			else final_amount=origin_amount+amount;
			var query_success;
			if(final_amount==0){
				var delete_property_sql = "delete from property where id = ?;";
				var delete_property_param = property_id;
				query_success = await myQuery(delete_property_sql, delete_property_param);
			}
			else{
				var update_property_sql = "update property set amount = ?, updatedAt = now() where id = ?;";
            	var update_property_param = [final_amount, property_id];
            	query_success = await myQuery(update_property_sql, update_property_param);
			}
			if(query_success){
				console.log("재산 db 업뎃 성공");
			}
			else{
				res.send({status:400, message:"Bad Request"});
				return;
			}
		}
		//이까지 살아왔단 말은 property db에 업데이트 완료했단말 => 로그 기록 남기자 
		var insert_log_sql = "insert into payment_log values (?,?,?,?,?,?,?,?,?,?,?,now(), now());";
        var insert_log_param = [id, receiptPayment, name, amount,unit, target, storagePlace, expirationDate,confirmor_id, property_id, 1];
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
		//console.log(next_property_log_num);
		//res.send("success");
	}
});


module.exports = router;
