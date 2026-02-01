import express from "express";

import foodController from "../controller/food.controller";
import authMiddleware from "@/middlewares/auth.middleware";
import validate from "@/utils/validate";
import {
  createFoodSchema,
  updateFoodSchema,
  deleteFoodSchema,
} from "@/validations/food.validation";

const router = express.Router();

router
  .route("/")
  .get(authMiddleware, foodController.getFoods)
  .post(authMiddleware, validate(createFoodSchema), foodController.addAFood);

router
  .route("/:id")
  .patch(authMiddleware, validate(updateFoodSchema), foodController.updateFood)
  .delete(authMiddleware, validate(deleteFoodSchema), foodController.deleteFood);

export default router;
