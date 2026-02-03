import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "@/utils/catchAsync";
import { response } from "@/utils/response";
import type { AuthenticatedRequest } from "@/types";
import userActivityService from "@/service/userActivity.service";
import { getEndOfDayAsDate, getStartOfDayAsDate } from "@/utils/date";
import { SUCCESS_MESSAGES } from "@/constant";

const getTodaysActivity = catchAsync(async (req: Request, res: Response) => {
  const user = (req as AuthenticatedRequest).user;


  const condition = {
    userId: user.id,
    date: { $gte: getStartOfDayAsDate(), $lte: getEndOfDayAsDate() },
  };

  const activities = await userActivityService.getUserActivity(condition);

  return response(res, httpStatus.OK, SUCCESS_MESSAGES.USER_ACTIVITY.GET_TODAY_ACTIVITIES_SUCCESS, {
    activities,
  });
});

export default {
  getTodaysActivity,
};