import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "@/utils/catchAsync";
import { response } from "@/utils/response";
import type { AuthenticatedRequest } from "@/types";
import analyticsService from "@/service/analytics.service";
import { SUCCESS_MESSAGES } from "@/constant";

/**
 * GET /user/analytics/calories-progress?range=1y&unit=month
 * Returns average calories per period (and overall average).
 */
const getCaloriesProgress = catchAsync(async (req: Request, res: Response) => {
  const user = (req as AuthenticatedRequest).user;
  const range = (req.query.range as string) || "1m";
  const unit = (req.query.unit as string) || "day";

  const result = await analyticsService.getCaloriesProgress(user.id, range, unit);
  return response(res, httpStatus.OK, SUCCESS_MESSAGES.ANALYTICS.CALORIES_PROGRESS_SUCCESS, result);
});

/**
 * GET /user/analytics/water-progress?range=1y&unit=month
 * Returns average water (ml) per period (and overall average).
 */
const getWaterProgress = catchAsync(async (req: Request, res: Response) => {
  const user = (req as AuthenticatedRequest).user;
  const range = (req.query.range as string) || "1m";
  const unit = (req.query.unit as string) || "day";

  const result = await analyticsService.getWaterProgress(user.id, range, unit);
  return response(res, httpStatus.OK, SUCCESS_MESSAGES.ANALYTICS.WATER_PROGRESS_SUCCESS, result);
});

/**
 * GET /user/analytics/goal-achievement-trend?range=1m&unit=day
 * Returns per-period goal achievement % (calories and water) for chart.
 */
const getGoalAchievementTrend = catchAsync(async (req: Request, res: Response) => {
  const user = (req as AuthenticatedRequest).user;
  const range = (req.query.range as string) || "1m";
  const unit = (req.query.unit as string) || "day";

  const result = await analyticsService.getGoalAchievementTrend(user.id, range, unit);
  return response(
    res,
    httpStatus.OK,
    SUCCESS_MESSAGES.ANALYTICS.GOAL_ACHIEVEMENT_TREND_SUCCESS,
    result
  );
});

export default {
  getCaloriesProgress,
  getWaterProgress,
  getGoalAchievementTrend,
};
