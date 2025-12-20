import { Router } from "express";
import { router } from "./healthcheck.route.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { addComment, deleteComment, getVideoComments, updateComment } from "../controllers/comment.controller.js";

const commentRouter = Router()

//secured routes
commentRouter.route("/get-video-comment/:videoId").get(verifyJWT,getVideoComments)
commentRouter.route("/add-comment").get(verifyJWT,addComment)
commentRouter.route("/update-comment").get(verifyJWT,updateComment)
commentRouter.route("/delete-comment").get(verifyJWT,deleteComment)

export default commentRouter