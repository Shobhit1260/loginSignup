const User = require('../model/user');
const ErrorHandler = require('../utils/errorHandler');
const sendToken = require ('../utils/jwtToken');
const sendEmail = require('../utils/sendmailer');
const crypto = require('crypto');

// Register a new user => api/v1/register

exports.registerUser = async(req,res,next)=>
{   
    try {
    const {email,password} = req.body;
    const user = await User.create({
         email,
         password,
    });
    console.log("user",user);
    sendToken(user,200,res);
} catch (error) {
    next(error);
}
    
};
// Login user => /api/v1/login
exports.loginUser = async(req,res,next)=>{
    // console.log("API hit");
    try{
    const {email,password} = req.body;

    // Checks if email or password is entered by user
    if(!email || !password){
        return next(new ErrorHandler('please enter email or password',400));
    }

    // Finding user in database 
     const user = await User.findOne({email}).select('+password');

     if(!user){
        return next(new ErrorHandler('Invalid Email or Password.',401))
     }

    //  Check if password is correct
    const isPasswordMatched = await user.comparePassword(password);
    if(!isPasswordMatched){
        return next(new ErrorHandler('Invalid Email or Password.',401))
    }
     sendToken(user,200,res);
   
}
catch(error){
    next(error);
}
};

// Forget password =>/api/v1/password/forget
exports.forgotPassword = async (req,res,next)=>{
    try{
    const user = await User.findOne({email: req.body.email});
    //  check user email is database 
    if(!user){
        return next(new ErrorHandler('No user found with this email.',404));
    }
    // Get reset token
    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });
    
   

    //  Create reset password url
    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/password/reset/${resetToken}`;
    const message = `Your password reset link is as follow:\n\n${resetUrl}\n\n If you have not request this please ignore that.`

    try{
        await sendEmail({
            email:user.email,
            subject : 'login Api Password Recovery',
            message
        });
        res.status(200).json({
            success:true,
            message :`Email sent successfully to : ${user.email}`
        });
    }
    catch(error){
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save({validateBeforeSave : false});
        return next(new ErrorHandler('Email is not sent.',500));
    }
} catch(error){
    next(error);
}

};

// create resetPassword

exports.resetPassword = async(req,res,next)=>{
    try{
    const resetPasswordToken = crypto
          .createHash('sha256')
          .update(req.params.token)
          .digest('hex');

    const user =  await User.findOne({
        resetPasswordToken,
        resetPasswordExpire:{ $gt: Date.now()}

});  

 console.log("user --", user);   
   if(!user){
     return next(new ErrorHandler('Password Reset token is invalid or has been expired',400));
   }

//    Setup new password
   user.password = req.body.password;
   user.resetPasswordToken = undefined;
   user.resetPasswordExpire = undefined;
   await user.save();
   sendToken(user,200,res);
}
catch(error){
    next(error);
}
};

// Logout user => /api/v1/logout
exports.logout = async(req,res,next)=>{
    try{
    res.cookie('token','none',{
        expires : new Date(Date.now()),
        httpOnly : true
    });

    res.status(200).json({
        success:true,
        message:'Logout successfully'
    });
}
catch(error){
    next(error);
}}
