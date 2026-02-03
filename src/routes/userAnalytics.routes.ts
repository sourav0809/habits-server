import express from "express";

import analyticsController from "@/controller/analytics.controller";
import authMiddleware from "@/middlewares/auth.middleware";
import validate from "@/utils/validate";
import {
  analyticsQuerySchema,
  caloriesOverTimeQuerySchema,
} from "@/validations/analytics.validation";

const router = express.Router();

router.get(
  "/calories-progress",
  authMiddleware,
  validate(analyticsQuerySchema),
  analyticsController.getCaloriesProgress
);

router.get(
  "/water-progress",
  authMiddleware,
  validate(analyticsQuerySchema),
  analyticsController.getWaterProgress
);

router.get(
  "/goal-achievement-trend",
  authMiddleware,
  validate(analyticsQuerySchema),
  analyticsController.getGoalAchievementTrend
);

router.get(
  "/hydration-insights",
  authMiddleware,
  validate(analyticsQuerySchema),
  analyticsController.getHydrationInsights
);

router.get(
  "/calories-over-time",
  authMiddleware,
  validate(caloriesOverTimeQuerySchema),
  analyticsController.getCaloriesOverTime
);

export default router;
