import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.models.js";
import { uploadOnClaudinary , deleteFromCloudinary } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken"
import mongoose from "mongoose";

const generateAccessTokenAndRefreshToken = async(userId)=>{
    try {
        const user = await User.findById(userId);
    
        if(!user){
            throw new ApiError(500,"User was not found");
            return null
        }
    
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
    
        user.refreshToken = refreshToken;
    
        //its just we are telling monogodb to dont validate before saving
        await user.save({validateBeforeSave:false})
    
        return { accessToken , refreshToken }
    } catch (error) {
        console.log("Failed to generate access and refresh token");
        throw new ApiError(500,"something went wrong while generating access and reresh token")
    }
}

const userRegister = asyncHandler( async (req, res) => {
    // get user details from frontend
    // validation - not empty
    // check if user already exists: username, email
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res

    //lets extract the details from req
    const {fullName, email, username, password } = req.body
    //console.log("email: ", email);
    //lets verify whether we have got these details or not
    if (
        [fullName, email, username, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }

      //now lets check do we have an existing user
    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    //if existing user is present then error
    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists")
    }
    //console.log(req.files);

        //this is to check multer working properly or not
    //now they user does not exists let get the coverImage and Avatar
    const avatarLocalPath = req.files?.avatar[0]?.path;
    //const coverImageLocalPath = req.files?.coverImage[0]?.path;

    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }
    

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required")
    }

    const avatar = await uploadOnClaudinary(avatarLocalPath)
    const coverImage = await uploadOnClaudinary(coverImageLocalPath)

try {
        if (!avatar) {
            throw new ApiError(400, "Avatar file is required")
        }
       
    
        const user = await User.create({
            fullName,
            avatar: avatar.url,
            coverImage: coverImage?.url || "",
            email, 
            password,
            username: username.toLowerCase()
        })
    
        const createdUser = await User.findById(user._id).select(
            "-password -refreshToken"
        )
    
        if (!createdUser) {
            throw new ApiError(500, "Something went wrong while registering the user")
        }
    
        return res.status(201).json(
            new ApiResponse(200, createdUser, "User registered Successfully")
        )
} catch (error) {

        console.log("user creation failed")
        if(avatar){
            await deleteFromCloudinary(avatar.public_id);
        }
        if(coverImage){
            await deleteFromCloudinary(coverImage.public_id);
        }
        throw new ApiError(500,"smth went wrong and images were deleted")
    }


} )

const loginUser = asyncHandler(async (req,res)=>{
    const {email,password,username}=req.body

    if(!email){
        throw new ApiError(400,"Email is required");
    }

    const user = await User.findOne({
        $or : [{email},{username}]
    })

    if(!user){
        throw new ApiError(404,"user was not found")
    }

    //lets check password
    const isPasswordValid = user.isPasswordCorrect(password)
    if(!isPasswordValid){
        throw new ApiError(401,"Invalid password")
    }

    const {accessToken,refreshToken}= await generateAccessTokenAndRefreshToken(user._id);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");


    //here what it means is only serevr can modify the cookie not browser of js
    //and the other thing is to just check the page is in development or not
    const options={
        httpOnly:true,
        secure:process.env.NODE_ENV=="developement"
    }

    res
        .status(200)
        .cookie("accessToken",accessToken,options)
        .cookie("refreshToken",refrshToken,options)
        .json(new ApiResponse(
            200,
            {user:loggedInUser,
                refreshToken,
                accessToken
            }
            ,"User logged in successfully"
        ))
})

const refreshAccessToken=asyncHandler(async(req,res)=>{
    //get the refresh token from the user to generate access token

    const currentRefreshToken = req.cookies.refreshToken || req.body.refreshToken
    if(!currentRefreshToken){
        throw new ApiError(401,"No refresh token provided")
    }
    try {
            //lets verify the token
            const decodedToken = await jwt.verify(currentRefreshToken,process.env.REFRESH_TOKEN_SECRET)
            
            //decoded token has userID
            const user = User.findById(decodedToken?._id)
            if(!user){
                throw new ApiError(401,"Invalid refresh token")
            }
            
            if(currentRefreshToken!==user.refreshToken){
                throw new ApiError(401,"Invalid refresh token or wrong token")
            }

            const {accessToken,refreshToken}=await generateAccessTokenAndRefreshToken(user._id);
            const options={
                httpOnly:true,
                secure:process.env.NODE_ENV=="developement"
            }

            res
                .status(200)
                .cookie("accessToken",accessToken,options)
                .cookie("refreshToken",refreshToken,options)
                .json(
                    200,
                    {
                        accessToken,
                        refreshToken
                    },
                    "Access token got updated"
                )
    } catch (error) {
            throw new ApiError(500,"Error is refreshing access token")
    }
})

const logoutUser=asyncHandler(async(req,res)=>{
    //the flow here is we are going to make a middle ware which is going to check whether the user is valid and have valid access token or not 
    // when the req comes here we will extract the id and then logout the user

    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                refreshToken:undefined
            }
        },
        {
            // it will return the new user
            new:true
        }
    )

    const options={
        httpOnly:true,
        secure:process.env.NODE_ENV=="developement"
    }
    
    return res
            .status(200)
            .clearCookie("accessToken",options)
            .clearCookie("refreshToken",options)
            .json(
                new ApiResponse(200,{},"User logged out successfully")
            )

})

