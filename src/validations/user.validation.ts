import Joi from "joi";

import { JoiValidationSchema } from "../types/common";

export const updateUserPreferencesSchema: JoiValidationSchema = {
  body: Joi.object().keys({
    dashboardLayoutConfig: Joi.object().required(),
  }),
};
