import ApiError from "@/utils/apiError";
import { UserGoalModel } from "@/models";
import type { IUserGoal } from "@/models";

export interface CreateUserGoalInput {
  targetWaterMl?: number;
  targetCalories?: number;
}

export interface UpdateUserGoalInput {
  targetWaterMl?: number;
  targetCalories?: number;
}

/**
 * UserGoal Service
 * One row per user; create once, then only update. No delete.
 */
class UserGoalService {
  /**
   * Find the goal for a user (non-deleted). Returns null if not found.
   */
  async findOneByUserId(userId: string): Promise<IUserGoal | null> {
    const goal = await UserGoalModel.findOne({
      userId,
      deletedAt: null,
      isDeleted: false,
    }).exec();
    return goal ?? null;
  }

  /**
   * Create a goal for a user. Fails if one already exists.
   */
  async create(userId: string, data: CreateUserGoalInput): Promise<IUserGoal> {
    const existing = await this.findOneByUserId(userId);
    if (existing) {
      throw new ApiError(400, "Goal already exists for this user; use PATCH to update");
    }
    const [goal] = await UserGoalModel.create([
      {
        userId,
        targetWaterMl: data.targetWaterMl ?? 0,
        targetCalories: data.targetCalories ?? 0,
      },
    ]);
    return goal;
  }

  /**
   * Update the goal for a user. Only updates provided fields.
   */
  async update(userId: string, data: UpdateUserGoalInput): Promise<IUserGoal> {
    const goal = await UserGoalModel.findOneAndUpdate(
      { userId, deletedAt: null, isDeleted: false },
      { $set: data },
      { new: true, runValidators: true }
    ).exec();

    if (!goal) {
      throw new ApiError(404, "User goal not found");
    }
    return goal;
  }
}

export default new UserGoalService();
