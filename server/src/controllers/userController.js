const fs = require('fs').promises;
const createError = require('http-errors');
const { successResponse } = require('./responseController');
const { findWithId } = require('../services/findItem');
const { deleteImage } = require('../helper/deleteImage');
const { createJSONWEBToken } = require('../helper/jsonwebtoken');
const { jwtActivationKey, clientURL, jwtResetPasswordKey } = require('../secret');
const emailWithNodeMailer = require('../helper/email');
const jwt= require('jsonwebtoken');
const User = require('../models/userModel');
const bcrypt =require('bcryptjs');

const getUsers= async(req, res, next)=>{
    try {
        const search = req.query.search || "";
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 5;
        const searchRegExp= new RegExp('.*'+ search + ".*",'i');
        const filter = {
            isAdmin: {$ne: true},
            $or:[
                {name: {$regex:searchRegExp}},
                {email: {$regex:searchRegExp}},
                {phone: {$regex:searchRegExp}},
            ]
        };
        const options = {password: 0}
        const users= await User.find(filter,options)
        .limit(limit)
        .skip((page-1)*limit);
        const count = await User.find(filter).countDocuments();
        if(!users) throw createError(404, "No users found!");      
        return successResponse(res,{
            statusCode:200,
            message: 'users are returned successfully',
            payload: {
                users,
                pagination: {
                    totalPages: Math.ceil(count/limit),
                    currentPage: page,
                    previousPage: page-1 >0 ? page-1 : null,
                    nextPage: page + 1 <= Math.ceil(count / limit) ? page + 1 : null,
                } 

            }
        });
    } catch (error) {
        next(error);
    }
    
 }

 const getUserById= async(req,res,next) => {
    try {
        console.log("id from auth: ",req.body.userId);
        const id= req.params.id;     
        const options= {password: 0};  
        const user = await findWithId(User, id, options);
        return successResponse(res, {
            statusCode:200,
            message: 'user is returned successfully',
            payload: { user }
        });
    } catch (error) {
       
        next(error);
    }
    
 }
 const deleteUserById=async(req,res,next) => {
    try {
        const id= req.params.id;     
        const options= {password: 0};  
        const user = await findWithId(User, id, options);
      
        await User.findByIdAndDelete({_id:id, isAdmin: false});

        return successResponse(res, {
            statusCode:200,
            message: 'user was deleted successfully',
        });
    } catch (error) {
       
        next(error);
    }
    
 }

 const processRegister= async(req, res, next)=>{
    try {
        const {name, email, password, phone, address} = req.body;
        const image= req.file;
        if(!image){
         throw createError(400, 'Image file is required');
        }
        if(image.size > 2097152){
        throw createError(400, 'Image file size is too large. It must be less than 2 mb');
        }
        console.log('img pro: ', image);
        const imageBufferString=image.buffer.toString("base64");
        const newUser= {
            name,
            email,
            password,
            phone,
            address,
            image:imageBufferString
        }
        const userExists= await User.exists({email:email});
        if(userExists){
        throw createError(409,"User already existed. Please sign in");        }
       const token= createJSONWEBToken(newUser,jwtActivationKey,'10m');
       //prepare email
       const emailData={
        email,
        subject: 'Account Activation Email',
        html: `
          <h2>Hello ${name}</h2> 
          <p>Please click here to<a href="${clientURL}/api/users/activate/${token}" target="_blank"> activate your account</a></p>       
        `
       }
           try {
            
           await emailWithNodeMailer(emailData);

           } catch (Emailerror) {
            next(createError(5000, "Failed to send verification email"));
            return 
           }
            return successResponse(res, {
            statusCode:200,
            message: `Please go to your ${email}  and complete your registration process.`,
            payload: {
                token
            }
      });  
    } catch (error) {
        next(error);     
    }

 }

 const activateUserAccount= async(req, res, next)=>{
    try {
       
          const token= req.body.token;
          if(!token) throw createError(404,"Token not found!");
          try {
            const decoded=jwt.verify(token,jwtActivationKey);
        if(!decoded) throw createError(401,"Unable to verify user!");
        const userExists= await User.exists({email:decoded.email});
        if(userExists){
        throw createError(409,"User already existed. Please sign in");   
          } 
        await User.create(decoded);
       
            return successResponse(res, {
            statusCode:201,
            message: `User was registered successfully`,
          
      });  
          } catch (error) {
            if(error.name==='TokenExpiredError'){
                throw createError(401, 'Token has expired');            
            }else if(error.name==='JsonWebTokenError'){
                throw createError(401,'Invalid Token');
            }else{
                throw error;
            }  
          }
       
    } catch (error) {
        
        next(error);     
    }

 }
 const updateUserById=async(req,res,next) => {
    try {
        const userId= req.params.id;    
        const options= {password: 0};  
        await findWithId(User, userId, options); 
        const updateOptions= {new: true, runValidators: true, context: 'query'};  
        let updates={};
     
        for( let key in req.body){
            if(['name','password','phone','address'].includes(key)){
             updates[key]=req.body[key];
            }else if(['email'].includes(key)){
                throw createError(400, 'Email can not be updated');
            }
        }
        const image = req.file;
        if(image){
            if(image.size > 2097152){
                throw createError(400, 'Image file size is too large. It must be less than 2 mb');
             } 
             updates.image= image.buffer.toString('base64');
        }
        const updatedUser= await User.findByIdAndUpdate(userId,updates,updateOptions).select("-password");
        if(!updatedUser){
         throw createError(400, 'User with this id does not exist');
        }
        return successResponse(res, {
            statusCode:200,
            message: 'user was updated successfully',
            payload: {updatedUser},
        });
    } catch (error) {
       
        next(error);
    }
    
 }
 const handleBanUserById=async(req,res,next) => {
    try {
        const userId= req.params.id;    
       await findWithId(User, userId); 
       const updates= {isBanned: true};
        const updateOptions= {new: true, runValidators: true, context: 'query'}; 
        const updatedUser= await User.findByIdAndUpdate(userId,updates,updateOptions).select("-password");
        if(!updatedUser){
         throw createError(400, 'User was not banned');
        }
        return successResponse(res, {
            statusCode:200,
            message: 'user was successfully banned'         
        });
    } catch (error) {
       
        next(error);
    }
    
 }
 const handleUnbanUserById = async(req, res, next)=>{
    try {
        const userId= req.params.id;    
        await findWithId(User, userId); 
       const updates= {isBanned: false};
        const updateOptions= {new: true, runValidators: true, context: 'query'}; 
        const updatedUser= await User.findByIdAndUpdate(userId,updates,updateOptions).select("-password");
        if(!updatedUser){
         throw createError(400, 'User was not unbanned');
        }
        return successResponse(res, {
            statusCode:200,
            message: 'user was successfully unbanned'         
        });
    } catch (error) {
       
        next(error);
    }
 }
 const handleUpdatePassword = async(req, res, next) =>{
    try {
        const {oldPassword, newPassword} = req.body;
        console.log("old pass:",oldPassword);
        const userId= req.params.id;
        const user= await findWithId(User, userId); 
        const isPasswirdMatch= await bcrypt.compare(oldPassword, user.password);
        if(!isPasswirdMatch){       
           throw createError(401,"Old password is not correct..");
        }
       
        // const filter={userId};
        // const updates= {$set: {password: newPassword}};      
        // const updateOptions= {new: true, runValidators: true, context: 'query'}; 
        const updatedUser= await User.findByIdAndUpdate(
            userId,
           {password: newPassword},
            {new: true}
            ).select("-password");
        if(!updatedUser){
         throw createError(400, 'Password was not updated');
        }
        return successResponse(res, {
            statusCode:200,
            message: 'user password was successfully updated' ,
            payload: user        
        });
    } catch (error) {
       
        next(error);
    }
 }
 const handleForgetPassword = async(req, res, next) =>{
    try {
        const {email} = req.body;
        const userData= await User.findOne({email: email});
        if(!userData){
         throw createError(404,"Email is incorrect. You have not verified your email address. Please register.");
        }
     
        const token= createJSONWEBToken({email},jwtResetPasswordKey,'10m');
        //prepare email
        const emailData={
         email,
         subject: 'Reset Password of Email',
         html: `
           <h2>Hello ${userData.name}</h2> 
           <p>Please click here to<a href="${clientURL}/api/users/reset-password/${token}" target="_blank"> reset your password of email</a></p>       
         `
        }
            try {
             
            await emailWithNodeMailer(emailData);
 
            } catch (Emailerror) {
             next(createError(5000, "Failed to send verification email"));
             return 
            }
             return successResponse(res, {
             statusCode:200,
             message: `Please go to your ${email}  and complete your reset password process.`,
             payload: { token }
       });  
    } catch (error) {
       
        next(error);
    }
 }
 const handleResetPassword= async(req, res, next)=>{
    try {
        const {token, password}=req.body;
        const decoded= jwt.verify(token, jwtResetPasswordKey);
        if(!decoded){
         throw createError(400,"Invalid or expired token");
        }
        const filter={email: decoded.email};
        const update={password: password};
        const options= {new: true};
        const updateUser= await User.findOneAndUpdate(
            filter,
            update,
            options
        ).select('-password');
        if(!updateUser){
            throw createError(400,"Reset password was not successfully reset.");
        }
        return successResponse(res, {
            statusCode:200,
            message: 'password was successfully reset'    
        });
    } catch (error) {
       
        next(error);
    }
 }
 module.exports={getUsers,
     getUserById,
      deleteUserById,
      processRegister,
      activateUserAccount,
      updateUserById,
      handleBanUserById,
      handleUnbanUserById,
      handleUpdatePassword,
      handleForgetPassword,
      handleResetPassword
    }