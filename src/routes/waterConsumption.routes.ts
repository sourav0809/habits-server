import express from "express";

import waterConsumptionController from "@/controller/waterConsumption.controller";
import authMiddleware from "@/middlewares/auth.middleware";
import validate from "@/utils/validate";
import {
  createWaterConsumptionSchema,
  getAllWaterConsumptionSchema,
  deleteWaterConsumptionSchema,
  getOneWaterConsumptionSchema,
  updateWaterConsumptionSchema,
} from "@/validations/waterConsumption.validation";

const router = express.Router();

router
  .route("/")
  .get(
    authMiddleware,
    validate(getAllWaterConsumptionSchema),
    waterConsumptionController.getWaterConsumptions
  )
  .post(
    authMiddleware,
    validate(createWaterConsumptionSchema),
    waterConsumptionController.addWaterConsumption
  );

router
  .route("/:id")
  .get(
    authMiddleware,
    validate(getOneWaterConsumptionSchema),
    waterConsumptionController.getWaterConsumption
  )
  .patch(
    authMiddleware,
    validate(updateWaterConsumptionSchema),
    waterConsumptionController.updateWaterConsumption
  )
  .delete(
    authMiddleware,
    validate(deleteWaterConsumptionSchema),
    waterConsumptionController.deleteWaterConsumption
  );

export default router;
