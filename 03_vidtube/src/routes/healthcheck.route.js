import { healthcheck } from "../controllers/healthCheck.controller.js";
import { Router } from "express";

const router = Router();

router.route("/").get(healthcheck);

export {router}