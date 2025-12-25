import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.models.js"
import {ApiError} from "../utils/apiError.js"
import {ApiResponse} from "../utils/apiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const {content} = req.body
    const owner = req?.user?._id

    if(!(content?.trim()) || !owner ){
        throw new ApiError(400,"content or owner is missing");
    }

    const newTweet = await Tweet.create({
        content,
        owner
    })
    
    if(!newTweet){
        throw new ApiError(500,"Failed to create tweet")
    }

    return res
            .status(201)
            .json(new ApiResponse(201,newTweet,"Tweet created successfully"))
})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const owner = req?.user?._id

    const tweets = await Tweet.aggregate([
        {
            $match:{
                "owner":new mongoose.Types.ObjectId(owner)
            }
        },
    ])

    return res
            .status(200)
            .json(new ApiResponse(200,tweets,"Tweets fetched successfully"))
    
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const owner = req?.user?._id
    const {content,_id} = req.body

    if(!owner || !(content?.trim()) || !_id){
        throw new ApiError(400,"owner or content or id is missing")
    }

   const tweet = await Tweet.findOneAndUpdate(
        { 
            _id, owner //things used to find one
        },
        { 
            content //thing i want to update
        },
        { 
            new: true //whether i need a copy or not
        }
    )


    if(!tweet){
        throw new ApiError(400,"Tweet was not found or unauthorized")
    }

    return res
            .status(200)
            .json(new ApiResponse(200,"tweet got updated successfully"))
    
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const user = req?.user?._id
    const {_id} = req.body

    if(!user || !_id){
        throw new ApiError(400,"user details or _id is missing")
    }

    const tweet = await Tweet.findOneAndDelete({
        _id:_id,
        owner:user
    })

    if(!tweet){
        throw new ApiError(400,"failed to delete the tweet or unauthorized")
    }

    return res
            .status(200)
            .json(new ApiResponse(200,"Tweet deleted successfully"))
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}