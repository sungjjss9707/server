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
	var property_id, name, amount, unit,storagePlace, expirationDate;
    var storagePlace_id;
    var select_property_sql, select_property_param, select_property_result;
    var select_storagePlace_sql, select_storagePlace_param, select_storagePlace_result;
    var insert_property_sql, insert_property_param, insert_property_result;
    var insert_storagePlace_sql, insert_storagePlace_param, insert_storagePlace_result;
    var update_property_sql, update_property_param, update_property_result;
    var update_storagePlace_sql, update_storagePlace_param, update_storagePlace_result;
    var delete_property_sql, delete_property_param, delete_property_result;
    var delete_storagePlace_sql, delete_storagePlace_param, delete_storagePlace_result;
	var property_id_arr = [];
	var storagePlace_arr = [];
	var amount_arr = [];
	//const day = today.getDay();
	//console.log(year+"-"+month+"-"+date+"-"+hours+"-"+minutes);
	if(receiptPayment=="수입"){
		for(let i=0; i<items.length; ++i){
			console.log("--------------------------");
			name = items[i].name;
			amount = items[i].amount;
			unit = items[i].unit;
			storagePlace = items[i].storagePlace;
			expirationDate = items[i].expirationDate;
			property_id = name+"-"+expirationDate;
			property_id_arr.push(property_id);
			storagePlace_arr.push(storagePlace);
			amount_arr.push(amount);
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
                update_property_result = await myQuery(update_property_sql, update_property_param);
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
	else if(receiptPayment=="이동"){
		for(let i=0; i<items.length; ++i){
            console.log("--------------------------");
            name = items[i].name;
            amount = items[i].amount;
            unit = items[i].unit;
            storagePlace = items[i].storagePlace;
            expirationDate = items[i].expirationDate;
            property_id = name+"-"+expirationDate;
			property_id_arr.push(property_id);
            storagePlace_arr.push(storagePlace);
            amount_arr.push(amount);
            console.log(property_id);
            select_property_sql = "select * from property_"+militaryUnit+" where id = ?;";
            select_property_param = property_id;
            [select_property_result] = await con.query(select_property_sql, select_property_param);
            if(select_property_result.length==0){
                res.send({status:200, message:"Ok", data:null});
                return;
            }
            else{   ////재산 테이블 수정할필요가 없음 바로 storagePlace 수정
                storagePlace_id = property_id+"-"+storagePlace;
                select_storagePlace_sql = "select * from storagePlace_"+militaryUnit+" where id = ?;";
                select_storagePlace_param = storagePlace_id;
                console.log("스토리즈 플레이스 아이디 : "+select_storagePlace_param);
                [select_storagePlace_result] = await con.query(select_storagePlace_sql, select_storagePlace_param);
                console.log("길이 : "+select_storagePlace_result.length);
                if(select_storagePlace_result.length==0){    //원래 그 약장함에 약이 없었음 => 에러
                    res.send({status:200, message:"Ok", data:null});
                    return;
                }
				else{   
                    var origin_amount = select_storagePlace_result[0].amount;
                    var final_amount = origin_amount-amount;
                    //console.log(origin_amount+" "+final_amount);
                    if(final_amount==0){
                        delete_storagePlace_sql = "delete from storagePlace_"+militaryUnit+" where id = ?;";
                        delete_storagePlace_param = storagePlace_id;
                        delete_storagePlace_result = await myQuery(delete_storagePlace_sql, delete_storagePlace_param);
                        if(delete_storagePlace_result){
                            console.log(property_id+" storagePlace 테이블 삭제  성공");
                        }
                        else{
                            console.log(property_id+" storagePlace 테이블 삭제 실패");
                        }
                    }
                    else{
                        update_storagePlace_sql = "update storagePlace_"+militaryUnit+" set amount = ? where id = ?;";
                        update_storagePlace_param = [final_amount, storagePlace_id];
                        update_storagePlace_result = await myQuery(update_storagePlace_sql, update_storagePlace_param);
                        console.log(update_storagePlace_result);
                        if(update_storagePlace_result){
                            console.log(storagePlace_id+" storagePlace 테이블 update 성공");
                        }
                        else{
                            console.log(storagePlace_id+" storagePlace 테이블 update 실패");
                        }
                    }
                }
				storagePlace_id = property_id+"-"+target;
                select_storagePlace_sql = "select * from storagePlace_"+militaryUnit+" where id = ?;";
                select_storagePlace_param = storagePlace_id;
				[select_storagePlace_result] = await con.query(select_storagePlace_sql, select_storagePlace_param);
				console.log(select_storagePlace_result[0]);
				if(select_storagePlace_result.length==0){    //원래 그 약장함에 약이 없었음 => insert
                    console.log(storagePlace+" 에 "+property_id+" 약이 없었으니까 insert 함");
                    insert_storagePlace_sql = "insert into storagePlace_"+militaryUnit+" values (?,?,?,?);";
                    insert_storagePlace_param = [storagePlace_id,property_id,target,amount];
                    insert_storagePlace_result = await myQuery(insert_storagePlace_sql, insert_storagePlace_param);
                    if(insert_storagePlace_result){
                        console.log(storagePlace_id+" storagePlace 테이블 insert 성공");
                    }
                    else{
                        console.log(storagePlace_id+" storagePlace 테이블 insert 실패");
                    }
                }
                else{   //원래 그 약장함에 약이 있었음 => update

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
        for(let i=0; i<items.length; ++i){
            console.log("--------------------------");
            name = items[i].name;
            amount = items[i].amount;
            unit = items[i].unit;
            storagePlace = items[i].storagePlace;
            expirationDate = items[i].expirationDate;
            property_id = name+"-"+expirationDate;
			property_id_arr.push(property_id);
            storagePlace_arr.push(storagePlace);
            amount_arr.push(amount);
            console.log(property_id);
            select_property_sql = "select * from property_"+militaryUnit+" where id = ?;";
            select_property_param = property_id;
            [select_property_result] = await con.query(select_property_sql, select_property_param);
            if(select_property_result.length==0){ 
				res.send({status:200, message:"Ok", data:null});
				return;
            }
			else{   ////재산 테이블 수정 storagePlace도 수정
                var origin_total_amount = select_property_result[0].totalAmount;
                var finalAmount = origin_total_amount-amount;
				if(finalAmount==0){
					delete_property_sql = "delete from property_"+militaryUnit+" where id = ?;";
                    delete_property_param = property_id;
                    delete_property_result = await myQuery(delete_property_sql, delete_property_param);
                    if(delete_property_result){
                        console.log(property_id+" property 테이블 삭제  성공");
                    }
                    else{
                        console.log(property_id+" property 테이블 삭제 실패");
                    }	
				}
				else{
					update_property_sql = "update property_"+militaryUnit+" set totalAmount = ?, updatedAt = now() where id = ?;";
                	update_property_param = [finalAmount, property_id];
                	update_property_result = await myQuery(update_property_sql, update_property_param);
                	console.log("사실여부 : "+update_property_result);
                	if(update_property_result){
                    	console.log(property_id+" property 테이블 update 성공");
                	}
                	else{
                    	console.log(property_id+" property 테이블 update 실패");
                	}
				}
                storagePlace_id = property_id+"-"+storagePlace;
                select_storagePlace_sql = "select * from storagePlace_"+militaryUnit+" where id = ?;";
                select_storagePlace_param = storagePlace_id;
                console.log("스토리즈 플레이스 아이디 : "+select_storagePlace_param);
                [select_storagePlace_result] = await con.query(select_storagePlace_sql, select_storagePlace_param);
                console.log("길이 : "+select_storagePlace_result.length);
                if(select_storagePlace_result.length==0){    //원래 그 약장함에 약이 없었음 => 에러
                	res.send({status:200, message:"Ok", data:null});
                	return;
				}
	/////////////////////
                else{   //원래 그 약장함에 약이 있었음 => update
                    var origin_amount = select_storagePlace_result[0].amount;
                    var final_amount = origin_amount-amount;
                    //console.log(origin_amount+" "+final_amount);
					if(final_amount==0){
						delete_storagePlace_sql = "delete from storagePlace_"+militaryUnit+" where id = ?;";
                    	delete_storagePlace_param = storagePlace_id;
                    	delete_storagePlace_result = await myQuery(delete_storagePlace_sql, delete_storagePlace_param);
                    	if(delete_storagePlace_result){
                        	console.log(property_id+" storagePlace 테이블 삭제  성공");
                    	}
                    	else{
                        	console.log(property_id+" storagePlace 테이블 삭제 실패");
                    	}
					}
					else{
						update_storagePlace_sql = "update storagePlace_"+militaryUnit+" set amount = ? where id = ?;";
                    	update_storagePlace_param = [final_amount, storagePlace_id];
                    	update_storagePlace_result = await myQuery(update_storagePlace_sql, update_storagePlace_param);
                    	console.log(update_storagePlace_result);
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
	}
	////////
	var str_property_id_arr = "";
	var str_storagePlace_arr = "";
	var str_amount_arr = "";
	var len = property_id_arr.length;
	for(let i=0; i<len; ++i){
		str_property_id_arr+=property_id_arr[i];
		str_storagePlace_arr+=storagePlace_arr[i];
		str_amount_arr+=String(amount_arr[i]);
		if(i<len-1){
			str_property_id_arr+="/";
        	str_storagePlace_arr+="/";
        	str_amount_arr+="/";
		}
	}
	console.log(str_property_id_arr);
	console.log(str_storagePlace_arr);
	console.log(str_amount_arr);
	var now = year+"-"+month+"-"+date;
	console.log(now);
	var select_now_sql = "select * from paymentLog_"+militaryUnit+" where YearMonthDate = ?;";
	var select_now_param = now;
	var[select_now_result, select_now_param] = await con.query(select_now_sql, select_now_param);
	var log_id, nextnum;
	if(select_now_result.length==0){
		log_id = now+"-1";
		nextnum = 1;
	}
	else{
		nextnum = select_now_result[select_now_result.length-1].log_num+1;
		log_id = now+"-"+String(nextnum);
	}
	var insert_log_sql = "insert into paymentLog_"+militaryUnit+" values (?,?,?,?,?,?,?,?,?,now(), now());";
	var insert_log_param = [log_id, receiptPayment, confirmor_id, target ,now, nextnum, str_property_id_arr, str_storagePlace_arr, str_amount_arr];
	var insert_log_result = await myQuery(insert_log_sql, insert_log_param);
	if(!insert_log_result){
		res.send("실패");
		return;
	}
	var select_user_sql = "select * from user where id = ?;";
	var select_user_param = confirmor_id;
	var [result] = await con.query(select_user_sql, select_user_param);
	if(result.length==0){
		res.send("실패");
        return;
	}	
	var confirmor = {id:result[0].id, name:result[0].name, email:result[0].email, phoneNumber:result[0].phoneNumber, serviceNumber:result[0].serviceNumber, rank:result[0].rank, enlistmentDate:result[0].enlistmentDate, dischargeDate:result[0].dischargeDate, militaryUnit:result[0].militaryUnit, createdAt:result[0].createdAt, updatedAt:result[0].updatedAt};
	var check_time_sql = "select createdAt, updatedAt from paymentLog_"+militaryUnit+" where id = ?;";
    var check_time_param = log_id;
    var [time_result] = await con.query(check_time_sql, check_time_param);
	if(time_result.length==0){
        res.send("실패");
        return;
    }
	var created_time = time_result[0].createdAt;
	var updated_time = time_result[0].updatedAt;
	var data = {id:log_id, receiptPayment:receiptPayment, target:target, items:items, confirmor:confirmor, createdAt:created_time, updatedAt:updated_time};
	res.send({status:200, message:"Ok", data:data});
	









	//오늘날짜로 yearmonthdate 조회해서 없으면 1번부터, 있으면 마지막+1 로 아이디 만들고 나머지거 insert하기
});



module.exports = router;
