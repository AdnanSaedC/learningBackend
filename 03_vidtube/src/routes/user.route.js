import { Router } from "express";
import { getUserDetails, loginUser, 
        logoutUser,
        refreshAccessToken,
        updateAccountDetails,
        updateAvatar,
        updateCoverImage,
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
userRouter.route("/login").post(loginUser)
userRouter.route("/refresh-token").post(refreshAccessToken)

// adding user to req
userRouter.route("/logout").post(verifyJWT,logoutUser)
userRouter.route("/logout").post(verifyJWT,logoutUser)
userRouter.route("/change-password").post(verifyJWT,updatePassword)
userRouter.route("/c/:username").post(verifyJWT,getUserDetails)
userRouter.route("/update-account").post(verifyJWT,updateAccountDetails)
userRouter.route("/avatar").post(verifyJWT,upload.single("avatar"),updateAvatar)
userRouter.route("/cover-image").post(verifyJWT,upload.single("coverImage"),updateCoverImage)
userRouter.route("/history").get(verifyJWT,getWatchHistory)
export default userRouter;