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
import { getEndOfDayAsDate, getStartOfDayAsDate } from "@/utils/date";

// Runs once when this file is first imported (at server startup)
console.log("[foodConsumption.controller] loaded");

/**
 * Get paginated food consumptions for the authenticated user in a date range.
 * Query: startDate, endDate (optional; default today), page (default 1), limit (default 20, max 100).
 */
const getFoodConsumptions = catchAsync(async (req: Request, res: Response) => {
  const user = (req as AuthenticatedRequest).user;
  const { startDate: startDateQuery, endDate: endDateQuery, page: pageQuery, limit: limitQuery } = req.query;

  const today = getStartOfDayAsDate();
  const start = startDateQuery ? getStartOfDayAsDate(startDateQuery as string) : today;
  const end = endDateQuery ? getEndOfDayAsDate(endDateQuery as string) : getEndOfDayAsDate();
  const page = Math.max(1, parseInt(String(pageQuery || 1), 10));
  const limit = Math.min(100, Math.max(1, parseInt(String(limitQuery || 20), 10)));

  const { consumptions, totalEntries } =
    await foodConsumptionService.getPaginatedWithSummary(user.id, start, end, page, limit);

  const totalPages = Math.ceil(totalEntries / limit);

  const consumptionsWithId = consumptions.map((doc) => {
    const d = doc as unknown as Record<string, unknown>;
    const { _id, ...rest } = d;
    return {
      ...rest,
      id: (typeof _id === "object" && _id !== null && "toString" in _id
        ? (_id as { toString: () => string }).toString()
        : _id) ?? undefined,
    };
  });

  return response(res, httpStatus.OK, SUCCESS_MESSAGES.FOOD_CONSUMPTION.LIST_SUCCESS, {
    consumptions: consumptionsWithId,
    pagination: {
      page,
      limit,
      totalEntries,
      totalPages,
    },
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
  console.log("[addFoodConsumption] called");
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
        dateAndTime: dateAndTime,
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
 * Update a food consumption (quantity, dateAndTime, userFoodId — any combination).
 * Recalculates totalCalories when quantity or userFoodId changes. If dateAndTime changes to another day,
 * moves the entry to that day's activity (deduct from old activity, add to new).
 */
const updateFoodConsumption = catchAsync(async (req: Request, res: Response) => {
  const user = (req as AuthenticatedRequest).user;
  const id = req.params.id as string;
  const { quantity: bodyQuantity, dateAndTime: bodyDateAndTime, userFoodId: bodyUserFoodId } = req.body;

  const consumption = await foodConsumptionService.findOne(
    { _id: id, userId: user.id }
  );
  if (!consumption) {
    throw new ApiError(httpStatus.NOT_FOUND, ERROR_MESSAGES.FOOD_CONSUMPTION.NOT_FOUND);
  }

  const effectiveQuantity = bodyQuantity ?? consumption.quantity;
  const effectiveUserFoodId = bodyUserFoodId ?? consumption.userFoodId;

  const userFood = await userFoodService.findOne({
    _id: effectiveUserFoodId,
    userId: user.id,
    deletedAt: null,
    isDeleted: false,
  });
  if (!userFood) {
    throw new ApiError(httpStatus.NOT_FOUND, ERROR_MESSAGES.FOOD.NOT_FOUND);
  }

  const newTotalCalories =
    Math.round((userFood.caloriesPerGram ?? 0) * effectiveQuantity * 100) / 100;
  const oldTotalCalories = consumption.totalCalories ?? 0;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const updatePayload: Record<string, unknown> = {
      quantity: effectiveQuantity,
      totalCalories: newTotalCalories,
    };
    if (bodyUserFoodId !== undefined) updatePayload.userFoodId = bodyUserFoodId;

    if (bodyDateAndTime !== undefined) {
      const newDay = getStartOfDayAsDate();
      const oldDay = getStartOfDayAsDate(consumption.dateAndTime);

      if (newDay.getTime() !== oldDay.getTime()) {
        // Move to another day: deduct from old activity, add to new activity
        const oldActivity = await userActivityService.findOneById(
          user.id,
          consumption.userActivityId.toString()
        );
        if (oldActivity) {
          const oldActivityNewTotal = Math.max(
            0,
            (oldActivity.totalCalories ?? 0) - oldTotalCalories
          );
          await userActivityService.update(
            { _id: oldActivity._id },
            { $set: { totalCalories: oldActivityNewTotal } },
            session
          );
        }

        const newActivity = await userActivityService.getOrCreate(user.id, newDay, session);
        await userActivityService.update(
          { _id: newActivity._id },
          { $inc: { totalCalories: newTotalCalories } },
          session
        );

        updatePayload.userActivityId = newActivity._id;
        updatePayload.dateAndTime = newDay;
      } else {
        // Same day: just adjust activity by calorie delta
        const activity = await userActivityService.findOneById(
          user.id,
          consumption.userActivityId.toString()
        );
        if (activity) {
          const delta = newTotalCalories - oldTotalCalories;
          const newActivityTotal = Math.max(0, (activity.totalCalories ?? 0) + delta);
          await userActivityService.update(
            { _id: activity._id },
            { $set: { totalCalories: newActivityTotal } },
            session
          );
        }
      }
    } else {
      // No date change: apply calorie delta to current activity
      const activity = await userActivityService.findOneById(
        user.id,
        consumption.userActivityId.toString()
      );
      if (activity) {
        const delta = newTotalCalories - oldTotalCalories;
        const newActivityTotal = Math.max(0, (activity.totalCalories ?? 0) + delta);
        await userActivityService.update(
          { _id: activity._id },
          { $set: { totalCalories: newActivityTotal } },
          session
        );
      }
    }

    await foodConsumptionService.update(
      { _id: id, userId: user.id },
      { $set: updatePayload },
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
