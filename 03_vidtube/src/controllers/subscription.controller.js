import mongoose, {isValidObjectId} from "mongoose"
import { Subscription } from "../models/subscription.models.js"
import {ApiError} from "../utils/apiError.js"
import {ApiResponse} from "../utils/apiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
const {channelId} = req.params
const userId = req?.user?._id
// TODO: toggle subscription

if(!channelId || !userId){
    throw new ApiError(400,"ChannelId or userid missing")
}

const isSubscribed = await Subscription.findOne({
    subscriber:userId,
    channel:channelId,
})

if(isSubscribed){
    await Subscription.findOneAndDelete({
        subscriber:userId,
            channel:channelId,
    })

    return res
            .status(200)
            .json(new ApiResponse(200,{},"Subscription removed"))
        }
else{
    const sub = await Subscription.create({
        subscriber:userId,
        channel:channelId,
    })
    return res
            .status(200)
            .json(new ApiResponse(200,sub,"Subscribed successfully"))
}
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params

    if(!channelId){
        throw new ApiError(400,"Channel id is required")
    }
    

    const subscribers= await Subscription.aggregate([
            {
                $match:{
                    "channel":new mongoose.Types.ObjectId(channelId)
                }
            },
            {
                $lookup:{
                    from:"users",
                    localField:"subscriber",
                    foreignField:"_id",
                    as:"subscribers"
                }
            },
            {
                $addFields:{
                    "subscribers":{
                        $first:"$subscribers"
                    }
                }
            }
        ])
    
        const count = await Subscription.countDocuments({
            "channel":channelId
        })

        return res
                .status(200)
                .json(new ApiResponse(200,{subscribers,count},"Subscribers fetched successfully"))
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
    
    const channels = await Subscription.find({
        "subscriber":subscriberId
    }).populate("channel")
    

    const responseObject = {
        //we are giving only the channel details now no id subscription etc
        "channels":channels.map(eachChannelDetails=>eachChannelDetails.channel),
        "count":channels.length
    }

    return res
            .status(200)
            .json(new ApiResponse(200,responseObject,"Successfully fetched all the channels"))
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}