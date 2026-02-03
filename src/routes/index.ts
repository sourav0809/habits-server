import express from "express";
import authRoutes from "./auth.routes";
import userFoodRoutes from "./userFood.routes";
import userFoodConsumptionRoutes from "./foodConsumption.routes";
import waterConsumptionRoutes from "./waterConsumption.routes";
import userGoalRoutes from "./userGoal.routes";
import userActivityRoutes from "./userActivity.routes";
import userAnalyticsRoutes from "./userAnalytics.routes";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/user/food", userFoodRoutes);
router.use("/user/food/consumption", userFoodConsumptionRoutes);
router.use("/user/water/consumption", waterConsumptionRoutes);
router.use("/user/goals", userGoalRoutes);
router.use("/user/activities", userActivityRoutes);
router.use("/user/analytics", userAnalyticsRoutes);

export default router;    