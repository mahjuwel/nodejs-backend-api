const {Schema, model} = require("mongoose");
const bcrypt = require('bcryptjs');
const userSchema= new Schema({
    name: {
        type: String,
        required: [true, "User name is required"],
        trim: true,
        minlength: [3, 'User name length can be minimum 3 characters'],
        maxlength: [31, 'User name length can be maximum 31 characters']
    },
    email: {
        type: String,
        required: [true, "User email is required"],
        trim: true,
        unique: true,
        lowercase: true,
        validate: {
            validator: function(v) {          
            return /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(v);
            },
            message: "Please enter a valid email"
        }
    },
    password: {
        type: String,
        required: [true, "User password is required"],
        minlength: [6, 'User password length can be minimum 6 characters'],
        set: (v) => bcrypt.hashSync(v, bcrypt.genSaltSync(10))
    },
    image: {
        type: Buffer,
        contentType: String,
         required: [true, "Image is required"], 
    },
    address: {   
            type: String,
            required: [true, "User address is required"],            
    },
    phone: {   
        type: String,
        required: [true, "User phone is required"],            
     },
     isAdmin: {   
        type: Boolean,
        default: false          
     },
     isBanned: {   
        type: Boolean,
        default: false},
    },{timestamps: true});
    const User= model('User',userSchema);
    module.exports=User;