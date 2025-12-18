import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { use } from "react"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    // TODO: get video, upload to cloudinary, create video
})

const getVideoById = asyncHandler(async (req, res) => {
    //TODO: get video by id
    const { videoId } = req.params

    if(!videoId){
        throw new ApiError(400,"VideoId was missing")
    }

    const video = await Video.findById(videoId);

    if(!video){
        throw new ApiError(400,"Video not found")
    }

    return res
            .status(200)
            .json(new ApiResponse(200,video,"Video fetched successfully"))
})

const updateVideo = asyncHandler(async (req, res) => {
    //TODO: update video details like title, description, thumbnail
    const { videoId } = req.params
    const user = req?.user?._id
    const {description,thumbnail} = req.body

    if(!videoId || !user){
        throw new ApiError(400,"videoId or user is missing")
    }
    

})

const deleteVideo = asyncHandler(async (req, res) => {
    //TODO: delete video
    const { videoId } = req.params
    const user = req?.user?._id

    if(!videoId || !user){
        throw new ApiError(400,"videoId or user is missing")
    }

    const video = await Video.findOneAndDelete({
        owner:user,
        _id:videoId
    })

    if(!video){
        throw new ApiError(400,"Video not found or unauthorized")
    }

    return res
            .status(200)
            .json(new ApiResponse(200,"video was deleted successfully"))
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const user = req?.user?._id

    if(!user || !videoId){
        throw new ApiError(400,"userId or videoId is missing")
    }

    const video = await Video.findOne({
        _id:videoId,
        owner:user
    })

    if(!video){
        throw new ApiError(400,"failed to get video or unauthorized")
    }

    video.isPublished = !video.isPublished
    await video.save({validateBeforeSave:false})

    return res
            .status(200)
            .json(new ApiResponse(200,"publish status got toggled"))
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}