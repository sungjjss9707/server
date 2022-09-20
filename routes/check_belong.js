var express = require('express'); 
const config = require('../config');
var router = express.Router(); 
var con;
var db = require('mysql2/promise');
var mysql = require('../config')
var inform = mysql.inform;

router.post('/', async function(req, res, next) {
    console.log("check_belong page");

	const militaryUnit = req.body.militaryUnit;
    const accessCode = req.body.accessCode;
	con = await db.createConnection(inform);
	var select_sql = "select * from mil_and_code where militaryUnit = ?;";
	var select_param = militaryUnit;
	//console.log(sql1);
	const [row1, field1] = await con.query(select_sql, select_param);
	if(row1.length==0){
        console.log("없는 부대입니다.");
        res.send({status:400, message:"Bad Request",data:false});
    }
    else{
		if(row1[0].accessCode==accessCode){
			res.send({status:200, message:"Ok", data:true});
		}
		else{
			res.send({status:400, message:"Bad Request", data:false});
		}
    }
});

module.exports = router;
