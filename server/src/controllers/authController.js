const createError = require('http-errors');
const User = require('../models/userModel');
const { successResponse } = require('./responseController');
const { findWithId } = require('../services/findItem');
const jwt= require('jsonwebtoken');
const { createJSONWEBToken } = require('../helper/jsonwebtoken');
const bcrypt = require('bcryptjs');
const { jwtAccessKey, jwtAccessRefreshKey } = require('../secret');


const handleLogin= async(req, res, next) =>{
try {
 const {email, password} = req.body;
 const user = await User.findOne({email});
 if(!user){
 throw createError(404,"User does not exist with this email. Please register first");
 }
 const isPasswirdMatch= await bcrypt.compare(password, user.password);
 if(!isPasswirdMatch){

    throw createError(401,"Email or password did not match.");
 }

 if(user.isBanned){
    throw createError(403,"You are banned. Please contact the administrator");
 }

 const accessToken= createJSONWEBToken(
    {_id: user._id, isAdmin: user.isAdmin},
    jwtAccessKey,
    '1m');
 res.cookie('accessToken',accessToken, {
    maxAge: 1 * 60* 1000, // 1 minutes
    httpOnly: true,
    // secure: true,
    sameSite: 'none'
 });
 const refreshToken= createJSONWEBToken(
   {_id: user._id, isAdmin: user.isAdmin},
   jwtAccessRefreshKey,
   '7d');
res.cookie('refreshToken',refreshToken, {
   maxAge: 7 * 24 * 60 * 60* 1000, // 7days
   httpOnly: true,
   // secure: true,
   sameSite: 'none'
});
 const userWithoutPassword= await User.findOne({email}).select("-password");
 return successResponse(res,{
    statusCode:200,
    message: 'Loggedin successfully',
    payload: { userWithoutPassword }
});

} catch (error) {
 next(error); 
}
}
const handleLogout= async(req, res, next) =>{
    try {
    res.clearCookie('accessToken');
     return successResponse(res,{
        statusCode:200,
        message: 'User loggedout successfully',
        payload: { }
    });
    
    } catch (error) {
     next(error); 
    }
    }
    const isAdmin= async(req, res, next) =>{
      try {
      console.log('from isAdmin33:',req.body.isAdmin);
      console.log('from id:',req.body.userId);
      const admin= req.body.isAdmin;
      if(!admin){
       throw createError(403,"You are not allowed to access this data");
      }
      console.log(req.isAdmin);
      next();
      
      } catch (error) {
       next(error); 
      }
      }
      const handleRefreshToken= async(req, res, next) =>{
         try {
        const oldRefreshToken=req.cookies.refreshToken;
        //verify old refresh token
        const decodedToken= jwt.verify(oldRefreshToken,jwtAccessRefreshKey);
        if(!decodedToken){
         throw createError(401,'Invalid refresh token. Please login and try again.');
        } 
        const accessToken= createJSONWEBToken(
         {_id: decodedToken._id, isAdmin: decodedToken.isAdmin},
         jwtAccessKey,
         '1m');
       res.cookie('accessToken',accessToken, {
         maxAge: 1 * 60* 1000, // 1 minutes
         httpOnly: true,
         // secure: true,
         sameSite: 'none'
         });
          return successResponse(res,{
             statusCode:200,
             message: 'New Accesss Token generated',
             payload: { }
         });
         
         } catch (error) {
          next(error); 
         }
         }
         const handleProtectedRoute= async(req, res, next)=>{
            try {
               const accessToken=req.cookies.accessToken;
               //verify old refresh token
               const decodedToken= jwt.verify(accessToken,jwtAccessKey);
               if(!decodedToken){
                throw createError(401,'Invalid access token. Please login and try again.');
               } 
        
                 return successResponse(res,{
                    statusCode:200,
                    message: 'Proteded resources access success',
                    payload: { }
                });
                
                } catch (error) {
                 next(error); 
                }
         }
module.exports={
    handleLogin,
    handleLogout,
    isAdmin,
    handleRefreshToken,
    handleProtectedRoute
}