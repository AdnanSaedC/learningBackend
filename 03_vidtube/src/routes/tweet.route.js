import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createTweet, deleteTweet, getUserTweets, updateTweet } from "../controllers/tweet.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const tweetRouter = Router()


tweetRouter.route("/create-tweet").post(verifyJWT,upload.none(),createTweet)
tweetRouter.route("/user-tweet").get(verifyJWT,getUserTweets)
tweetRouter.route("/update-tweet").get(verifyJWT,upload.none(),updateTweet)
tweetRouter.route("/delete-tweet").get(verifyJWT,upload.none(),deleteTweet)

export default tweetRouter