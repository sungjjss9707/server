const jwt = require('jsonwebtoken');
const config = require('../config');
var issue_new_token = async function(my_email, my_name, expired_time){
	try {
    	const accessToken = await new Promise((resolve, reject) => {
        	jwt.sign({
        			email : my_email,
            		name : my_name
        		},
            	config.secret,
                        //config.secret,
            	{
            	expiresIn : expired_time,
            	},
            	(err, token) => {
            		if (err) {
                		reject(err);
                	} else {
                    	resolve(token);
                	}
            	});
        	});
        	return {success:true, Token:accessToken};
    	}catch(err) {
      		console.log(err);
        	return {success:false, errormessage:'token sign fail'};
    }
}
exports.issue_new_token = issue_new_token;

//module.exports = issue_new_token;
