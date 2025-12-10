import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { User } from "../models/user.models.js";
import { uploadOnClaudinary , deleteFromCloudinary } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken"

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

export { userRegister ,
     generateAccessTokenAndRefreshToken,
     loginUser,
     refreshAccessToken,
    logoutUser }