import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { addVideoToPlaylist, createPlaylist, deletePlaylist, getPlaylistById, getUserPlaylists, removeVideoFromPlaylist, updatePlaylist } from "../controllers/playlist.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const playlistRouter = Router();


playlistRouter.route("/create-playlist").post(verifyJWT,upload.none(),createPlaylist)
playlistRouter.route("/get-playlist-by-id/:playlistId").get(getPlaylistById)
playlistRouter.route("/get-user-playlist/:userId").get(verifyJWT,getUserPlaylists)
playlistRouter.route("/add-video-to-playlist").post(verifyJWT,upload.none(),addVideoToPlaylist)
playlistRouter.route("/remove-video-from-playlist/:playlistId/:videoId").post(verifyJWT,removeVideoFromPlaylist)
playlistRouter.route("/delete-playlist/:playlistId").get(verifyJWT,deletePlaylist)
playlistRouter.route("/update-playlist/:playlistId").post(verifyJWT,upload.none(),updatePlaylist)

export default playlistRouter