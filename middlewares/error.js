const ErrorHandler=require('../utils/errorHandler');
module.exports = (err,req,res,next)=>{
    
    err.statusCode=err.statusCode || 500;
    
    if(process.env.NODE_ENV==="development"){
        res.status(err.statusCode).json({
            success:false,
            error:err,
            message:err.message,
            stack:err.stack
        });
    }
  

};