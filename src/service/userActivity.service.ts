import { UserActivityModel } from "@/models";
import type { IUserActivity } from "@/models";
import { getStartOfDayAsDate } from "@/utils/date";
import mongoose from "mongoose";
import type { FilterQuery } from "mongoose";



/**
 * UserActivity Service
 * Handles operations for user_activities (daily activity summary). Used with sessions for transactions.
 */
class UserActivityService {
  /**
   * Get or create a user activity for the given userId and date (normalized to start of day in project timezone).
   */
  async getOrCreate(
    userId: string,
    date: Date,
    session?: mongoose.mongo.ClientSession
  ): Promise<IUserActivity> {
    const day = getStartOfDayAsDate(date);

    let query = UserActivityModel.findOne({
      userId,
      date: day,
      deletedAt: null,
      isDeleted: false,
    });
    if (session) query = query.session(session);

    let activity = await query.exec();

    if (!activity) {
      const createOptions = session ? { session } : {};
      const [created] = await UserActivityModel.create(
        [
          {
            userId,
            date: day,
            totalCalories: 0,
            totalWaterMl: 0,
          },
        ],
        createOptions
      );
      activity = created;
    }

    return activity;
  }

  /**
   * Update activities matching the condition (non-deleted only).
   * update: MongoDB update object (e.g. { $inc: { totalCalories: amount } } or { $set: { totalCalories: value } }).
   * Returns the updated document when one is matched.
   */
  async update(
    condition: FilterQuery<IUserActivity>,
    update: Record<string, unknown>,
    session?: mongoose.mongo.ClientSession
  ): Promise<IUserActivity | null> {
    const options: { new: boolean; runValidators: boolean; session?: mongoose.mongo.ClientSession } = {
      new: true,
      runValidators: true,
    };
    if (session) options.session = session;

    const updated = await UserActivityModel.findOneAndUpdate(
      { ...condition, deletedAt: null, isDeleted: false },
      update,
      options
    ).exec();
    return updated ?? null;
  }

  /**
   * Find one activity by id and userId (non-deleted). Returns null if not found.
   */
  async findOneById(
    userId: string,
    activityId: string
  ): Promise<IUserActivity | null> {
    const activity = await UserActivityModel.findOne({
      _id: activityId,
      userId,
      deletedAt: null,
      isDeleted: false,
    }).exec();
    return activity ?? null;
  }

  /**
   * Get activities for a user in a date range (inclusive). Dates normalized to start of day in project timezone.
   */
  async getByDateRange(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<IUserActivity[]> {
    const start = getStartOfDayAsDate(startDate);
    const end = getStartOfDayAsDate(endDate);

    const activities = await UserActivityModel.find({
      userId,
      date: { $gte: start, $lte: end },
      deletedAt: null,
      isDeleted: false,
    })
      .sort({ date: 1 })
      .exec();

    return activities;
  }
}

export default new UserActivityService();
