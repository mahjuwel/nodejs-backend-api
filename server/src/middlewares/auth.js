const createError = require('http-errors');
const jwt= require('jsonwebtoken');
const { jwtAccessKey } = require('../secret');

const isLoggedIn = async(req,res,next) =>{
    try {
        const accessToken = req.cookies.accessToken;
        if(!accessToken){
          throw createError(401, "Access token not found. Please login again.");
        }
        const decoded=jwt.verify(accessToken,jwtAccessKey);
        if(!decoded){
            throw createError(401, "Invalid access token. Please login again");
        }
        // console.log("from auth: ", decoded._id);
        req.body.userId = decoded._id;
        req.body.isAdmin = decoded.isAdmin;
        next();
    } catch (error) {
    return next(error); 
    }

}
const isLoggedOut = async(req,res,next) =>{
    try {
        const accessToken = req.cookies.accessToken;
        if(accessToken){
          throw createError(401, "User is already logged in.");
        }      
        next();
    } catch (error) {
    return next(error); 
    }

}

module.exports= {isLoggedIn, isLoggedOut}