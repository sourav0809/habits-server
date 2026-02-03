import { Request, Response } from "express";
import httpStatus from "http-status";
import mongoose from "mongoose";
import catchAsync from "@/utils/catchAsync";
import { response } from "@/utils/response";
import type { AuthenticatedRequest } from "@/types";
import waterConsumptionService from "@/service/waterConsumption.service";
import userActivityService from "@/service/userActivity.service";
import { SUCCESS_MESSAGES } from "@/constant";
import ERROR_MESSAGES from "@/constant/errorMessages";
import ApiError from "@/utils/apiError";
import { getEndOfDayAsDate, getStartOfDayAsDate } from "@/utils/date";

/**
 * Get paginated water intake logs for the authenticated user in a date range.
 * Query: startDate, endDate (optional; default today), page (default 1), limit (default 20, max 100).
 * Summary (totalEntries, totalWaterMl, averagePerLog) is for the entire date range; rows are paginated.
 */
const getWaterConsumptions = catchAsync(async (req: Request, res: Response) => {
  const user = (req as AuthenticatedRequest).user;
  const { startDate: startDateQuery, endDate: endDateQuery, page: pageQuery, limit: limitQuery } = req.query;


  const start = startDateQuery
    ? getStartOfDayAsDate(startDateQuery as string)
    : getStartOfDayAsDate();

  const end = endDateQuery
    ? getEndOfDayAsDate(endDateQuery as string)
    : getEndOfDayAsDate();


  const page = Math.max(1, parseInt(String(pageQuery || 1), 10));
  const limit = Math.min(100, Math.max(1, parseInt(String(limitQuery || 20), 10)));
  const { logs, totalEntries, totalWaterMl, averagePerLog } =
    await waterConsumptionService.getPaginatedWithSummary(user.id, start, end, page, limit);

  const totalPages = Math.ceil(totalEntries / limit);

  return response(res, httpStatus.OK, SUCCESS_MESSAGES.WATER_CONSUMPTION.LIST_SUCCESS, {
    logs: logs,
    pagination: {
      page,
      limit,
      totalEntries,
      totalPages,
    },
    summary: {
      totalWaterMl,
      averagePerLog,
    },
  });
});

/**
 * Get one water intake log by id for the authenticated user.
 */
const getWaterConsumption = catchAsync(async (req: Request, res: Response) => {
  const user = (req as AuthenticatedRequest).user;
  const id = req.params.id as string;

  const log = await waterConsumptionService.findOne({ _id: id, userId: user.id });
  if (!log) {
    throw new ApiError(httpStatus.NOT_FOUND, ERROR_MESSAGES.WATER_CONSUMPTION.NOT_FOUND);
  }

  return response(res, httpStatus.OK, SUCCESS_MESSAGES.WATER_CONSUMPTION.LIST_SUCCESS, {
    log,
  });
});

/**
 * Add water intake. Creates a new log; updates userActivity.totalWaterMl for the day.
 */
const addWaterConsumption = catchAsync(async (req: Request, res: Response) => {
  const user = (req as AuthenticatedRequest).user;
  const { amount, dateAndTime } = req.body;

  const day = dateAndTime
    ? getStartOfDayAsDate(dateAndTime)
    : getStartOfDayAsDate();

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const activity = await userActivityService.getOrCreate(user.id, day, session);

    const log = await waterConsumptionService.create(
      {
        userId: user.id,
        userActivityId: activity._id.toString(),
        amountMl: amount,
        dateAndTime: dateAndTime,
      },
      session
    );

    await userActivityService.update(
      { _id: activity._id },
      { $inc: { totalWaterMl: amount } },
      session
    );

    await session.commitTransaction();

    return response(res, httpStatus.CREATED, SUCCESS_MESSAGES.WATER_CONSUMPTION.ADD_SUCCESS, {
      log,
    });
  } catch (error: unknown) {
    await session.abortTransaction();
    if (error instanceof ApiError) throw error;
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      `Failed to add water intake: ${error instanceof Error ? error.message : String(error)}`
    );
  } finally {
    session.endSession();
  }
});

/**
 * Update water intake (amount and/or date). If date changes to another day, moves entry and updates both activities' totalWaterMl.
 */
