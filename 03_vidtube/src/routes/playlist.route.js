import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { addVideoToPlaylist, createPlaylist, deletePlaylist, getPlaylistById, getUserPlaylists, removeVideoFromPlaylist, updatePlaylist } from "../controllers/playlist.controller.js";

const playlistRouter = Router();

playlistRouter.route("/create-playlist").get(verifyJWT,createPlaylist)
playlistRouter.route("/get-user-playlist").get(verifyJWT,getUserPlaylists)
playlistRouter.route("/add-video-to-playlist").get(verifyJWT,addVideoToPlaylist)
playlistRouter.route("/remove-video-from-playlist/:playlistId/:videoId").get(verifyJWT,removeVideoFromPlaylist)
playlistRouter.route("/delete-playlist/:playlistId").get(verifyJWT,deletePlaylist)
playlistRouter.route("/update-playlist/:playlistId").get(verifyJWT,updatePlaylist)


playlistRouter.route("get-playlist-by-id/:playlistId").get(getPlaylistById)

export default playlistRouter