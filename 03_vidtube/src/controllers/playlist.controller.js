import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body
    const userId = req?.user?._id;

    if (!name || !description) {
        throw new ApiError(400, "Name and description are required")
    }

    if(!userId){
        throw new ApiError(400,"userId was not found")
    }

    const newPlaylist = await Playlist.create({
         name,
        description,
        owner:userId
    })

    if(!newPlaylist){
        throw new ApiError(500,"failed to craete playlist")
    }

    return res
            .status(200)
            .json(new ApiResponse(200,newPlaylist,"playlist created successfully"))
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    //TODO: get user playlists

    if(!userId){
        throw new ApiError(400,"User is was not found")
    }

    const playlist= await Playlist.find({
        owner:userId
    })

    if(playlist.length === 0){
        return res
                .status(200)
                .json(new ApiResponse(200,playlist,"No playlist"))
    }

    return res
            .status(200)
            .json(new ApiResponse(200,playlist,"No playlist"))
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    //TODO: get playlist by id

    // anyone can see the playlist using the id

    if(!playlistId ){
        throw new ApiError(400,"playlist id required")
    }

    const playlist = await Playlist.findById(playlistId);

    // since mongodb returns an object(findBYId and findone)
    // only find(),paginates return array
    if(!playlist){
        return res
                .status(200)
                .json(new ApiResponse(200,playlist,"no playlist"))
            }
    return res
            .status(200)
            .json(new ApiResponse(200,playlist,"playlist fetched successfully"))
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
      const { playlistId, videoId } = req.body
    const userId = req.user?._id

    if (!playlistId || !videoId) {
        throw new ApiError(400, "playlistId and videoId are required")
    }

    const playlist = await Playlist.findOneAndUpdate(
        {
            _id: playlistId,
            owner: userId
        },
        {
            // addToset add the item in the array only if similar values not preset
            // mongodb tries to keep unique value it is like a set it will add the video only when video is not present
            $addToSet: { video: videoId }
        },
        { new: true }
    )

    if (!playlist) {
        throw new ApiError(404, "Playlist not found or unauthorized")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, playlist, "Video added to playlist"))


    
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
  
    const userId = req.user?._id

    if (!playlistId || !videoId) {
        throw new ApiError(400, "playlistId and videoId are required")
    }

    const playlist = await Playlist.findOneAndUpdate(
        {
            _id: playlistId,
            owner: userId
        },
        {
            // $pull is used to remove an item from an array in mongodb
            $pull:{
                video:videoId
            }
        },
        { new: true }
    )

    if (!playlist) {
        throw new ApiError(404, "Playlist not found or unauthorized")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, playlist, "Video added to playlist"))
})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist

    const userId = req?.user?._id
    if(!playlistId || !userId){
        throw new ApiError(400,"playlistId or userid not foud")
    }

    const deletedPlaylist = await Playlist.findOneAndDelete({
        _id: playlistId,
        owner: userId
    })

    if (!deletedPlaylist) {
        throw new ApiError(404, "Playlist not found or not authorized")
    }

    return res
            .status(200)
            .json(new ApiResponse(200,"Playlist was deleted successfully"))
})

const updatePlaylist = asyncHandler(async (req, res) => {
   const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    const { name, description } = req.body
    const userId = req?.user?._id

    if (!playlistId || !userId) {
        throw new ApiError(400, "playlistId or userId is missing")
    }

    if (!name && !description) {
        throw new ApiError(400, "Nothing to update")
    }

    const updateFields = {}
    if(name){
        updateFields.name = name
    }

    if(description){ 
        updateFields.description = description
    }

    const updatedPlaylist = await Playlist.findOneAndUpdate(
        {
            _id: playlistId,
            owner: userId
        },
        {
            $set: updateFields
        },
        {
            new: true,
            runValidators: true
        }
    )

    if (!updatedPlaylist) {
        throw new ApiError(403, "Unauthorized or playlist not found")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, updatedPlaylist, "Playlist updated successfully"))
})

})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}