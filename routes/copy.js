var express = require('express'); 
var router = express.Router(); 
//var db = require("../config");
var con;

//var db = require('mysql2/promise');
var db = require('mysql2/promise');
/*
var con = db.createConnection({
	host : "localhost",
    user : "root",
    password : "password",
    port : 3306,
    database : "test"
});
*/

router.get('/', async function(req,res){
    var sql1 = "select * from user;";
    //var sql2 = "select * from sadan;";
    var user_id;
    /* 
	var function1 = function(){
		con.query(sql1, function(err, result){
        	if(err){
           		console.log(err);
        	}
        	else{
            	console.log(sql1);
            	user_id = result[0].id;
				console.log(user_id+" 로 설정");
            //	console.log(user_id);
            //res.send("sql1.success");
        	}
    	});
	};
*/
	var function1 = function(){
		return new Promise((resolve, reject) => {
			con.query(sql1, function(err, result){
            	if(err){
                	console.log(err);
            	}
            	else{
                	console.log(sql1);
                	user_id = result[0].id;
                	console.log(user_id+" 로 설정");
            	}
        	});
		});		
	}
/*
	var function1 = function(){
        con.query(sql1, function(err, result){
            if(err){
                console.log(err);
            }
            else{
                console.log(sql1);
                user_id = result[0].id;
                console.log(user_id+" 로 설정");
            //  console.log(user_id);
            //res.send("sql1.success");
            }
        });
    };
*/
	var function2 = function(){
		console.log("여기서 "+user_id);
/*
		var sql2 = "select * from sadan where id = '"+user_id+"';";
        con.query(sql2, function(err, result){
        	if(err){
            	console.log(err);
        	}
        	else{
           		console.log(sql2);
            	console.log(result[0].name);
            //res.send("sql2 success");
        	}
    	});
*/
    };
	async function myfunction(){
		//var ret = await function1();
		//console.log(ret);
		try{
	   		var con = await db.createConnection({
    			host : "localhost",
    			user : "root",
    			password : "password",
    			port : 3306,
    			database : "test"
			});
			console.log("db연결 성공");
			let result = await con.query(sql1);
			console.log("새로운방법 : " + result[0]);
			/*
			await con.query(sql1, function(err, result){
            	if(err){
                	console.log(err);
            	}
            	else{
                	console.log(sql1);
                	user_id = result[0].id;
                	console.log(user_id+" 로 설정");
           		}
        	});
*/
        	console.log("1번함수 실행 완료");
        	function2();
		} catch(error){
			console.log(error);
		}
/*
		await con.query(sql1, function(err, result){
        	if(err){
            	console.log(err);
            }
            else{
                console.log(sql1);
                user_id = result[0].id;
                console.log(user_id+" 로 설정");
            }
        });
		console.log("1번함수 실행 완료");
		function2();
*/
	}
	myfunction();
/*
	function2();
	function1();
*/
/*
	con.query(sql1, select1);
	con.query(sql2, select2);
*/
	res.send("good!")
});

module.exports = router;
