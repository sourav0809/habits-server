import Joi from "joi";

import { JoiValidationSchema } from "../types/common";

/**
 * Create goal schema (body: targetWaterMl and targetCalories — both required, ≥ 0).
 */
export const createUserGoalSchema: JoiValidationSchema = {
  body: Joi.object().keys({
    targetWaterMl: Joi.number().min(0).required(),
    targetCalories: Joi.number().min(0).required(),
  }),
};

/**
 * Update goal schema (body: at least one of targetWaterMl or targetCalories required; each ≥ 0 if present).
 */
export const updateUserGoalSchema: JoiValidationSchema = {
  body: Joi.object()
    .keys({
      targetWaterMl: Joi.number().min(0).optional(),
      targetCalories: Joi.number().min(0).optional(),
    })
    .min(1)
    .messages({ "object.min": "At least one of targetWaterMl or targetCalories is required" }),
};
