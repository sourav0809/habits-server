import ApiError from "@/utils/apiError";
import { UserFoodModel } from "@/models";
import type { CreateUserFoodInput, IUserFood } from "@/models";
import type { FilterQuery } from "mongoose";

/**
 * UserFood Service
 * Handles operations for user-defined foods. Returns non-deleted foods only.
 */
class UserFoodService {
  /**
   * Get all foods for a user (no pagination). Excludes soft-deleted.
   */
  async getFoods(condition: FilterQuery<IUserFood>): Promise<IUserFood[]> {
    const foods = await UserFoodModel.find({
      ...condition,
      deletedAt: null,
    })
      .sort({ createdAt: -1 })
      .exec();
    return foods;
  }

  /**
   * Create a new food for a user.
   */
  async createFood(data: CreateUserFoodInput): Promise<IUserFood> {
    try {
      return await UserFoodModel.create(data);
    } catch (error: unknown) {
      if (error instanceof ApiError) throw error;
      const message = error instanceof Error ? error.message : String(error);
      throw new ApiError(500, `Failed to create food: ${message}`);
    }
  }
}

export default new UserFoodService();
