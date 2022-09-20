var express = require('express'); 
var bcrypt = require('bcrypt');
var router = express.Router(); 
var con;
var db = require('mysql2/promise');
var mysql = require('../config');
var crypto = require('crypto');
var inform = mysql.inform;


async function myQuery(sql, param){
    try{
        const [row, field] = await con.query(sql,param);
        return true;
    }catch(error){
        console.log(error);
        return false;
    }
}


router.post('/register', async function(req, res, next) {
    console.log("REISTER-PAGE");
	con = await db.createConnection(inform);
	//con.connect(err => {
	 // if (err) throw new Error(err);
	//});
	const name = req.body.name;
	const amount = req.body.amount;
	const unit = req.body.unit;
	const storagePlace = req.body.storagePlace;
	const expirationDate = req.body.expirationDate;
	//var myhash = crypto.createHash('sha1');
	//var encoded_id = crypto.createHash('sha256').update(name+" "+expirationDate).digest('base64');
	var encoded_id = name+" "+expirationDate;
	var select_sql = "select * from property where id = ?;";
    var select_param = encoded_id;
    const [select_result1, field1] = await con.query(select_sql,select_param);
	if(select_result1.length==0){
		var insert_sql = "insert into property values (?,?,?,?,?,?,now(), now());";
    	var insert_param = [encoded_id, name, amount, unit, storagePlace, expirationDate];
    	var insert_success = await myQuery(insert_sql, insert_param);
    	if(insert_success){
        	const [select_result2, field2] = await con.query(select_sql,select_param);
        	if(select_result2.length!=0){
            	var created_time = select_result2[0].createdAt;
            	var updated_time = select_result2[0].updatedAt;
            //console.log(created_time+" "+updated_time);
            	var data = {id : encoded_id, name : name, amount:amount, unit:unit, storagePlace:storagePlace, expirationDate:expirationDate, createdAt:created_time, updatedAt : updated_time};
				////////////////////////////////////////////////////////////////여기에 수불로그도 업데이트 해줘야함
            	res.send({status:200, message:"Ok", data:data});
        	}
        	else{
            	res.send({status:400, message:"Bad Request"});
        	}

    	}
     //res.send("가입 완료");
    	else res.send({status:400, message:"Bad Request"});
	}
	else{
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
	}
});






router.get('/show/:id', async function(req, res, next) {
    console.log("show-PAGE");
	const id = req.params.id;
	con = await db.createConnection(inform);
    var select_sql = "select * from property where id = ?;";
    var select_param = id;
    const [select_result1, field1] = await con.query(select_sql,select_param);
    if(select_result1.length==0){
        res.send({status:400, message:"Bad Request"});
    }
    else{
		console.log(select_result1);
		var name = select_result1[0].name;
		var amount = select_result1[0].amount;
		var unit = select_result1[0].unit;
		var storagePlace = select_result1[0].storagePlace;
		var expirationDate = select_result1[0].expirationDate;
        var created_time = select_result1[0].createdAt;
        var updated_time = select_result1[0].updatedAt;
		console.log(created_time+" "+updated_time);
        var data = {id :id, name : name, amount:amount, unit:unit, storagePlace:storagePlace, expirationDate:expirationDate, createdAt:created_time, updatedAt : updated_time};
        res.send({status:200, message:"Ok", data:data});
    }
});



module.exports = router;
