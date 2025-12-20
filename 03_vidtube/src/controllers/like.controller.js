import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.models.js"
import {ApiError} from "../utils/apiError.js"
import {ApiResponse} from "../utils/apiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    const {userId} = req?.user?._id
    //TODO: toggle like on video

    if(!videoId || userId){
        throw new ApiError(400,"video or userId not found not found")
    }

    
     const existingLike = await Like.findOne({
        video: videoId,
        likedBy: userId
    })
    
    if(existingLike){
        await Like.findByIdAndDelete({
           video: videoId,
           likedBy: userId
       })

       return res
            .status(200)
            .json(new ApiResponse(200, "Like removed"))
    }
    else{
         await Like.create({
        video: videoId,
        likedBy: userId
        })
        
            return res
                    .status(200)
                    .json(new ApiResponse(200,"like created sucessfully"))
    }

})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment

    const {userId} = req?.user?._id

    if(!commentId || userId){
        throw new ApiError(400,"comment or userId not found not found")
    }

     const existingLike = await Like.findOne({
        comment:commentId,
        likedBy:userId
    })
    
    if(existingLike){
        await Like.findByIdAndDelete({
            comment:commentId
            
        })
        
        return res
        .status(200)
        .json(new ApiResponse(200, "Like removed"))
    }
    else{
        await Like.create({
             comment:commentId
       
        })
        
            return res
                    .status(200)
                    .json(new ApiResponse(200,"like created sucessfully"))
    }

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet

    const {userId} = req?.user?._id
    //TODO: toggle like on video

    if(!tweetId || userId){
        throw new ApiError(400,"tweet or userId not found not found")
    }

      const existingLike = await Like.findOne({
        tweet:tweetId,
        owner:_id
    })
    
    if(existingLike){
        await Like.findByIdAndDelete({
             tweet:tweetId
            
        })
        
        return res
        .status(200)
        .json(new ApiResponse(200, "Like removed"))
    }
    else{
        await Like.create({
       tweet:tweetId
       
        })
        
            return res
                    .status(200)
                    .json(new ApiResponse(200,"like created sucessfully"))
    }
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
    //we are getting all the videos liked by the user

   try {
     const likedVideo = await Like.find({
         likedBy:req?.user?._id,
         video:{
             $ne:null
             // here ne means not equal
         }
     }).populate("video")
   } catch (error) {
     throw new ApiError(400,"Error while getting videos")
   }

    //.populate takes the video document and place it in the object id place

    return res
            .status(200)
            .json(new ApiResponse(200,likedVideo,"operation performed succesfully"))
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}