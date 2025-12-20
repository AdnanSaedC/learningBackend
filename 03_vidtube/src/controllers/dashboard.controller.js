import mongoose from "mongoose"
import {Video} from "../models/video.models.js"
import {Subscription} from "../models/subscription.models.js"
import {Like} from "../models/like.models.js"
import {ApiError} from "../utils/apiError.js"
import {ApiResponse} from "../utils/apiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { User } from "../models/user.models.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.

    const { channelId } = req.params

    const channelObjectId = new mongoose.Types.ObjectId(channelId)

    //totalviews
    const totalViews = await Video.aggregate([
        {
            $match:{
                owner:channelObjectId
            }
        },
        {
            $group: {
                _id: null,
                totalViews: { $sum: "$views" },
                totalVideos: { $sum: 1 }
            }
        }
    ])

    const totalSubscribers = await Subscription.aggregate([
        {
            $match:{
                channel:channelObjectId
            }
        },
        {
            $group: {
                _id: null,
                totalSubscribers: { $sum: 1 }
            }
        }
    ])

     const likeStats = await Like.aggregate([
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "videoData",
                pipeline:[{
                    $project:{
                        owner:1
                    }
                }]
            }
            //here videodata is an array and has 
        },
        {
            $match:{
                "videoData.owner": new mongoose.Types.ObjectId(channelId)
            }
        },
          {
    $group: {
      _id: null,
      totalLikes: { $sum: 1 }
    }
  }
    ])

     const responseObject = {
        totalViews: totalViews[0]?.totalViews || 0,
        totalVideos: totalSubscribers[0]?.totalVideos || 0,
        totalLikes: likeStats[0]?.totalLikes || 0,
        totalSubscribers: subscriberStats[0]?.totalSubscribers || 0
    }

    return res
            .status(200)
            .json(new ApiResponse(200,responseObject,"stat send successfully"))

})

const getChannelVideos = asyncHandler(async (req, res) => {
    const { channelId } = req.params

    if (!channelId) {
        throw new ApiError(400, "channelId is required")
    }

    const videos = await Video.find({
        owner: channelId
    })

    return res
        .status(200)
        .json(new ApiResponse(200, videos, "videos of this channel"))
})


export {
    getChannelStats, 
    getChannelVideos
    }