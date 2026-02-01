import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "@/utils/catchAsync";
import { response } from "@/utils/response";
import type { AuthenticatedRequest } from "@/types";
import userFoodService from "@/service/userFood.service";
import { SUCCESS_MESSAGES } from "@/constant";

/**
 * Get all foods for the authenticated user.
 */
const getFoods = catchAsync(async (req: Request, res: Response) => {
  const user = (req as AuthenticatedRequest).user;

  const condition = {
    userId: user.id,
  };

  const foods = await userFoodService.getFoods(condition);
  return response(res, httpStatus.OK, SUCCESS_MESSAGES.FOOD.LIST_SUCCESS, {
    foods,
  });
});


/**
 * Add a new food for the authenticated user.
 */
const addAFood = catchAsync(async (req: Request, res: Response) => {
  const user = (req as AuthenticatedRequest).user;
  const data = {
    ...req.body,
    userId: user.id,
  };
  const food = await userFoodService.createFood(data);
  return response(res, httpStatus.CREATED, SUCCESS_MESSAGES.FOOD.ADD_SUCCESS, {
    food,
  });
});

/**
 * Update a food for the authenticated user.
 */
const updateFood = catchAsync(async (req: Request, res: Response) => {
  const user = (req as AuthenticatedRequest).user;
  const id = req.params.id as string;
  const food = await userFoodService.updateFood(user.id, id, req.body);
  return response(res, httpStatus.OK, SUCCESS_MESSAGES.FOOD.UPDATE_SUCCESS, {
    food,
  });
});

/**
 * Soft delete a food for the authenticated user.
 */
const deleteFood = catchAsync(async (req: Request, res: Response) => {
  const user = (req as AuthenticatedRequest).user;
  const id = req.params.id as string;
  await userFoodService.deleteFood(user.id, id);
  return response(res, httpStatus.OK, SUCCESS_MESSAGES.FOOD.DELETE_SUCCESS, {});
});

export default {
  getFoods,
  addAFood,
  updateFood,
  deleteFood,
};
