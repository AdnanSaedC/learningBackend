import { Router } from "express";
import { deleteVideo, getAllVideos, getVideoById, publishAVideo, togglePublishStatus, updateVideo } from "../controllers/video.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const videoRouter = Router()

videoRouter.route("/get-all-videos").get(verifyJWT,getAllVideos)
videoRouter.route("/publish-video").get(verifyJWT,upload.fields([
        {
            name:"videoFile",
            maxCount:1
        },
        {
            name:"thumbnailFile",
            maxCount:1
        },
    ]),publishAVideo)

videoRouter.route("/update-video/:videoId").get(verifyJWT,upload.fields([
        {
            name:"videoFile",
            maxCount:1
        },
    ]),updateVideo)

videoRouter.route("/get-video/:videoId").get(upload.none(),getVideoById) 

videoRouter.route("/delete-video/:videoId").get(verifyJWT,upload.none(),deleteVideo)
videoRouter.route("/toggle-status/:videoId").get(verifyJWT,upload.none(),togglePublishStatus) 

export default videoRouter