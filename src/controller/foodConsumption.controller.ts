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
import { getStartOfDayAsDate } from "@/utils/date";

/**
 * Get all food consumptions for the authenticated user in a date range.
 * Query: startDate, endDate (optional; default to today).
 */
const getFoodConsumptions = catchAsync(async (req: Request, res: Response) => {
  const user = (req as AuthenticatedRequest).user;
  const { startDate: startDateQuery, endDate: endDateQuery } = req.query;

  const today = getStartOfDayAsDate(new Date());
  const start = startDateQuery ? getStartOfDayAsDate(new Date(startDateQuery as string)) : today;
  const end = endDateQuery ? getStartOfDayAsDate(new Date(endDateQuery as string)) : today;

  const condition = {
    userId: user.id,
    dateAndTime: { $gte: start, $lte: end },
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
 * Always creates a NEW row in food_consumptions — never finds/updates by userFoodId + date.
 * Same food can be added multiple times (e.g. 3x same item = 3 consumption rows).
 * userActivity: one row per user per day; multiple items same day = $inc totalCalories; different date = new activity row.
 * Transaction in controller.
 */
const addFoodConsumption = catchAsync(async (req: Request, res: Response) => {
  const user = (req as AuthenticatedRequest).user;
  const { userFoodId, quantity, dateAndTime } = req.body;

  const day = dateAndTime ? getStartOfDayAsDate(new Date(dateAndTime)) : getStartOfDayAsDate(new Date());

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

    const consumption = await foodConsumptionService.create(
      {
        userId: activity.userId.toString(),
        userActivityId: activity._id.toString(),
        userFoodId,
        dateAndTime,
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

    await session.commitTransaction();

    return response(res, httpStatus.CREATED, SUCCESS_MESSAGES.FOOD_CONSUMPTION.ADD_SUCCESS, {
      consumption,
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
 * Update a food consumption (quantity). Recalculates totalCalories and adjusts activity totalCalories.
 * Transaction in controller: get consumption, get food, recalc calories, update consumption, update activity.
 */
const updateFoodConsumption = catchAsync(async (req: Request, res: Response) => {
  const user = (req as AuthenticatedRequest).user;
  const id = req.params.id as string;
  const { quantity } = req.body;

  const consumption = await foodConsumptionService.findOne(
    { _id: id, userId: user.id }
  );
  if (!consumption) {
    throw new ApiError(httpStatus.NOT_FOUND, ERROR_MESSAGES.FOOD_CONSUMPTION.NOT_FOUND);
  }

  const userFood = await userFoodService.findOne({
    _id: consumption.userFoodId,
    userId: user.id,
    deletedAt: null,
    isDeleted: false,
  });
  if (!userFood) {
    throw new ApiError(httpStatus.NOT_FOUND, ERROR_MESSAGES.FOOD.NOT_FOUND);
  }

  const newTotalCalories =
    Math.round((userFood.caloriesPerGram ?? 0) * quantity * 100) / 100;
  const oldTotalCalories = consumption.totalCalories ?? 0;
  const delta = newTotalCalories - oldTotalCalories;

  const activity = await userActivityService.findOneById(
    user.id,
    consumption.userActivityId.toString()
  );
  if (!activity) {
    throw new ApiError(httpStatus.NOT_FOUND, ERROR_MESSAGES.FOOD_CONSUMPTION.NOT_FOUND);
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    await foodConsumptionService.update(
      { _id: id, userId: user.id },
      { $set: { quantity, totalCalories: newTotalCalories } },
      session
    );
    const newActivityTotal = Math.max(0, (activity.totalCalories ?? 0) + delta);
    await userActivityService.update(
      { _id: activity._id },
      { $set: { totalCalories: newActivityTotal } },
      session
    );

    const updated = await foodConsumptionService.findOne(
      { _id: id, userId: user.id },
      session
    );

    await session.commitTransaction();

    return response(res, httpStatus.OK, SUCCESS_MESSAGES.FOOD_CONSUMPTION.UPDATE_SUCCESS, {
      consumption: updated ?? undefined,
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
  updateFoodConsumption,
  deleteFoodConsumption,
};
