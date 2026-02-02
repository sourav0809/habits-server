import express from "express";

import userGoalController from "@/controller/userGoal.controller";
import authMiddleware from "@/middlewares/auth.middleware";
import validate from "@/utils/validate";
import {
  createUserGoalSchema,
  updateUserGoalSchema,
} from "@/validations/userGoal.validation";

const router = express.Router();

router
  .route("/")
  .get(authMiddleware, userGoalController.getGoal)
  .post(
    authMiddleware,
    validate(createUserGoalSchema),
    userGoalController.createGoal
  )
  .patch(
    authMiddleware,
    validate(updateUserGoalSchema),
    userGoalController.updateGoal
  );

export default router;
