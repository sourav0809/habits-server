import express from "express";
import authRoutes from "./auth.routes";
import foodRoutes from "./food.routes";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/food", foodRoutes);

export default router;