import Joi from "joi";

import { JoiValidationSchema } from "../types/common";

/**
 * Register schema
 * @type {Joi.ObjectSchema}
 */
export const registerSchema: JoiValidationSchema = {
  body: Joi.object().keys({
    email: Joi.string().email().required(),
    name: Joi.string().required(),
    password: Joi.string().required(),
  }),
};

export const loginSchema: JoiValidationSchema = {
  body: Joi.object().keys({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),
};
