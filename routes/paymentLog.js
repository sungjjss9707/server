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


router.get('/show', async function(req, res, next) {
    con = await db.createConnection(inform);
    const my_id = req.body.id;
    const check_militaryUnit = "select militaryUnit from user where id = ?;";
    const check_militaryUnit_param = my_id;
    const [check_militaryUnit_result] = await con.query(check_militaryUnit, check_militaryUnit_param);
    if(check_militaryUnit_result.length==0){
        res.send({status:400, message:'Bad Request', data:null});
        return;
    }
    var militaryUnit = check_militaryUnit_result[0].militaryUnit;
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
    var select_log_sql = "select * from paymentLog_"+militaryUnit+";";
    const [select_log_result, select_log_field] = await con.query(select_log_sql);
    if(select_log_result.length==0){
        res.send({status:400, message:"Bad Request"});
    }
    else{
		//var receiptPayment, confirmor_id, target, YearMonthDate, log_num, property_id_arr, storagePlace_arr, amount_arr, unit_arr, createdAt, updatedAt;
		//var arr_property_id, arr_storagePlace, 
		var data = [];
		for(let i=0; i<select_log_result.length; ++i){
			var id = select_log_result[i].id;
			var receiptPayment = select_log_result[i].receiptPayment;
        	var confirmor_id = select_log_result[i].confirmor_id;
        	var target = select_log_result[i].target;
        	var YearMonthDate = select_log_result[i].YearMonthDate;
        	var log_num = select_log_result[i].log_num;
        	var property_id_arr = select_log_result[i].property_id_arr;
        	var storagePlace_arr = select_log_result[i].storagePlace_arr;
        	var amount_arr = select_log_result[i].amount_arr;
        	var unit_arr = select_log_result[i].unit_arr;
       		var createdAt = select_log_result[i].createdAt;
        	var updatedAt = select_log_result[i].updatedAt;
        	var arr_property_id = property_id_arr.split('/');   ////////////////
        	var arr_storagePlace = storagePlace_arr.split('/'); ////////////////
        	var str_arr_amount = amount_arr.split('/');
        	var arr_unit = unit_arr.split('/');//////////////////
        	var arr_amount = [];    ////////////////////
        	var arr_name = [];  ///////////////////
        	var arr_expirationDate = [];    ///////////
        	var len = arr_property_id.length;
        	var getsu;
			for(let k=0; k<str_arr_amount.length; ++k){
            	getsu = parseInt(str_arr_amount[k]);
            	arr_amount.push(getsu);
        	}
        	var p_id;
        	for(let k=0; k<arr_property_id.length; ++k){
            	p_id = arr_property_id[k];
            	var id_split = p_id.split('-');
            	arr_name.push(id_split[0]);
            	var myexpirationDate = id_split[1]+"-"+id_split[2]+"-"+id_split[3];
            	arr_expirationDate.push(myexpirationDate);
        	}
        	var items = [];
        	var individual_item;
        	for(let k=0; k<len; ++k){
            	individual_item = {name:arr_name[k], amount:arr_amount[k], unit:arr_unit[k], storagePlace:arr_storagePlace[k], expirationDate:arr_expirationDate[k]};
            	items.push(individual_item);
        	}
			var select_user_sql = "select * from user where id = ?;";
        	var select_user_param = confirmor_id;
        	const [select_user_result, select_user_field] = await con.query(select_user_sql, select_user_param);
			if(select_user_result.length==0){
         	   res.send({status:400, message:"Bad Request"});
				return;
        	}
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
            var individual_data = {id:id, receiptPayment:receiptPayment, target:target,items:items, confirmor:user_data, createdAt:createdAt, updatedAt:updatedAt};
            //res.send({status:200, message:"Ok", data:data});
			data.push(individual_data);
		}
		res.send({status:200, message:"Ok", data:data});
	}
});



