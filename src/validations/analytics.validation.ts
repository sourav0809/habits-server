import Joi from "joi";

import { JoiValidationSchema } from "../types/common";

/**
 * Analytics query schema: range (e.g. 1y, 6m, 7d) and unit (day, month, year).
 */
export const analyticsQuerySchema: JoiValidationSchema = {
  query: Joi.object().keys({
    range: Joi.string().trim().optional(),
    unit: Joi.string().trim().optional(),
  }),
};
