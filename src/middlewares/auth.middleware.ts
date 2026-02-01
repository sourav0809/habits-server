import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { envConfig } from "@/config";
import ERROR_MESSAGES from "@/constant/errorMessages";
import userService from "@/service/user.service";
import type { JwtPayload } from "@/types";
import type { AuthenticatedRequest } from "@/types";
import catchAsync from "@/utils/catchAsync";
import { response } from "@/utils/response";
import httpStatus from "http-status";

/**
 * Authenticate request using Bearer token.
 * Verifies JWT, loads user, and sets req.user. Returns 401 if token missing/invalid or user not found.
 */
const authMiddleware = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, "").trim();
  if (!token) {
    return response(res, httpStatus.UNAUTHORIZED, ERROR_MESSAGES.AUTH.UNAUTHORIZED);
  }

  let decoded: JwtPayload;
  try {
    decoded = jwt.verify(token, envConfig.security.secretKey) as JwtPayload;
  } catch {
    return response(res, httpStatus.UNAUTHORIZED, ERROR_MESSAGES.AUTH.UNAUTHORIZED);
  }

  const user = await userService.findOneByCondition({ email: decoded.email });
  if (!user) {
    return response(res, httpStatus.UNAUTHORIZED, ERROR_MESSAGES.AUTH.UNAUTHORIZED);
  }

  (req as AuthenticatedRequest).user = user;
  next();
});

export default authMiddleware;
