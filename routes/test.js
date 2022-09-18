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
    database : "test"});
*/
var inform = {
    host : "localhost",
    user : "root",
    password : "password",
    port : 3306,
    database : "test"
};
router.get('/', async function(req,res){
	
	con = await db.createConnection(inform);
    var sql1 = "select * from user;";
    //var sql2 = "select * from sadan;";
    var user_id, user_sadan;
	async function myfunction(){
		try{
			const [row1, field1] = await con.query(sql1);
			//console.log(row1);
			console.log("user 테이블 크기 : "+row1.length);
			if(row1.length==0){
				console.log("빈 테이블입니다");
				res.send("fail");
			}
			else{
				user_id = row1[0].sadan_num;
           		console.log(row1[0].id);
            	console.log("1번함수 실행 완료");
            	var sql2 = "select * from sadan where num = '"+user_id+"';";
            	const [row2, field2] = await con.query(sql2);
            	console.log(row2[0]);
			}
		}catch(error){
			console.log(error);
		}
	}
	myfunction();
	//res.send("good!")
});

module.exports = router;
