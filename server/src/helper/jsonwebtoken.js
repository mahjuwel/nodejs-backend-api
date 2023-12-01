const jwt = require('jsonwebtoken');
const createJSONWEBToken = (payload, secretKey, expiresIn) =>{
const token = jwt.sign(payload, secretKey, {expiresIn});
 return token;
}

module.exports= {createJSONWEBToken};