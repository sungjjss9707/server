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


router.post('/write', async function(req, res, next) {
	con = await db.createConnection(inform);
	const confirmor_id = req.body.confirmor;
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
	const check_militaryUnit = "select militaryUnit from user where id = ?;";
    const check_militaryUnit_param = confirmor_id;
    const [check_militaryUnit_result] = await con.query(check_militaryUnit, check_militaryUnit_param);
    if(check_militaryUnit_result.length==0){
        res.send({status:400, message:'Bad Request', data:null});
        return;
    }
    var militaryUnit = check_militaryUnit_result[0].militaryUnit;
	const receiptPayment = req.body.receiptPayment;
	const target = req.body.target;
	const items = req.body.items;
	console.log(items);
	const curr = new Date();
	const utc = curr.getTime() + (curr.getTimezoneOffset() * 60 * 1000);
	const KR_TIME_DIFF = 9*60*60*1000;
	const today = new Date(utc+KR_TIME_DIFF);
	var year = today.getFullYear();
	var month = today.getMonth()+1;
	var date = today.getDate();
	var hours = today.getHours();
	var minutes = today.getMinutes();
	//const day = today.getDay();
	//console.log(year+"-"+month+"-"+date+"-"+hours+"-"+minutes);
	if(receiptPayment=="수입"){
		var property_id, name, amount, unit,storagePlace, expirationDate;
		var storagePlace_id;
		var select_property_sql, select_property_param, select_property_result;
		var select_storagePlace_sql, select_storagePlace_param, select_storagePlace_result;
		var insert_property_sql, insert_property_param, insert_property_result;
		var insert_storagePlace_sql, insert_storagePlace_param, insert_storagePlace_result;
		var update_property_sql, update_property_param, update_property_result;
        var update_storagePlace_sql, update_storagePlace_param, update_storagePlace_result;
		for(let i=0; i<items.length; ++i){
			console.log("--------------------------");
			name = items[i].name;
			amount = items[i].amount;
			unit = items[i].unit;
			storagePlace = items[i].storagePlace;
			expirationDate = items[i].expirationDate;
			property_id = name+"-"+expirationDate;
			console.log(property_id);
			select_property_sql = "select * from property_"+militaryUnit+" where id = ?;";
			select_property_param = property_id;
			[select_property_result] = await con.query(select_property_sql, select_property_param);
			if(select_property_result.length==0){	//새로 재산에 넣고 storagePlace에도 넣기 
				insert_property_sql = "insert into property_"+militaryUnit+" values (?,?,?,?,?,now(), now());";
				insert_property_param = [property_id,name,amount,unit,expirationDate];
				insert_property_result = await myQuery(insert_property_sql, insert_property_param);
				if(insert_property_result){
					console.log(property_id+" property 테이블 insert 성공");
				}
				else{
					console.log(property_id+" property 테이블 insert 실패");
				}
				storagePlace_id = property_id+"-"+storagePlace;
				insert_storagePlace_sql = "insert into storagePlace_"+militaryUnit+" values (?,?,?,?);";
                insert_storagePlace_param = [storagePlace_id,property_id,storagePlace,amount];
                insert_storagePlace_result = await myQuery(insert_storagePlace_sql, insert_storagePlace_param);
				if(insert_storagePlace_result){
                    console.log(storagePlace_id+" storagePlace 테이블 insert 성공");
                }
                else{
                    console.log(storagePlace_id+" storagePlace 테이블 insert 실패");
                }
			}
			else{	////재산 테이블 수정 storagePlace도 수정
				var origin_total_amount = select_property_result[0].totalAmount;
				var finalAmount = origin_total_amount+amount;
				console.log(finalAmount+" 씨발");
				update_property_sql = "update property_"+militaryUnit+" set totalAmount = ?, updatedAt = now() where id = ?;";
                update_property_param = [finalAmount, property_id];
                udpate_property_result = await myQuery(update_property_sql, update_property_param);
                if(update_property_result){
                    console.log(property_id+" property 테이블 update 성공");
                }
                else{
                    console.log(property_id+" property 테이블 update 실패");
                }
                storagePlace_id = property_id+"-"+storagePlace;
				select_storagePlace_sql = "select * from storagePlace_"+militaryUnit+" where id = ?;";
				select_storagePlace_param = storagePlace_id;
				console.log("스토리즈 플레이스 아이디 : "+select_storagePlace_param);
				[select_storagePlace_result] = await con.query(select_storagePlace_sql, select_storagePlace_param);
				console.log("길이 : "+select_storagePlace_result.length);
				if(select_storagePlace_result.length==0){	 //원래 그 약장함에 약이 없었음 => insert 
					console.log(storagePlace+" 에 "+property_id+" 약이 없었으니까 insert 함");
					insert_storagePlace_sql = "insert into storagePlace_"+militaryUnit+" values (?,?,?,?);";
                	insert_storagePlace_param = [storagePlace_id,property_id,storagePlace,amount];
                	insert_storagePlace_result = await myQuery(insert_storagePlace_sql, insert_storagePlace_param);
                	if(insert_storagePlace_result){
                   		console.log(storagePlace_id+" storagePlace 테이블 insert 성공");
                	}
                	else{
                    	console.log(storagePlace_id+" storagePlace 테이블 insert 실패");
                	}
				}
				else{	//원래 그 약장함에 약이 있었음 => update
					
					var origin_amount = select_storagePlace_result[0].amount;
					var final_amount = origin_amount+amount;
					console.log(origin_amount+" "+final_amount);
					update_storagePlace_sql = "update storagePlace_"+militaryUnit+" set amount = ? where id = ?;";
                    update_storagePlace_param = [final_amount, storagePlace_id];
                   	update_storagePlace_result = await myQuery(update_storagePlace_sql, update_storagePlace_param);
                    if(update_storagePlace_result){
                        console.log(storagePlace_id+" storagePlace 테이블 update 성공");
                    }
                    else{
                        console.log(storagePlace_id+" storagePlace 테이블 update 실패");
                    }
				}
			}
		}			
	}
	else{

	}
});


























module.exports = router;
