import mongoose , { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"

const userSchema = new Schema({
    username:{
        type:String,
        required: true,
        lowercase : true,
        index: true,
        trim: true,
        unique:true
    },
    email:{
        type:String,
        required:true,
        lowercase:true
    },
    avatar:{
        type:String,
        required:true
    },
    coverImage:{
        type:String
    },
    watchHistory:[
        {
            type:Schema.Types.ObjectId,
            ref: "Video"
        }
    ],
    password:{
        type:String,
        required:[true,"Error occured in the password"]
    },
    refreshToken:{
        type:String
    }
},{timestamps : true})

userSchema.pre("save",async function (next) {
    
    //is paswword is not bring modified then doont run the remaiing funtion and give the control to the next middle ware
    //await beacuse its compute heavy task
    if(!this.modified("password")) return next();

    this.password = await bcrypt.hash(this.password,10);

    next()
})

//here we are adding a function along with the userModel in this for executing it we need password
//it will return true or false
userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password,this.password)
}

userSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            _id:this._id,
            email:this.email,
        }
        ,process.env.ACCESS_TOKEN_SECRET
        ,{
            expiresIn:process.env.ACCESS_TOKEN_EXPIRY
        })
}
userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id:this._id,
            email:this.email,
        }
        ,process.env.REFRESH_TOKEN_SECRET
        ,{
            expiresIn:process.env.REFRESH_TOKEN_EXPIRY
        })
}

export const User = mongoose.model("User",userSchema)