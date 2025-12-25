import express from "express"
import cors from "cors"
import { router } from "./routes/healthcheck.route.js";
import userRouter  from "./routes/user.route.js";
import errorHandler from "./middlewares/error.middleware.js";
import commentRouter from "./routes/comment.route.js";
import likeRouter from "./routes/like.route.js";
import playlistRouter from "./routes/playlist.route.js";
import subscriptionRouter from "./routes/subscription.route.js";
import tweetRouter from "./routes/tweet.route.js";
import videoRouter from "./routes/video.route.js";
import { upload } from "./middlewares/multer.middleware.js";
import cookieParser from "cookie-parser"
import dashboardRouter from "./routes/dashboard.route.js";

const app = express();

//look now we are going to decide who is going to interact with the backend
//allowed people for that we are installing cors
//it is a middleware
//here origin means only from these url request can come
//and credential means the frontend can send cookies auth etc
app.use(
    cors({
        origin:process.env.CORS_ORIGIN,
        credentials:true
    })
)

//now common express middleware
//this is that frontend can send json data
//this is to convert the data coming in the req body into js object
app.use(express.json({limit:"16kb"}))

//here urlencoded means you can send the data in url 
//extended means contains all the fetaure and data limit is 16kb
//this is to accespt data from forms
//extended means it support complex objcet also and convert them into js objects
app.use(express.urlencoded({extended:true,limit:"16kb"}))

//this means there are certain things which is same for all users
//you can access them without any route
app.use(express.static("public"))


//to read cookies
app.use(cookieParser())

app.use("/api/v1/healthcheck",router);
app.use("/api/v1/user",userRouter )
app.use("/api/v1/comments",commentRouter)
app.use("/api/v1/likes",likeRouter)
app.use("/api/v1/playlist",playlistRouter)
app.use("/api/v1/subscription",subscriptionRouter)
app.use("/api/v1/tweet",tweetRouter)
app.use("/api/v1/dashboard",dashboardRouter)

app.use("/api/v1/video",videoRouter)

//importing error handler
//it is just to handle error better

export {app}