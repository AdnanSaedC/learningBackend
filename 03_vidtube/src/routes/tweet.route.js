import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createTweet, deleteTweet, getUserTweets, updateTweet } from "../controllers/tweet.controller.js";

const tweetRouter = Router()

tweetRouter.route("create-tweet").get(verifyJWT,createTweet)
tweetRouter.route("user-tweet").get(verifyJWT,getUserTweets)
tweetRouter.route("update-tweet").get(verifyJWT,updateTweet)
tweetRouter.route("delete-tweet").get(verifyJWT,deleteTweet)

export default tweetRouter