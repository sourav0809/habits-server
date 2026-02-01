import express from "express";
import authRoutes from "./auth.routes";
import userFoodRoutes from "./userFood.routes";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/user/food", userFoodRoutes);

export default router;    