import Joi from "joi";

import { JoiValidationSchema } from "../types/common";

const idParam = Joi.object().keys({
  id: Joi.string().length(24).hex().required(),
});

/**
 * Create food consumption schema (body: userFoodId, quantity, optional date)
 */
export const createFoodConsumptionSchema: JoiValidationSchema = {
  body: Joi.object().keys({
    userFoodId: Joi.string().length(24).hex().required(),
    quantity: Joi.number().min(0).required(),
    date: Joi.date().optional().allow(null),
  }),
};

/**
 * Get all food consumptions schema (query: startDate, endDate optional, default today)
 */
export const getAllFoodConsumptionSchema: JoiValidationSchema = {
  query: Joi.object().keys({
    startDate: Joi.date().optional(),
    endDate: Joi.date().optional(),
  }),
};

/**
 * Delete food consumption schema (params: id)
 */
export const deleteFoodConsumptionSchema: JoiValidationSchema = {
  params: idParam,
};

/**
 * Get one food consumption schema (params: id)
 */
export const getOneFoodConsumptionSchema: JoiValidationSchema = {
  params: idParam,
};
