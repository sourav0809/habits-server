import Joi from "joi";

import { JoiValidationSchema } from "../types/common";

/**
 * Analytics query schema: either startDate + endDate, or range (e.g. 1y, 6m, 7d); unit (day, month, year) for grouping when using range.
 */
export const analyticsQuerySchema: JoiValidationSchema = {
  query: Joi.object().keys({
    startDate: Joi.alternatives().try(Joi.date(), Joi.string()).optional(),
    endDate: Joi.alternatives().try(Joi.date(), Joi.string()).optional(),
    range: Joi.string().trim().optional(),
    unit: Joi.string().trim().valid("day", "month", "year").optional(),
  }),
};

/**
 * Calories over time: user must pass EITHER (startDate + endDate) OR (range with optional unit), not both.
 */
export const caloriesOverTimeQuerySchema: JoiValidationSchema = {
  query: Joi.object()
    .keys({
      startDate: Joi.alternatives().try(Joi.date(), Joi.string()).optional(),
      endDate: Joi.alternatives().try(Joi.date(), Joi.string()).optional(),
      range: Joi.string().trim().optional(),
      unit: Joi.string().trim().valid("day", "month", "year").optional(),
    })
    .custom((value: Record<string, unknown>, helpers) => {
      const hasStart = value.startDate != null && value.startDate !== "";
      const hasEnd = value.endDate != null && value.endDate !== "";
      const hasRange = value.range != null && value.range !== "";
      const hasDateRange = hasStart || hasEnd;
      if (hasDateRange && hasRange) {
        return helpers.message({ custom: "Use either startDate+endDate or range, not both" });
      }
      if (hasStart && !hasEnd) {
        return helpers.message({ custom: "endDate is required when startDate is provided" });
      }
      if (hasEnd && !hasStart) {
        return helpers.message({ custom: "startDate is required when endDate is provided" });
      }
      return value;
    }),
};
