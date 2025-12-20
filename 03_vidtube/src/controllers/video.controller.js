import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.models.js"
import {ApiError} from "../utils/apiError.js"
import {ApiResponse} from "../utils/apiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnClaudinary} from "../utils/cloudinary.js"



const getAllVideos = asyncHandler(async (req, res) => {
    // const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    // //TODO: get all videos based on query, sort, pagination

    let { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    
    page = parseInt(page)
    limit = parseInt(limit)
    

    const pipeline = []
    //there is a exist this order in mongodb first search then match then other operation
    if(query){
        pipeline.push(
            {
                $search:{
                    index:'default',
                    text:{
                        query:query,
                        path:'description'
                    }
                }
            }
        )
    }

    if(userId){
        pipeline.push({
            $match:{
                "owner":new mongoose.Types.ObjectId(userId)
            }
        })
    }

    if(sortBy){
        pipeline.push({
            $sort:{
                [sortBy]: sortType === "asc" ? 1 : -1
            }
        })
    }

    pipeline.push(
        {
            $skip:(page-1)*limit
        },
        {
            $limit : limit
        }
    )


    const videos = await Video.aggregate(pipeline)

    if(!videos){
        throw new ApiError(400,"fail to get videos")
    }

    return res
            .status(200)
            .json(new ApiResponse(200,videos,"fetched videos successfuly"))
    
    
})

const publishAVideo = asyncHandler(async (req, res) => {
    // TODO: get video, upload to cloudinary, create video
    const {  description} = req.body
    const videoLocalPath = req.files?.path
    const user = req?.user?._id

    if(!user){
        throw new ApiError(400,"fail to get user details")
    }

    
    const videoLink = await uploadOnClaudinary(videoLocalPath)
    if(!videoLink?.url){
        throw new ApiError(400,"fail to get video link")
    }

    const video = await Video.create({
        videoFile:videoLink.url,
        description:description,
        owner:user,
        thumbnail:videoLink.thumbnail || " ",
        duration:videoLink.duration || 0
    })

    if(!video){
        throw new ApiError(400,"Faile to upload on cloudinary")
    }

    return res
            .status(200)
            .json(new ApiResponse(200,video,"video uploaded successfully"))
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