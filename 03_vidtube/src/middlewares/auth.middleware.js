import jwt from "jsonwebtoken"
import { ApiError } from "../utils/apiError.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { User } from "../models/user.models.js"

const verifyJWT = asyncHandler(async(req,res,next)=>{
    const token = req.cookies.accessToken || req.header("Authorization")?.replace("Bearer ","")

    if(!token){
        throw new ApiError(401,"No token unauthorized user");
    }

    //THE TOKEN WE HAVE CONTAINS USER IN ENCRYPTED FORM
        const decodedToken = await jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
        if(!decodedToken){
            throw new ApiError(400,"improper access token")
        }
    
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken");
    
        if(!user){
            throw new ApiError(401,"User not found")
        }
    
        req.user = user;
        next()

    
})

export {verifyJWT}