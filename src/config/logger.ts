import winston from "winston";

import { SERVER_ENVIRONMENT } from "../constant/common";
import envConfig from "./envConfig";

/**
 * Enumerate error format
 * @param {winston.Logform.TransformableInfo} info - The log information
 * @returns {winston.Logform.TransformableInfo} The log information
 */
const enumerateErrorFormat = winston.format((info) => {
  if (info instanceof Error) {
    Object.assign(info, { message: info.stack });
  }
  return info;
});

/**
 * Logger
 * @type {winston.Logger}
 */
const logger = winston.createLogger({
  level: envConfig.server.env === SERVER_ENVIRONMENT.DEVELOPMENT ? "debug" : "info",
  format: winston.format.combine(
    enumerateErrorFormat(),
    envConfig.server.env === SERVER_ENVIRONMENT.DEVELOPMENT
      ? winston.format.colorize()
      : winston.format.uncolorize(),
    winston.format.splat(),
    winston.format.printf(({ level, message }) => `${level}: ${message}`)
  ),
  transports: [
    new winston.transports.Console({
      stderrLevels: ["error"],
    }),
  ],
});

export default logger;
