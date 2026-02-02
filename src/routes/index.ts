import express from "express";
import authRoutes from "./auth.routes";
import userFoodRoutes from "./userFood.routes";
import userFoodConsumptionRoutes from "./foodConsumption.routes";
import waterConsumptionRoutes from "./waterConsumption.routes";
import userGoalRoutes from "./userGoal.routes";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/user/food", userFoodRoutes);
router.use("/user/food/consumption", userFoodConsumptionRoutes);
router.use("/user/water/consumption", waterConsumptionRoutes);
router.use("/user/goals", userGoalRoutes);

export default router;    