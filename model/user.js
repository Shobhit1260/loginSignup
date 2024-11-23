const mongoose = require('mongoose');
const { default: validator } = require('validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({

    email : {
        type : String,
        required : [true, 'please enter your email'],
        unique : true,
        validate :[validator.isEmail,'please enter valid email address']
    },
    password :{
       type: String,
       required :[true,'please enter your password'],
       minlength : [8,'password should be minimum 8 characters'],
       select : false
    },
    createdAt : {
        type : Date,
        default : Date.now
    },

    resetPasswordToken: String,
    resetPasswordExpire: Date,  

});
// Encrypting passwords before saving using bcrypt
userSchema.pre('save',async function(next){
    // console.log("this is printing inside hasing",this);
    if(!this.isModified('password')){
        next();
    }
    this.password = await bcrypt.hash(this.password,10);
});

// Return Json Web Token
userSchema.methods.getJwtToken = function (){  
    return jwt.sign(
        {id :this._id.toString()},
        // @ts-ignore
        process.env.JWT_SECRET,
        {expiresIn : process.env.JWT_EXPIRES_TIME
    });
};

// Compare user password in database password 
userSchema.methods.comparePassword = async function(enterPassword){
    return await bcrypt.compare(enterPassword,this.password);
}

//  Generate Password Reset Token
userSchema.methods.getResetPasswordToken = function(){
    // Generate token
const resetToken = crypto.randomBytes(20).toString('hex');
//   Hash and set to resetPasswordToken
  this.resetPasswordToken = crypto
             .createHash('sha256')
             .update(resetToken)
             .digest('hex');        
  // Set token expire time
  this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
  return resetToken;
                  
}
module.exports = mongoose.model('User',userSchema)