const updatePassword=asyncHandler(async(req,res)=>{

    const {oldPassword,newPassowrd}=req.body;

    if(!oldPassword || !newPassowrd){
        throw new ApiError(400,"both old and new password required")
    }
    
    const user = await User.findById(req.user?._id)

    if(!user){
        throw new ApiError(400,"user was not found")
    }

    const validPassword =await user.isPasswordCorrect(oldPassword)
    if(!validPassword){
        throw new ApiError(400,"old password was wrong")
    }

    user.password=newPassowrd;
    await user.save({validateBeforeSave:false})

    return res
        .status(200)
        .json(new ApiResponse(200,{},"User password was changed very succesfully"))
})
const getCurrentUser = asyncHandler(async(req,res)=>{
    return res
        .status(400)
        .json(new ApiResponse(400,req.user,"Current user details"))
})

const updateAccountDetails=asyncHandler(async(req,res)=>{
    const {email,username}=req.body

    if(!email || !username){
        throw new ApiError(400,"Email and username both are required")
    }

    const user =await User.findByIdAndUpdate(
        req.user?._id,
        {
        $set:{
            username,
            email:email
        }
        },
        {
            new:true
        }
    ).select("-password -refreshToken")

    return res
        .status(200)
        .json(new ApiResponse(200,"Fields got updated"))
})
const updateAvatar=asyncHandler(async(req,res)=>{
    const avatarLocalPath = req.files?.path
    if(!avatarLocalPath){
        throw new ApiError(400,"avatar image is required")
    }

    const avatar = await uploadOnClaudinary(avatarLocalPath);
    if(!avatar?.url){
        throw new ApiError(400,"Failed to get url from the cloudinary")
    }

    const user = User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                avatar:avatar.url
            }
        },
        {
            new:true
        }
    ).select("-password -refreshToken")

    return res
            .status(200)
            .json(new ApiResponse(200,user,"avatar image got updated"))
})
const updateCoverImage=asyncHandler(async(req,res)=>{
    const coverImageLocalPath = req.files?.path
    if(!coverImageLocalPath){
        throw new ApiError(400,"cover image is required")
    }

    const coverImage = await uploadOnClaudinary(avatarLocalPath);
    if(!coverImage?.url){
        throw new ApiError(400,"Failed to get url from the cloudinary")
    }

    const user = User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                coverImage:coverImage.url
            }
        },
        {
            new:true
        }
    ).select("-password -refreshToken")

    return res
            .status(200)
            .json(new ApiResponse(200,user,"Cover image got updated"))
})

const getUserDetails=asyncHandler(async(req,res)=>{
    const {username} = req.params

    

    if(!username){
        throw new ApiError(400,"Username not available")
    }

    // look how aggregate function works is the output of one stage is input to next stage
    //but some $functions can increase the size of the document like $lookup and $unwind

    //all the aggregation pipeline code goes directly no mongoose there 
    const channel = await User.aggregate([
        {
            $match:{
                username:username
            }
        },
        {
            $lookup:{
                from:"$subscriptions",
                localField:"_id",
                foreignField:"channel",
                as:"subscribers"
            }
        },
        {
            $lookup:{
                from:"$subscriptions",
                localField:"_id",
                foreignField:"subscriber",
                as:"subscriberedTo"
            }
        },
        {
            $addFields:{
                subscriberCount:{
                    $size:"subscribers"
                },
                channelCount:{
                    $size:"subscribedTo"
                },
                //we are at particulart channel page now
                subscriberOfThisChannelOrNot:{
                    $cond:{
                        //req.user?._id this will give you a string but mongoose will convert it into a mongodb object
                        if: $in[req.user?._id,"$subscribers.subscriber"],
                        then:true,
                        else:false
                    }
                }
            }
        },
        {   
            // here i means send the data 0 means dont send
            $project:{
                fullName:1,
                username:1,
                subscriberCount:1,
                channelCount:1,
                subscriberOfThisChannelOrNot:1,
                avatar:1,
                coverImage:1
            }
        }
    ])
    if(!channel || channel.length===0){
        throw new ApiError(404,"Channel was not found");
    }

    console.log(channel[0])
    return res
        .status(202)
        .json(new ApiResponse(202,channel[0],"Channel details fetched successfully"))
})

const getWatchHistory=asyncHandler(async(req,res)=>{
    const user = await User.aggregate([
        {
            $match:{
                // req.user?._id this wont work here
                _id:new mongoose.Types.ObjectId(req.user?._id)
            }
        },
        {   //the goal here is from user to videos abd get the creater name and we are limiting the creator details using project

            $lookup:{
                //here we are linking the user and the videos
                // here from is the forign db
                from:"videos",
                localField:"watchHistory",
                foreignField:"_id",
                as:"watchHistory", //now we are goind inside the videos to find video owner details
                pipeline:[
                    {
                        $lookup:{
                            from:"users",
                            localField:"owner", //here localfiels in the field in video document
                            foreignField:"_id",
                            as:"owner",
                            pipeline:[
                                {
                                    $project:{
                                            fullName:1,
                                            avatar:1,
                                            username:1
                                        }
                                }
                            ]
                        }
                    },
                    { //what we are doing here is we are overwriting the owner field and giving the value direct to frontend rather than array
                        $addFields:{
                            owner:{
                                $first:"$owner"
                            }
                        }
                    }
                ]
            }
        }
    ])

    if(!user){
        throw new ApiError(200,"failed to get users")
    }
    
    return res
            .status(200)
            .json(new ApiResponse(200,user[0]?.watchHistory,"watch history fetch successfully"))
})


export { userRegister ,
            generateAccessTokenAndRefreshToken,
            loginUser,
            refreshAccessToken,
            logoutUser,
            updatePassword, 
            getCurrentUser,
            updateAccountDetails,
            updateAvatar,
            updateCoverImage,
            getUserDetails,
            getWatchHistory
         }