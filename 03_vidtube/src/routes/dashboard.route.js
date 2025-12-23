import { Router } from "express";
import { getChannelStats, getChannelVideos } from "../controllers/dashboard.controller.js";

const dashboardRouter = Router()

dashboardRouter.route("/channel-stat/:channelId").get(getChannelStats)
dashboardRouter.route("/channel-video/:channelId").get(getChannelVideos)

export default dashboardRouter