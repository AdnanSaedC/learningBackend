import { Router } from "express";
import { getLikedVideos, toggleCommentLike, toggleTweetLike, toggleVideoLike } from "../controllers/like.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const likeRouter = Router()

likeRouter.route("/toggle-video-like/:videoId").post(verifyJWT,toggleVideoLike)
likeRouter.route("/toggle-comment-like/:commentId").post(verifyJWT,toggleCommentLike)
likeRouter.route("/toggle-tweet-like/:tweetId").post(verifyJWT,toggleTweetLike)
likeRouter.route("/get-liked-video").post(verifyJWT,getLikedVideos)

export default likeRouter