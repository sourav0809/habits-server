import authMiddleware from "@/middlewares/auth.middleware";
import express from "express";
import userActivityController from "@/controller/userActivity.controller";

const router = express.Router();

router
  .route("/today")
  .get(
    authMiddleware,
    userActivityController.getTodaysActivity
  );

export default router;
