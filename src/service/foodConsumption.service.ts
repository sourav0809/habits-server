import ApiError from "@/utils/apiError";
import mongoose from "mongoose";
import { FoodConsumptionModel } from "@/models";
import type { IFoodConsumption } from "@/models";
import type { FilterQuery } from "mongoose";

export interface CreateFoodConsumptionInput {
  userId: string;
  userActivityId: string;
  userFoodId: string;
  dateAndTime: Date;
  quantity: number;
  totalCalories: number;
}

/**
 * FoodConsumption Service
 * Handles operations for food_consumptions. Only creates/updates consumption rows.
 * Transaction and activity logic live in the controller.
 */
class FoodConsumptionService {
  /**
   * Find one food consumption by condition. Returns null if not found.
   */
  async findOne(
    condition: FilterQuery<IFoodConsumption>,
    session?: mongoose.mongo.ClientSession
  ): Promise<IFoodConsumption | null> {
    let query = FoodConsumptionModel.findOne({
      ...condition,
      deletedAt: null,
      isDeleted: false,
    });
    if (session) query = query.session(session);
    const res = await query.exec();
    return res ?? null;
  }

  /**
   * Create one food consumption row. Does not touch activity or run transaction.
   */
  async create(
    data: CreateFoodConsumptionInput,
    session?: mongoose.mongo.ClientSession
  ): Promise<IFoodConsumption> {
    const createOptions = session ? { session } : {};
    const [consumption] = await FoodConsumptionModel.create(
      [
        {
          userId: data.userId,
          userActivityId: data.userActivityId,
          userFoodId: data.userFoodId,
          dateAndTime: data.dateAndTime,
          quantity: data.quantity,
          totalCalories: data.totalCalories,
        },
      ],
      createOptions
    );
    return consumption;
  }

  /**
   * Update food consumptions matching the condition (non-deleted only).
   * update: MongoDB update object (e.g. { $inc: { quantity, totalCalories } } or { $set: { ... } }).
   * Returns the updated document when one is matched.
   */
  async update(
    condition: FilterQuery<IFoodConsumption>,
    update: Record<string, unknown>,
    session?: mongoose.mongo.ClientSession
  ): Promise<IFoodConsumption | null> {
    const options: { new: boolean; runValidators: boolean; session?: mongoose.mongo.ClientSession } = {
      new: true,
      runValidators: true,
    };
    if (session) options.session = session;

    const updated = await FoodConsumptionModel.findOneAndUpdate(
      { ...condition, deletedAt: null, isDeleted: false },
      update,
      options
    ).exec();
    return updated ?? null;
  }

  /**
   * Soft delete a food consumption (set deletedAt, isDeleted).
   * Does not touch activity; pass session from controller when using a transaction.
   */
  async delete(
    userId: string,
    consumptionId: string,
    session?: mongoose.mongo.ClientSession
  ): Promise<void> {
    const consumption = await this.findOne(
      { _id: consumptionId, userId },
      session
    );

    if (!consumption) {
      throw new ApiError(404, "Food consumption not found");
    }

    const updateOptions = session ? { session } : {};
    await FoodConsumptionModel.updateOne(
      { _id: consumptionId },
      { $set: { deletedAt: new Date(), isDeleted: true } },
      updateOptions
    ).exec();
  }

  /**
   * Count food consumptions matching the condition (non-deleted only).
   * Use from controller when needed (e.g. check if food is used in meals).
   */
  async count(condition: FilterQuery<IFoodConsumption>): Promise<number> {
    const res = await FoodConsumptionModel.countDocuments({
      ...condition,
      deletedAt: null,
      isDeleted: false,
    }).exec();
    return res ?? 0;
  }

  /**
   * Get all food consumptions matching the condition (non-deleted only).
   * Caller builds the condition; use in multiple places (e.g. controller passes date-range via activity ids).
   */
  async getAll(condition: FilterQuery<IFoodConsumption>): Promise<IFoodConsumption[]> {
    const consumptions = await FoodConsumptionModel.find({
      ...condition,
      deletedAt: null,
      isDeleted: false,
    })
      .populate("userFoodId", "name caloriesPerGram defaultQuantity")
      .sort({ createdAt: -1 })
      .exec();

    return consumptions;
  }
}

export default new FoodConsumptionService();
