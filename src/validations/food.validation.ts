import Joi from "joi";

import { JoiValidationSchema } from "../types/common";

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
