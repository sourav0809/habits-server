import express from "express";

import userFoodController from "../controller/userFood.controller";
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
  .get(authMiddleware, userFoodController.getFoods)
  .post(authMiddleware, validate(createFoodSchema), userFoodController.addAFood);

router
  .route("/:id")
  .patch(authMiddleware, validate(updateFoodSchema), userFoodController.updateFood)
  .delete(authMiddleware, validate(deleteFoodSchema), userFoodController.deleteFood);

export default router;
