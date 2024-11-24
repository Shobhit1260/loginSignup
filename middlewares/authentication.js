// @ts-nocheck
const User = require('../model/user'); 
const jwt = require('jsonwebtoken');
const ErrorHandler = require('../utils/errorHandler');

exports.isAuthenticatedUser = async(req,res,next)=>{
    try{
    let token;
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        token = req.headers.authorization.split(' ')[1];
    }
    if(!token){
        return next(new ErrorHandler('Login first to access this resource'),401);
    }
    const decoded = jwt.verify(token,process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);
    if (!req.user) {
        return next(new ErrorHandler('User does not exist', 404));
    }
    next();
}
catch(error){
    console.log("error--",error);
    
    next(error);
}

};