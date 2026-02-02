import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "@/utils/catchAsync";
import { response } from "@/utils/response";
import type { AuthenticatedRequest } from "@/types";
import userGoalService from "@/service/userGoal.service";
import { SUCCESS_MESSAGES } from "@/constant";
import ERROR_MESSAGES from "@/constant/errorMessages";
import ApiError from "@/utils/apiError";

/**
 * Get current user's goal. Returns 404 if not created yet.
 */
const getGoal = catchAsync(async (req: Request, res: Response) => {
  const user = (req as AuthenticatedRequest).user;
  const goal = await userGoalService.findOneByUserId(user.id);
  if (!goal) {
    return response(res, httpStatus.NOT_FOUND, ERROR_MESSAGES.USER_GOAL.NOT_FOUND);
  }
  return response(res, httpStatus.OK, SUCCESS_MESSAGES.USER_GOAL.GET_SUCCESS, {
    goal,
  });
});

/**
 * Create goal for current user. Fails if goal already exists (use PATCH to update).
 */
const createGoal = catchAsync(async (req: Request, res: Response) => {
  const user = (req as AuthenticatedRequest).user;
  const { targetWaterMl, targetCalories } = req.body;
  try {
    const goal = await userGoalService.create(user.id, {
      targetWaterMl,
      targetCalories,
    });
    return response(res, httpStatus.CREATED, SUCCESS_MESSAGES.USER_GOAL.CREATE_SUCCESS, {
      goal,
    });
  } catch (error: unknown) {
    if (error instanceof ApiError && error.statusCode === 400) {
      throw new ApiError(httpStatus.BAD_REQUEST, ERROR_MESSAGES.USER_GOAL.ALREADY_EXISTS);
    }
    throw error;
  }
});

/**
 * Update current user's goal. At least one of targetWaterMl or targetCalories required.
 */
const updateGoal = catchAsync(async (req: Request, res: Response) => {
  const user = (req as AuthenticatedRequest).user;
  const { targetWaterMl, targetCalories } = req.body;
  const goal = await userGoalService.update(user.id, {
    ...(targetWaterMl !== undefined && { targetWaterMl }),
    ...(targetCalories !== undefined && { targetCalories }),
  });
  return response(res, httpStatus.OK, SUCCESS_MESSAGES.USER_GOAL.UPDATE_SUCCESS, {
    goal,
  });
});

export default {
  getGoal,
  createGoal,
  updateGoal,
};
