import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "@/utils/catchAsync";
import { response } from "@/utils/response";
import type { AuthenticatedRequest } from "@/types";
import analyticsService from "@/service/analytics.service";
import { SUCCESS_MESSAGES } from "@/constant";
import { getDateRangeFromQuery } from "@/utils/analytics";

/**
 * GET /user/analytics/calories-progress?range=1y&unit=month or ?startDate=&endDate=
 * Returns average calories per period (and overall average).
 */
const getCaloriesProgress = catchAsync(async (req: Request, res: Response) => {
  const user = (req as AuthenticatedRequest).user;
  const { start, end } = getDateRangeFromQuery(req.query as { startDate?: string; endDate?: string; range?: string });
  const unit = (req.query.unit as string) || "day";
  const range = (req.query.range as string) || "1m";

  const result = await analyticsService.getCaloriesProgress(user.id, range, unit, start, end);
  return response(res, httpStatus.OK, SUCCESS_MESSAGES.ANALYTICS.CALORIES_PROGRESS_SUCCESS, result);
});

/**
 * GET /user/analytics/water-progress?range=1y&unit=month or ?startDate=&endDate=
 * Returns average water (ml) per period (and overall average).
 */
const getWaterProgress = catchAsync(async (req: Request, res: Response) => {
  const user = (req as AuthenticatedRequest).user;
  const { start, end } = getDateRangeFromQuery(req.query as { startDate?: string; endDate?: string; range?: string });
  const unit = (req.query.unit as string) || "day";
  const range = (req.query.range as string) || "1m";

  const result = await analyticsService.getWaterProgress(user.id, range, unit, start, end);
  return response(res, httpStatus.OK, SUCCESS_MESSAGES.ANALYTICS.WATER_PROGRESS_SUCCESS, result);
});

/**
 * GET /user/analytics/goal-achievement-trend?range=1m&unit=day or ?startDate=&endDate=
 * Returns per-period goal achievement % (calories and water) for chart.
 */
const getGoalAchievementTrend = catchAsync(async (req: Request, res: Response) => {
  const user = (req as AuthenticatedRequest).user;
  const { start, end } = getDateRangeFromQuery(req.query as { startDate?: string; endDate?: string; range?: string });
  const unit = (req.query.unit as string) || "day";
  const range = (req.query.range as string) || "1m";

  const result = await analyticsService.getGoalAchievementTrend(user.id, range, unit, start, end);
  return response(
    res,
    httpStatus.OK,
    SUCCESS_MESSAGES.ANALYTICS.GOAL_ACHIEVEMENT_TREND_SUCCESS,
    result
  );
});

/**
 * GET /user/analytics/hydration-insights?range=1m or ?startDate=&endDate=
 * Returns day streak, goals met, daily avg (ml + L), best day (ml + L), targetWaterMl.
 */
const getHydrationInsights = catchAsync(async (req: Request, res: Response) => {
  const user = (req as AuthenticatedRequest).user;
  const { start, end } = getDateRangeFromQuery(req.query as { startDate?: string; endDate?: string; range?: string });

  const result = await analyticsService.getHydrationInsights(user.id, start, end);
  return response(res, httpStatus.OK, SUCCESS_MESSAGES.ANALYTICS.HYDRATION_INSIGHTS_SUCCESS, result);
});

/**
 * GET /user/analytics/calories-over-time
 * Query: EITHER startDate+endDate OR range (with optional unit). Not both.
 * Returns calories over time (chart), total calories, meals logged, avg calories per meal.
 */
const getCaloriesOverTime = catchAsync(async (req: Request, res: Response) => {
  const user = (req as AuthenticatedRequest).user;
  const query = req.query as { startDate?: string; endDate?: string; range?: string; unit?: string };
  const { start, end } = getDateRangeFromQuery(query);
  const unit = query.unit ?? "day";

  const result = await analyticsService.getCaloriesOverTime(user.id, start, end, unit);
  return response(res, httpStatus.OK, SUCCESS_MESSAGES.ANALYTICS.CALORIES_OVER_TIME_SUCCESS, result);
});

/**
 * GET /user/analytics/water-over-time
 * Query: EITHER startDate+endDate OR range (with optional unit). Not both.
 * Returns water over time (chart), total water ml, logs logged, avg water per log.
 */
const getWaterOverTime = catchAsync(async (req: Request, res: Response) => {
  const user = (req as AuthenticatedRequest).user;
  const query = req.query as { startDate?: string; endDate?: string; range?: string; unit?: string };
  const { start, end } = getDateRangeFromQuery(query);
  const unit = query.unit ?? "day";

  const result = await analyticsService.getWaterOverTime(user.id, start, end, unit);
  return response(res, httpStatus.OK, SUCCESS_MESSAGES.ANALYTICS.WATER_OVER_TIME_SUCCESS, result);
});

export default {
  getCaloriesProgress,
  getWaterProgress,
  getGoalAchievementTrend,
  getHydrationInsights,
  getCaloriesOverTime,
  getWaterOverTime,
};
