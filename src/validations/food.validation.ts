import Joi from "joi";

import { JoiValidationSchema } from "../types/common";

const foodIdParam = Joi.object().keys({
  id: Joi.string().length(24).hex().required(),
});

/**
 * Create user food schema
 */
export const createFoodSchema: JoiValidationSchema = {
  body: Joi.object().keys({
    name: Joi.string().required().trim(),
    caloriesPerGram: Joi.number().min(0).required(),
    defaultQuantity: Joi.number().min(0).required(),
  }),
};

/**
 * Update user food schema (all body fields optional)
 */
export const updateFoodSchema: JoiValidationSchema = {
  params: foodIdParam,
  body: Joi.object()
    .keys({
      name: Joi.string().trim(),
      caloriesPerGram: Joi.number().min(0),
      defaultQuantity: Joi.number().min(0),
    })
    .min(1),
};

/**
 * Delete user food schema (params only)
 */
export const deleteFoodSchema: JoiValidationSchema = {
  params: foodIdParam,
};