router.get('/show/:id', async function(req, res, next) {
    con = await db.createConnection(inform);
    const my_id = req.body.id;
    const check_militaryUnit = "select militaryUnit from user where id = ?;";
    const check_militaryUnit_param = my_id;
    const [check_militaryUnit_result] = await con.query(check_militaryUnit, check_militaryUnit_param);
    if(check_militaryUnit_result.length==0){
        res.send({status:400, message:'Bad Request', data:null});
        return;
    }
    var militaryUnit = check_militaryUnit_result[0].militaryUnit;
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
    var select_log_sql = "select * from paymentLog_"+militaryUnit+" where id = ?;";
    var select_log_param = id;
    const [select_log_result, select_log_field] = await con.query(select_log_sql, select_log_param);
    if(select_log_result.length==0){
        res.send({status:400, message:"Bad Request"});
    }
    else{
        var receiptPayment = select_log_result[0].receiptPayment;
		var confirmor_id = select_log_result[0].confirmor_id;
        var target = select_log_result[0].target;
		var YearMonthDate = select_log_result[0].YearMonthDate;
		var log_num = select_log_result[0].log_num;
		var property_id_arr = select_log_result[0].property_id_arr;
		var storagePlace_arr = select_log_result[0].storagePlace_arr;
		var amount_arr = select_log_result[0].amount_arr;
		var unit_arr = select_log_result[0].unit_arr;
		var createdAt = select_log_result[0].createdAt;
		var updatedAt = select_log_result[0].updatedAt;
		console.log(property_id_arr);
		console.log(storagePlace_arr);
		console.log(amount_arr);
		console.log(unit_arr);
		var arr_property_id = property_id_arr.split('/');	////////////////
		var arr_storagePlace = storagePlace_arr.split('/'); ////////////////
		var str_arr_amount = amount_arr.split('/');
		var arr_unit = unit_arr.split('/');//////////////////
		var arr_amount = [];	////////////////////
		var arr_name = [];	///////////////////
		var arr_expirationDate = [];	///////////
		var len = arr_property_id.length;
		var getsu;
		for(let i=0; i<str_arr_amount.length; ++i){
            getsu = parseInt(str_arr_amount[i]);
			arr_amount.push(getsu);
        }
		var p_id;
		for(let i=0; i<arr_property_id.length; ++i){
            p_id = arr_property_id[i];
			var id_split = p_id.split('-');
			arr_name.push(id_split[0]);
			var myexpirationDate = id_split[1]+"-"+id_split[2]+"-"+id_split[3];
			arr_expirationDate.push(myexpirationDate);
        }
		var items = [];
		var individual_item;
		for(let i=0; i<len; ++i){
			individual_item = {name:arr_name[i], amount:arr_amount[i], unit:arr_unit[i], storagePlace:arr_storagePlace[i], expirationDate:arr_expirationDate[i]};
			items.push(individual_item);
		}	
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
            militaryUnit = select_user_result[0].militaryUnit;
            var user_createdAt = select_user_result[0].createdAt;
            var user_updatedAt = select_user_result[0].updatedAt;
            var user_data = {id:confirmor_id, name:user_name, email:email, phoneNumber:phoneNumber, serviceNumber:serviceNumber, rank:rank, enlistmentDate:enlistmentDate, dischargeDate:dischargeDate,militaryUnit:militaryUnit, createdAt:user_createdAt, updatedAt:user_updatedAt };
            var data = {id:id, receiptPayment:receiptPayment, target:target,items:items, confirmor:user_data, createdAt:createdAt, updatedAt:updatedAt};
            res.send({status:200, message:"Ok", data:data});
        }
    }
});


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
	var unit_arr = [];
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
			unit_arr.push(unit);
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
				insert_storagePlace_sql = "insert into storagePlace_"+militaryUnit+" values (?,?,?,?,?);";
                insert_storagePlace_param = [storagePlace_id,property_id,storagePlace,amount,unit];
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
					insert_storagePlace_sql = "insert into storagePlace_"+militaryUnit+" values (?,?,?,?,?);";
                	insert_storagePlace_param = [storagePlace_id,property_id,storagePlace,amount,unit];
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
			unit_arr.push(unit);
            amount_arr.push(amount);
            console.log(property_id);
            select_property_sql = "select * from property_"+militaryUnit+" where id = ?;";
            select_property_param = property_id;
            [select_property_result] = await con.query(select_property_sql, select_property_param);
            if(select_property_result.length==0){
                res.send({status:400, message:"Bad Request", data:null});
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
                    res.send({status:400, message:"Bad Request", data:null});
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
                    insert_storagePlace_sql = "insert into storagePlace_"+militaryUnit+" values (?,?,?,?,?);";
                    insert_storagePlace_param = [storagePlace_id,property_id,target,amount,unit];
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
			unit_arr.push(unit);
            console.log(property_id);
            select_property_sql = "select * from property_"+militaryUnit+" where id = ?;";
            select_property_param = property_id;
            [select_property_result] = await con.query(select_property_sql, select_property_param);
            if(select_property_result.length==0){ 
				res.send({status:400, message:"Bad Request", data:null});
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
					res.send({status:400, message:"Bad Request", data:null});
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
	var str_unit_arr = "";
	var len = property_id_arr.length;
	for(let i=0; i<len; ++i){
		str_property_id_arr+=property_id_arr[i];
		str_storagePlace_arr+=storagePlace_arr[i];
		str_amount_arr+=String(amount_arr[i]);
		str_unit_arr+=unit_arr[i];
		if(i<len-1){
			str_property_id_arr+="/";
        	str_storagePlace_arr+="/";
        	str_amount_arr+="/";
			str_unit_arr+="/";
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
	var insert_log_sql = "insert into paymentLog_"+militaryUnit+" values (?,?,?,?,?,?,?,?,?,?,now(), now());";
	var insert_log_param = [log_id, receiptPayment, confirmor_id, target ,now, nextnum, str_property_id_arr, str_storagePlace_arr, str_amount_arr, str_unit_arr];
	var insert_log_result = await myQuery(insert_log_sql, insert_log_param);
	if(!insert_log_result){
		res.send({status:400, message:"Bad Request", data:null});
		return;
	}
	var select_user_sql = "select * from user where id = ?;";
	var select_user_param = confirmor_id;
	var [result] = await con.query(select_user_sql, select_user_param);
	if(result.length==0){
		res.send({status:400, message:"Bad Request", data:null});
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
