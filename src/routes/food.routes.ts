import express from "express";

import foodController from "../controller/food.controller";
import authMiddleware from "@/middlewares/auth.middleware";
import validate from "@/utils/validate";
import { createFoodSchema } from "@/validations/food.validation";

const router = express.Router();

router.route("/")
  .get(authMiddleware, foodController.getFoods)
  .post(authMiddleware, validate(createFoodSchema), foodController.addAFood);

export default router;
