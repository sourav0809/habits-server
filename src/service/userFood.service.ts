import ApiError from "@/utils/apiError";
import { UserFoodModel, UserActivityModel, FoodConsumptionModel } from "@/models";
import type { CreateUserFoodInput, IUserFood, UpdateUserFoodInput } from "@/models";
import type { FilterQuery } from "mongoose";

/**
 * UserFood Service
 * Handles operations for user-defined food (user_foods). Returns non-deleted only.
 */
class UserFoodService {
  /**
   * Get all foods for a user (no pagination). Excludes soft-deleted.
   */
  async getAll(condition: FilterQuery<IUserFood>): Promise<IUserFood[]> {
    const foods = await UserFoodModel.find({
      ...condition,
      deletedAt: null,
      isDeleted: false,
    })
      .sort({ createdAt: -1 })
      .exec();
    return foods;
  }

  /**
   * Create a new food for a user.
   */
  async create(data: CreateUserFoodInput): Promise<IUserFood> {
    try {
      return await UserFoodModel.create(data);
    } catch (error: unknown) {
      if (error instanceof ApiError) throw error;
      const message = error instanceof Error ? error.message : String(error);
      throw new ApiError(500, `Failed to create food: ${message}`);
    }
  }

  /**
   * Update a food by id. Only updates if it belongs to the user and is not soft-deleted.
   */
  async update(userId: string, foodId: string, data: UpdateUserFoodInput): Promise<IUserFood> {
    try {
      const food = await UserFoodModel.findOneAndUpdate(
        { _id: foodId, userId, deletedAt: null, isDeleted: false },
        { $set: data },
        { new: true, runValidators: true }
      ).exec();

      if (!food) {
        throw new ApiError(404, "Food not found");
      }
      return food;
    } catch (error: unknown) {
      if (error instanceof ApiError) throw error;
      const message = error instanceof Error ? error.message : String(error);
      throw new ApiError(500, `Failed to update food: ${message}`);
    }
  }

  /**
   * Soft delete a food by id. Sets deletedAt and isDeleted. Only affects if it belongs to the user and not already deleted.
   */
  async delete(userId: string, foodId: string): Promise<void> {
    const result = await UserFoodModel.updateOne(
      { _id: foodId, userId, deletedAt: null, isDeleted: false },
      { $set: { deletedAt: new Date(), isDeleted: true } }
    ).exec();

    if (result.matchedCount === 0) {
      throw new ApiError(404, "Food not found");
    }
  }

  /**
   * Find a single food by condition.
   */
  async findOne(condition: FilterQuery<IUserFood>): Promise<IUserFood | null> {
    const res = await UserFoodModel.findOne(condition).exec();
    return res ?? null;
  }
}

export default new UserFoodService();
