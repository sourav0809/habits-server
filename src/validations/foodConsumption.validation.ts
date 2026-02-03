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
    dateAndTime: Joi.date().required(),
  }),
};

/**
 * Get all food consumptions schema (query: startDate, endDate optional; page, limit for pagination).
 * startDate/endDate default to today. page default 1, limit default 20, max 100.
 */
export const getAllFoodConsumptionSchema: JoiValidationSchema = {
  query: Joi.object().keys({
    startDate: Joi.alternatives().try(Joi.date(), Joi.string()).optional(),
    endDate: Joi.alternatives().try(Joi.date(), Joi.string()).optional(),
    page: Joi.number().integer().min(1).optional(),
    limit: Joi.number().integer().min(1).max(100).optional(),
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

/**
 * Update food consumption schema (params: id, body: quantity, dateAndTime, userFoodId — all optional).
 * userActivityId is derived from dateAndTime (start of day); do not send it.
 */
export const updateFoodConsumptionSchema: JoiValidationSchema = {
  params: idParam,
  body: Joi.object()
    .keys({
      quantity: Joi.number().min(0).optional(),
      dateAndTime: Joi.alternatives().try(Joi.date(), Joi.string()).optional(),
      userFoodId: Joi.string().length(24).hex().optional(),
    })
    .min(1)
    .messages({ "object.min": "At least one of quantity, dateAndTime, or userFoodId is required" }),
};
