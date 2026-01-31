import { Request, Response, NextFunction } from "express";
import { AppError, ErrorResponse } from "../types/error.types";
import logger from "../config/logger";

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = 500;
  let status = "error";
  let message = "Internal server error";
  let stack: string | undefined;

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    status = err.status;
    message = err.message;
  } else if (err instanceof Error) {
    message = err.message;
  }

  // Log the error
  logger.error(
    `${status.toUpperCase()}: ${message}${stack ? `\n${stack}` : ""}`
  );

  const errorResponse: ErrorResponse = {
    status,
    message,
  };

  // Include stack trace in development environment
  if (process.env.NODE_ENV === "development") {
    errorResponse.stack = err.stack;
  }

  res.status(statusCode).json(errorResponse);
};
