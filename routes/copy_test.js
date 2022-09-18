var express = require('express'); 
var router = express.Router(); 
//var db = require("../config");


//var db = require('mysql2/promise');
var db = require('mysql2');

var con = db.createConnection({
	host : "localhost",
    user : "root",
    password : "password",
    port : 3306,
    database : "test"
});

con.connect();

router.get('/', function(req,res){
    var sql1 = "select * from user;";
	var sql2;
	var user_id;
    con.query(sql1, function(err, result){
        if(err){
            console.log(err);
        }
        else{
			user_id = result[0].id;
			
            console.log(user_id);
			sql2 = "select * from user where id = '"+user_id+"';";
			console.log(sql2);
            //res.send("success");
        }
    }); 
	con.query(sql2, function(err, result){
		console.log("여기안에서 sql2 : "+sql2);
        if(err){
            console.log(err);
        }
        else{
            console.log(result[0].id);
            res.send("success");
        }
    });

});

module.exports = router;
