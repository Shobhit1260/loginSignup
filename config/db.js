const mongoose = require('mongoose');
// @ts-ignore
const database_connect=()=>{mongoose.connect(process.env.MONGODB_URI)
.then(()=>console.log("database is connected"))
.catch((err) => {
    console.log("Database connection error: ", err);
});
}

module.exports= database_connect;