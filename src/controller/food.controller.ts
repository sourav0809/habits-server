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
 * Create a new food for the authenticated user.
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

export default {
  getFoods,
  addAFood,
};
