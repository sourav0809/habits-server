import Joi from "joi";

import { JoiValidationSchema } from "../types/common";

const idParam = Joi.object().keys({
  id: Joi.string().length(24).hex().required(),
});

/**
 * Create water intake schema (body: amount and dateAndTime both required).
 */
export const createWaterConsumptionSchema: JoiValidationSchema = {
  body: Joi.object().keys({
    amount: Joi.number().min(0).required(),
    dateAndTime: Joi.alternatives().try(Joi.date(), Joi.string()).required(),
  }),
};

/**
 * Get all water intake schema (query: startDate, endDate, page, limit).
 * startDate/endDate optional (default today). page default 1, limit default 20, max 100.
 */
export const getAllWaterConsumptionSchema: JoiValidationSchema = {
  query: Joi.object().keys({
    startDate: Joi.alternatives().try(Joi.date(), Joi.string()).optional(),
    endDate: Joi.alternatives().try(Joi.date(), Joi.string()).optional(),
    page: Joi.number().integer().min(1).optional(),
    limit: Joi.number().integer().min(1).max(100).optional(),
  }),
};

/**
 * Get one water intake schema (params: id).
 */
export const getOneWaterConsumptionSchema: JoiValidationSchema = {
  params: idParam,
};

/**
 * Update water intake schema (params: id, body: amount, dateAndTime — at least one required).
 */
export const updateWaterConsumptionSchema: JoiValidationSchema = {
  params: idParam,
  body: Joi.object()
    .keys({
      amount: Joi.number().min(0).optional(),
      dateAndTime: Joi.alternatives().try(Joi.date(), Joi.string()).optional(),
    })
    .min(1)
    .messages({ "object.min": "At least one of amount or dateAndTime is required" }),
};

/**
 * Delete water intake schema (params: id).
 */
export const deleteWaterConsumptionSchema: JoiValidationSchema = {
  params: idParam,
};
