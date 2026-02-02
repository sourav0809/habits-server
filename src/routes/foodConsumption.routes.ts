import express from "express";

import foodConsumptionController from "@/controller/foodConsumption.controller";
import authMiddleware from "@/middlewares/auth.middleware";
import validate from "@/utils/validate";
import {
  createFoodConsumptionSchema,
  getAllFoodConsumptionSchema,
  deleteFoodConsumptionSchema,
  getOneFoodConsumptionSchema,
  updateFoodConsumptionSchema,
} from "@/validations/foodConsumption.validation";

const router = express.Router();

router
  .route("/")
  .get(
    authMiddleware,
    validate(getAllFoodConsumptionSchema),
    foodConsumptionController.getFoodConsumptions
  )
  .post(
    authMiddleware,
    validate(createFoodConsumptionSchema),
    foodConsumptionController.addFoodConsumption
  );

router
  .route("/:id")
  .get(
    authMiddleware,
    validate(getOneFoodConsumptionSchema),
    foodConsumptionController.getFoodConsumption
  )
  .patch(
    authMiddleware,
    validate(updateFoodConsumptionSchema),
    foodConsumptionController.updateFoodConsumption
  )
  .delete(
    authMiddleware,
    validate(deleteFoodConsumptionSchema),
    foodConsumptionController.deleteFoodConsumption
  );

export default router;
