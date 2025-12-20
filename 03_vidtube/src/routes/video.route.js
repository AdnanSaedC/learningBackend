import { Router } from "express";
import { deleteVideo, getAllVideos, getVideoById, publishAVideo, togglePublishStatus, updateVideo } from "../controllers/video.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const videoRouter = Router()

videoRouter.route("get-all-videos").get(getAllVideos)
videoRouter.route("publish-video").get(upload.single("video"),publishAVideo)
videoRouter.route("get-video/:videoId").get(getVideoById) 
videoRouter.route("update-video/:videoId").get(verifyJWT,updateVideo) 
videoRouter.route("delete-video/:videoId").get(verifyJWT,deleteVideo)
videoRouter.route("toggle-status/:videoId").get(verifyJWT,togglePublishStatus) 

export default videoRouter