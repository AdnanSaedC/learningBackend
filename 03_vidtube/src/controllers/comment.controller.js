import mongoose from "mongoose"
import {Comment} from "../models/comment.models.js"
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import {asyncHandler} from "../utils/asyncHandler.js"
import { User } from "../models/user.models.js";

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    let {page = 1, limit = 10} = req.query
    page = parseInt(page, 10),
    limit = parseInt(limit, 10)
    
    if(!videoId){
        throw new ApiError(400,"Video id not available")
    }

    const userId= req?.user?._id
    if(!userId){
        throw new ApiError(400,"User was not found")
        //here we are considering the are watching the comments only after getting loged
    }

    //look if you want to access values from mongodb fileds use $ if u r just referring no nee
    const comments= await Comment.aggregate([
        {
            $match:{
                video:new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            $skip:(page-1)*limit
        },
        {
            // now we have got all the comments which was made on the video
            // finding all the likes 
            $lookup:{
                from:"likes",
                localField:"owner",
                foreignField:"likedBy",
                as:"owner"
            }
        },
        {
            $addFields:{
                "totalLike":{
                    $size:{
                        $ifNull: ["$likes", []] 
                        // if likes are empty or null pretends this as an empty array
                    }
                },
                "isLiked":{
                    $cond:{
                        if:{ 
                            $in:[
                                userId,
                                // if likes are empty or null pretends this as an empty array
                                    {$ifNull:["$likes.likedBy",[]]}
                                ]
                        },
                                then:true,
                                else:false
                        
                    }
                }
            }
        }
    ])


    return res
        .status(200)
        .json(new ApiResponse(200,comments[0],"Comment retreived succesfully"))

})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a 
    const {comment , videoId,}= req.body
    const _id = req?.user?._id
    if(!comment || !videoId  || !_id){
        throw new ApiError(400,"Comment and videoId are required")
    }

    const newComment = await Comment.create({
        content:comment,
        video:videoId,
        owner:_id
    })

    const createdComment = await Comment.findById(newComment._id)

    if(!createdComment){
        throw new ApiError(500,"Comment was not created")
    }

    return res
            .status(200)
            .json(new ApiResponse(200,createdComment,"Comment was created successfully"))


})

const updateComment = asyncHandler(async (req, res) => {
    const {newContent,commentId}=req.body
    const _id = req?.user?._id

    if(!_id){
        throw new ApiError(400,"id was not found")
    }

    const comment = await Comment.findOneAndUpdate(
        {
            "_id":commentId,
            "owner":_id
        },
        {
            content:newContent
        },
        {
            new : true
        }
    );

    if(!comment){
        throw new ApiError(400,"unauthorized or faile to update content")
    }

    return res
            .status(200)
            .json(new ApiResponse(200,comment,"comment was updated succesfully"))
})

const deleteComment = asyncHandler(async (req, res) => {

    const _id = req?.user?._id
    const {commentId} = req.body
    if(!_id || !commentId){
        throw new ApiError(400,"user Id and commentID is required")
    }

    await Comment.findOneAndDelete(
        {
            "_id":commentId,
            "owner":_id
        },
    );

    return res
            .status(200)
            .json(new ApiResponse(200,"comment deleted succesfully"))
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }