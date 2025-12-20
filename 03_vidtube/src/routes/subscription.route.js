import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getSubscribedChannels, getUserChannelSubscribers, toggleSubscription } from "../controllers/subscription.controller.js";

const subscriptionRouter = Router()

subscriptionRouter.route("/toggle-subscription").get(verifyJWT,toggleSubscription)
subscriptionRouter.route("/user-subscription/:channelId").get(getUserChannelSubscribers)
subscriptionRouter.route("/subscribed-channels/:subscriberId").get(getSubscribedChannels)

export default subscriptionRouter