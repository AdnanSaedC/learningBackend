import { Router } from "express";
import { getUserDetails, loginUser, 
        logoutUser,
        refreshAccessToken,
        updateAccountDetails,
        updateAvatar,
        updateCoverImage,
        getWatchHistory,
        updatePassword,
        userRegister } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const userRouter  = Router();

//unsecured routes
// no need to add user in req
userRouter.route("/register").post(
    upload.fields([
        {
            name:"avatar",
            maxCount:1
        },
        {
            name:"coverImage",
            maxCount:1
        }
    ]),
    userRegister)
userRouter.route("/avatar").post(verifyJWT,
    upload.fields([
        {
            name:"avatar",
            maxCount:1
        },
    ]),
    updateAvatar)
userRouter.route("/cover-image").post(verifyJWT,
    upload.fields([
        {
            name:"coverImage",
            maxCount:1
        },
    ]),updateCoverImage)

//this is beacause the xpress cant able to read multipart form data
// if you got the error
// upload.none()
userRouter.route("/login").post(upload.none(),loginUser)
userRouter.route("/refresh-token").post(upload.none(),refreshAccessToken)

// adding user to req
userRouter.route("/logout").post(verifyJWT,upload.none(),logoutUser)
userRouter.route("/change-password").post(verifyJWT,upload.none(),updatePassword)
userRouter.route("/c/:username").post(verifyJWT,upload.none(),getUserDetails)
userRouter.route("/update-account").post(verifyJWT,updateAccountDetails)
userRouter.route("/history").get(verifyJWT,getWatchHistory)
export default userRouter;