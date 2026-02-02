import express from "express";
import authRoutes from "./auth.routes";
import userFoodRoutes from "./userFood.routes";
import userFoodConsumptionRoutes from "./foodConsumption.routes";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/user/food", userFoodRoutes);
router.use("/user/food/consumption", userFoodConsumptionRoutes);

export default router;    