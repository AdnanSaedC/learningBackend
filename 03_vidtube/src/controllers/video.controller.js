import mongoose, {isValidObjectId, mongo} from "mongoose"
import {Video} from "../models/video.models.js"
import {ApiError} from "../utils/apiError.js"
import {ApiResponse} from "../utils/apiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {deleteFromCloudinary, uploadOnClaudinary} from "../utils/cloudinary.js"



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
                    index:"yt",
                    text:{
                        query:query,
                        path:"description"
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
    const videoLocalPath = req.files?.videoFile[0].path
    const thumbnailLocalPath = req.files?.thumbnailFile[0].path
    const user = req?.user?._id

    if(!user){
        throw new ApiError(400,"fail to get user details")
    }

    
    const videoLink = await uploadOnClaudinary(videoLocalPath)
    const thumbnailLink = await uploadOnClaudinary(thumbnailLocalPath)
    if(!videoLink?.url && thumbnailLink?.url){
        throw new ApiError(400,"fail to get video link or thumbnail link")
    }
    if(!videoLink?.public_id){
        throw new ApiError(400,"Fail to get public id from video")
    }
    if(!thumbnailLink?.public_id){
        throw new ApiError(400,"Fail to get public id from video")
    }

    const video = await Video.create({
        "videoFile":videoLink.url,
        "videoPublicId":videoLink.public_id,
        "description":description,
        "owner":user,
        "thumbnail":thumbnailLink.url || " ",
        "duration":videoLink.duration || 0
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
    const {description} = req.body

    if(!videoId || !user){
        throw new ApiError(400,"videoId or user is missing")
    }

    const thumbnailLocalPath = req.files?.videoFile[0].path;
    console.log(req.files?.videoFile[0].path)
    console.log(thumbnailLocalPath)
    if(!thumbnailLocalPath){
        throw new ApiError(400,"fail to get video local path")
    }


    const thumbnail = await uploadOnClaudinary(thumbnailLocalPath);
    if(!thumbnail?.url && !thumbnail?.public_id){
        throw new ApiError(400,"Failed to upload on cloudinary")
    }

    const oldVideoData = await Video.findOne({
        "videoPublicId":videoId,
        "owner":user
    });

    if(oldVideoData){
        throw new ApiError(400,"fail to get video or unauthorized")
    }

    const newVideo = await Video.findByIdAndUpdate(
        {_id:videoId},
        {
            $set:{
                thumbnail:thumbnail.url,
                thumbnailPublicId:thumbnail.public_id
            }
        },
        {
            new:true
        }
    )
    
    if(!newVideo){
        throw new ApiError(400,"fail to update video")
    }

    return res
            .status(200)
            .json(200,newVideo,"updated successfully")

})

const deleteVideo = asyncHandler(async (req, res) => {
    //TODO: delete video
    const { videoId } = req.params
    const user = req?.user?._id

    if(!videoId || !user){
        throw new ApiError(400,"videoId or user is missing")
    }

    
    let video = await Video.findOne({
        owner:user,
        _id:videoId
    })
    
    await deleteFromCloudinary(video.videoPublic_id)

     video = await Video.findOneAndDelete({
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