const updateWaterConsumption = catchAsync(async (req: Request, res: Response) => {
  const user = (req as AuthenticatedRequest).user;
  const id = req.params.id as string;
  const { amount, dateAndTime } = req.body;

  const log = await waterConsumptionService.findOne({ _id: id, userId: user.id });
  if (!log) {
    throw new ApiError(httpStatus.NOT_FOUND, ERROR_MESSAGES.WATER_CONSUMPTION.NOT_FOUND);
  }

  const effectiveAmount = amount ?? log.amountMl;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const updatePayload: Record<string, unknown> = { amountMl: effectiveAmount };

    if (dateAndTime !== undefined) {
      const newDay = getStartOfDayAsDate(dateAndTime);
      const oldDay = getStartOfDayAsDate(log.dateAndTime);

      if (newDay.getTime() !== oldDay.getTime()) {
        const oldActivity = await userActivityService.findOneById(
          user.id,
          log.userActivityId.toString()
        );
        if (oldActivity) {
          const oldActivityNewTotal = Math.max(
            0,
            (oldActivity.totalWaterMl ?? 0) - log.amountMl
          );
          await userActivityService.update(
            { _id: oldActivity._id },
            { $set: { totalWaterMl: oldActivityNewTotal } },
            session
          );
        }

        const newActivity = await userActivityService.getOrCreate(user.id, newDay, session);
        await userActivityService.update(
          { _id: newActivity._id },
          { $inc: { totalWaterMl: effectiveAmount } },
          session
        );

        updatePayload.userActivityId = newActivity._id;
        updatePayload.dateAndTime = newDay;
      } else {
        const activity = await userActivityService.findOneById(
          user.id,
          log.userActivityId.toString()
        );
        if (activity) {
          const delta = effectiveAmount - log.amountMl;
          const newActivityTotal = Math.max(0, (activity.totalWaterMl ?? 0) + delta);
          await userActivityService.update(
            { _id: activity._id },
            { $set: { totalWaterMl: newActivityTotal } },
            session
          );
        }
      }
    } else {
      const activity = await userActivityService.findOneById(
        user.id,
        log.userActivityId.toString()
      );
      if (activity) {
        const delta = effectiveAmount - log.amountMl;
        const newActivityTotal = Math.max(0, (activity.totalWaterMl ?? 0) + delta);
        await userActivityService.update(
          { _id: activity._id },
          { $set: { totalWaterMl: newActivityTotal } },
          session
        );
      }
    }

    await waterConsumptionService.update(
      { _id: id, userId: user.id },
      { $set: updatePayload },
      session
    );

    const updated = await waterConsumptionService.findOne({ _id: id, userId: user.id }, session);

    await session.commitTransaction();

    return response(res, httpStatus.OK, SUCCESS_MESSAGES.WATER_CONSUMPTION.UPDATE_SUCCESS, {
      log: updated ?? undefined,
    });
  } catch (error: unknown) {
    await session.abortTransaction();
    if (error instanceof ApiError) throw error;
    throw error;
  } finally {
    session.endSession();
  }
});

/**
 * Delete water intake (soft delete) and deduct amount from the day's activity totalWaterMl.
 */
const deleteWaterConsumption = catchAsync(async (req: Request, res: Response) => {
  const user = (req as AuthenticatedRequest).user;
  const id = req.params.id as string;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const log = await waterConsumptionService.findOne({ _id: id, userId: user.id }, session);
    if (!log) {
      throw new ApiError(httpStatus.NOT_FOUND, ERROR_MESSAGES.WATER_CONSUMPTION.NOT_FOUND);
    }

    const activity = await userActivityService.findOneById(
      user.id,
      log.userActivityId.toString()
    );
    if (activity) {
      const newTotal = Math.max(0, (activity.totalWaterMl ?? 0) - log.amountMl);
      await userActivityService.update(
        { _id: activity._id },
        { $set: { totalWaterMl: newTotal } },
        session
      );
    }

    await waterConsumptionService.delete(user.id, id, session);

    await session.commitTransaction();
    return response(res, httpStatus.OK, SUCCESS_MESSAGES.WATER_CONSUMPTION.DELETE_SUCCESS, {});
  } catch (error: unknown) {
    await session.abortTransaction();
    if (error instanceof ApiError) throw error;
    throw error;
  } finally {
    session.endSession();
  }
});

export default {
  getWaterConsumption,
  getWaterConsumptions,
  addWaterConsumption,
  updateWaterConsumption,
  deleteWaterConsumption,
};
