import { Router } from "express";
import { router } from "./healthcheck.route.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { addComment, deleteComment, getVideoComments, updateComment } from "../controllers/comment.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const commentRouter = Router()

//secured routes
commentRouter.route("/get-video-comment/:videoId").get(verifyJWT,getVideoComments)
commentRouter.route("/add-comment").get(verifyJWT,upload.none(),addComment)
commentRouter.route("/update-comment").get(verifyJWT,updateComment)
commentRouter.route("/delete-comment").get(verifyJWT,upload.none(),deleteComment)

export default commentRouter