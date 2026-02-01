import { Request, Response } from "express";
import httpStatus from "http-status";
import mongoose from "mongoose";
import catchAsync from "@/utils/catchAsync";
import { response } from "@/utils/response";
import type { AuthenticatedRequest } from "@/types";
import foodConsumptionService from "@/service/foodConsumption.service";
import userActivityService from "@/service/userActivity.service";
import userFoodService from "@/service/userFood.service";
import { SUCCESS_MESSAGES } from "@/constant";
import ERROR_MESSAGES from "@/constant/errorMessages";
import ApiError from "@/utils/apiError";
import { startOfDayUTC } from "@/service/userActivity.service";

/**
 * Get all food consumptions for the authenticated user in a date range.
 * Query: startDate, endDate (optional; default to today).
 */
const getFoodConsumptions = catchAsync(async (req: Request, res: Response) => {
  const user = (req as AuthenticatedRequest).user;
  const { startDate: startDateQuery, endDate: endDateQuery } = req.query;

  const today = startOfDayUTC(new Date());
  const start = startDateQuery ? startOfDayUTC(new Date(startDateQuery as string)) : today;
  const end = endDateQuery ? startOfDayUTC(new Date(endDateQuery as string)) : today;

  const condition = {
    userId: user.id,
    date: { $gte: start, $lte: end },
  };

  const consumptions = await foodConsumptionService.getAll(condition);

  return response(res, httpStatus.OK, SUCCESS_MESSAGES.FOOD_CONSUMPTION.LIST_SUCCESS, {
    consumptions,
  });
});

/**
 * Get one food consumption by id for the authenticated user.
 */
const getFoodConsumption = catchAsync(async (req: Request, res: Response) => {
  const user = (req as AuthenticatedRequest).user;
  const id = req.params.id as string;

  const condition = {
    _id: id,
    userId: user.id
  }

  const consumption = await foodConsumptionService.findOne(condition);
  if (!consumption) {
    throw new ApiError(httpStatus.NOT_FOUND, ERROR_MESSAGES.FOOD_CONSUMPTION.NOT_FOUND);
  }

  return response(res, httpStatus.OK, SUCCESS_MESSAGES.FOOD_CONSUMPTION.LIST_SUCCESS, {
    consumption,
  });
});

/**
 * Add a food consumption (log food for a day).
 * Controller: get/create user activity, then create or update consumption (same date + same food = update row). Transaction here.
 */
const addFoodConsumption = catchAsync(async (req: Request, res: Response) => {
  const user = (req as AuthenticatedRequest).user;
  const { userFoodId, quantity, date } = req.body;

  const day = date ? startOfDayUTC(new Date(date)) : startOfDayUTC(new Date());

  const userFood = await userFoodService.findOne({
    _id: userFoodId,
    userId: user.id,
    deletedAt: null,
    isDeleted: false,
  });
  if (!userFood) {
    throw new ApiError(httpStatus.NOT_FOUND, ERROR_MESSAGES.FOOD.NOT_FOUND);
  }

  const totalCalories =
    Math.round((userFood.caloriesPerGram ?? 0) * quantity * 100) / 100;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const activity = await userActivityService.getOrCreate(user.id, day, session);

    const existing = await foodConsumptionService.findOne(
      {
        userActivityId: activity._id,
        userFoodId,
      },
      session
    );

    let consumption;

    if (existing) {
      consumption = await foodConsumptionService.update(
        { userActivityId: activity._id, userFoodId },
        { $inc: { quantity, totalCalories } },
        session
      );
      await userActivityService.update(
        { _id: activity._id },
        { $inc: { totalCalories } },
        session
      );
    } else {
      consumption = await foodConsumptionService.create(
        {
          userId: activity.userId.toString(),
          userActivityId: activity._id.toString(),
          userFoodId,
          date: activity.date,
          quantity,
          totalCalories,
        },
        session
      );
      await userActivityService.update(
        { _id: activity._id },
        { $inc: { totalCalories } },
        session
      );
    }

    await session.commitTransaction();

    return response(res, httpStatus.CREATED, SUCCESS_MESSAGES.FOOD_CONSUMPTION.ADD_SUCCESS, {
      consumption: consumption ?? undefined,
    });
  } catch (error: unknown) {
    await session.abortTransaction();
    if (error instanceof ApiError) throw error;
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      `Failed to add food consumption: ${error instanceof Error ? error.message : String(error)}`
    );
  } finally {
    session.endSession();
  }
});

/**
 * Delete a food consumption (soft delete) and deduct calories from the day's activity.
 * Transaction in controller: get consumption, deduct activity calories, then soft delete.
 */
const deleteFoodConsumption = catchAsync(async (req: Request, res: Response) => {
  const user = (req as AuthenticatedRequest).user;
  const id = req.params.id as string;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const consumption = await foodConsumptionService.findOne(
      { _id: id, userId: user.id },
      session
    );
    if (!consumption) {
      throw new ApiError(httpStatus.NOT_FOUND, ERROR_MESSAGES.FOOD_CONSUMPTION.NOT_FOUND);
    }

    const activity = await userActivityService.findOneById(
      user.id,
      consumption.userActivityId.toString()
    );
    if (!activity) {
      throw new ApiError(httpStatus.NOT_FOUND, ERROR_MESSAGES.FOOD_CONSUMPTION.NOT_FOUND);
    }

    const caloriesToDeduct = consumption.totalCalories ?? 0;
    const newTotal = Math.max(0, (activity.totalCalories ?? 0) - caloriesToDeduct);
    await userActivityService.update(
      { _id: activity._id },
      { $set: { totalCalories: newTotal } },
      session
    );

    await foodConsumptionService.delete(user.id, id, session);

    await session.commitTransaction();
    return response(res, httpStatus.OK, SUCCESS_MESSAGES.FOOD_CONSUMPTION.DELETE_SUCCESS, {});
  } catch (error: unknown) {
    await session.abortTransaction();
    if (error instanceof ApiError) throw error;
    throw error;
  } finally {
    session.endSession();
  }
});

export default {
  getFoodConsumption,
  getFoodConsumptions,
  addFoodConsumption,
  deleteFoodConsumption,
};
