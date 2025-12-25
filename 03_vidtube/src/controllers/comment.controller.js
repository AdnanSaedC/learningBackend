import mongoose from "mongoose"
import {Comment} from "../models/comment.models.js"
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import {asyncHandler} from "../utils/asyncHandler.js"
import { User } from "../models/user.models.js";

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query
    
    if(!videoId){
        throw new ApiError(400,"Video id not available")
    }

    const userId = new mongoose.Types.ObjectId(req?.user?._id)
    if(userId){
        throw new ApiError(400,"User was not found")

        //here we are considering the are watching the comments only after getting loged
    }
    const commentsPipeline= await Comment.aggregate([
        {
            $match:{
                video:videoId
            }
        },
        {
            // now we have got all the comments which was made on the video
            // finding all the likes 
            $lookup:{
                from:"likes",
                localField:"$owner",
                foreignField:"$likedBy",
                as:"owner"
            }
        },
        {
            $addField:{
                "totalLike":{
                    $size:"$likes"
                },
                "isLiked":{
                    $cond:{
                        if:{
                            $in:[userId,"$likes.likedBy"],
                            then:true,
                            else:false
                        }
                    }
                }
            }
        }
    ])

      const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10)
    };


    //the result which we obtain can have one page and 10 comments maxon the page
    const comments = await Comment.aggregatePaginate(
        commentsPipeline,
        options
    );

    return res
        .status(200)
        .json(new ApiResponse(200,comments[0],"Comment retreived succesfully"))

})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a 
    const {comment , videoId}= req.body
    const _id = req?.user?._id
    if(!comment || !videoId  || _id){
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
    const {newContent,}=req.body
    const _id = req?.user?._id

    if(!_id){
        throw new ApiError(400,"id was not found")
    }

    const comment = await Comment.findById(_id);
    if(comment?.owner !== req.user?._id){
        throw new ApiError(400,"only owner can change the comment")
    }
    comment.content=newContent

    await comment.save({validateBeforeSave:false})

    return res
            .status(200)
            .json(new ApiResponse(200,"comment was updated succesfully"))
})

const deleteComment = asyncHandler(async (req, res) => {
    const _id = req?.user?._id
    if(!_id){
        throw new ApiError(400,"Id is required")
    }


    const comment = await Comment.findById(id)
    if(!comment){
        throw new ApiError(400,"Commnet not found")
    }

    if(comment?.owner !== req?.user?._id){
        throw new ApiError(400,"only owner can change the comment")
    }

    await Comment.findByIdAndDelete(id);
 

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