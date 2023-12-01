const express= require('express');
const { getUsers, getUserById, deleteUserById, processRegister, activateUserAccount, updateUserById, handleBanUserById, handleUnbanUserById, handleUpdatePassword, handleForgetPassword, handleResetPassword} = require('../controllers/userController');
const upload = require('../middlewares/uploadFile');
const { validateUserRegistration, validateUserPasswordUpdate, validateUserForgetPassword, validateUserResetPassword } = require('../validators/auth');
const runValidation = require('../validators');
const { isLoggedIn, isLoggedOut } = require('../middlewares/auth');
const { isAdmin } = require('../controllers/authController');
const userRouter= express.Router();


userRouter.get("/", isLoggedIn, isAdmin, getUsers);
userRouter.post("/process-register",upload.single('image'),isLoggedOut,validateUserRegistration,runValidation,processRegister);
userRouter.post("/activate", isLoggedOut, activateUserAccount);
userRouter.get("/:id", isLoggedIn, getUserById);
userRouter.delete("/:id", isLoggedIn, deleteUserById);
userRouter.put("/reset-password",
 validateUserResetPassword,
 runValidation,
 handleResetPassword);
userRouter.put("/:id",upload.single('image'), isLoggedIn, updateUserById);
userRouter.put("/ban-user/:id", isLoggedIn, isAdmin, handleBanUserById);
userRouter.put("/unban-user/:id", isLoggedIn, isAdmin, handleUnbanUserById);
userRouter.put("/update-password/:id", isLoggedIn, validateUserPasswordUpdate, runValidation, handleUpdatePassword);
userRouter.post("/forget-password", validateUserForgetPassword, runValidation, handleForgetPassword);


module.exports=userRouter;