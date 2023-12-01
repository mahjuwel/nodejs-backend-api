const {body} = require('express-validator');

const validateUserRegistration=[
    body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({min: 3, max: 31})
    .withMessage("Name should be al least 3-31 characters long"),
    body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid Email Address"),
    body("password")
    .trim()
    .notEmpty()
    .withMessage("Password is required")
    .isLength({min: 6})
    .withMessage("Password should be al least 6 characters long")
    .matches(/^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{6,}$/)
    .withMessage("min 6 letter password, with at least a symbol, upper and lower case letters and a number"),
    body("address")
    .trim()
    .notEmpty()
    .withMessage("Address is required")
    .isLength({min: 3})
    .withMessage("Password should be al least 3 characters long"),
    body("phone")
    .trim()
    .notEmpty()
    .withMessage("Phone is required")
    .isLength({min: 11})
    .withMessage("Password should be al least 11 characters long"),
    body("image")
    .custom((value, { req }) =>{
    if(!req.file || !req.file.buffer){
     throw new Error("User image is required");
    }
    return true;
    })
    .withMessage("Image is required"),
    
]
const validateUserLogin=[
   
    body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid Email Address"),
    body("password")
    .trim()
    .notEmpty()
    .withMessage("Password is required")
    .isLength({min: 6})
    .withMessage("Password should be al least 6 characters long")
    .matches(/^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{6,}$/)
    .withMessage("min 6 letter password, with at least a symbol, upper and lower case letters and a number"),
   
    
]
const validateUserPasswordUpdate=[
    body("oldPassword")
    .trim()
    .notEmpty()
    .withMessage("Old Password is required")
    .isLength({min: 6})
    .withMessage("Old Password should be al least 6 characters long")
    .matches(/^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{6,}$/)
    .withMessage("min 6 letter old password, with at least a symbol, upper and lower case letters and a number"),
   
    body("newPassword")
    .trim()
    .notEmpty()
    .withMessage("New Password is required")
    .isLength({min: 6})
    .withMessage("New Password should be al least 6 characters long")
    .matches(/^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{6,}$/)
    .withMessage("min 6 letter new password, with at least a symbol, upper and lower case letters and a number"),
    body('confirmedPassword').custom((value, {req}) =>{
     if(value!=req.body.newPassword){
            throw new Error("Password did not match")
      }
      return true;

    })
]
const validateUserForgetPassword=[
   
    body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid Email Address"),
   
    
]
const validateUserResetPassword=[
   
    body("token")
    .trim()
    .notEmpty()
    .withMessage("Token is missing"),    
    body("password")
    .trim()
    .notEmpty()
    .withMessage("Password is required")
    .isLength({min: 6})
    .withMessage("Password should be al least 6 characters long")
    .matches(/^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{6,}$/)
    .withMessage("min 6 letter password, with at least a symbol, upper and lower case letters and a number"),
   
    
]

module.exports={validateUserRegistration,validateUserLogin,validateUserPasswordUpdate,validateUserForgetPassword,validateUserResetPassword}