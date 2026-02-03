import ApiError from "@/utils/apiError";
import mongoose from "mongoose";
import { WaterConsumptionModel } from "@/models";
import type { IWaterConsumption } from "@/models";
import type { FilterQuery } from "mongoose";

export interface CreateWaterConsumptionInput {
  userId: string;
  userActivityId: string;
  amountMl: number;
  dateAndTime: Date;
}

/**
 * WaterConsumption Service
 * Handles operations for water_consumptions. Activity totalWaterMl updates are done in the controller.
 */
class WaterConsumptionService {
  async findOne(
    condition: FilterQuery<IWaterConsumption>,
    session?: mongoose.mongo.ClientSession
  ): Promise<IWaterConsumption | null> {
    let query = WaterConsumptionModel.findOne({
      ...condition,
      deletedAt: null,
      isDeleted: false,
    });
    if (session) query = query.session(session);
    const res = await query.exec();
    return res ?? null;
  }

  async create(
    data: CreateWaterConsumptionInput,
    session?: mongoose.mongo.ClientSession
  ): Promise<IWaterConsumption> {
    const createOptions = session ? { session } : {};
    const [log] = await WaterConsumptionModel.create(
      [
        {
          userId: data.userId,
          userActivityId: data.userActivityId,
          amountMl: data.amountMl,
          dateAndTime: data.dateAndTime,
        },
      ],
      createOptions
    );
    return log;
  }

  async update(
    condition: FilterQuery<IWaterConsumption>,
    update: Record<string, unknown>,
    session?: mongoose.mongo.ClientSession
  ): Promise<IWaterConsumption | null> {
    const options: { new: boolean; runValidators: boolean; session?: mongoose.mongo.ClientSession } = {
      new: true,
      runValidators: true,
    };
    if (session) options.session = session;

    const updated = await WaterConsumptionModel.findOneAndUpdate(
      { ...condition, deletedAt: null, isDeleted: false },
      update,
      options
    ).exec();
    return updated ?? null;
  }

  async delete(
    userId: string,
    consumptionId: string,
    session?: mongoose.mongo.ClientSession
  ): Promise<void> {
    const log = await this.findOne({ _id: consumptionId, userId }, session);
    if (!log) {
      throw new ApiError(404, "Water consumption not found");
    }
    const updateOptions = session ? { session } : {};
    await WaterConsumptionModel.updateOne(
      { _id: consumptionId },
      { $set: { deletedAt: new Date(), isDeleted: true } },
      updateOptions
    ).exec();
  }

  async getAll(condition: FilterQuery<IWaterConsumption>): Promise<IWaterConsumption[]> {
    const logs = await WaterConsumptionModel.find({
      ...condition,
      deletedAt: null,
      isDeleted: false,
    })
      .sort({ createdAt: -1 })
      .exec();
    return logs;
  }

  /**
   * Get paginated water logs in date range plus summary for the whole range.
   * Summary (totalEntries, totalWaterMl, averagePerLog) is for the entire date range, not just the page.
   */
  async getPaginatedWithSummary(
    userId: string,
    start: Date,
    end: Date,
    page: number,
    limit: number
  ): Promise<{
    logs: IWaterConsumption[];
    totalEntries: number;
    totalWaterMl: number;
    averagePerLog: number;
  }> {
    const match = {
      userId: new mongoose.Types.ObjectId(userId),
      dateAndTime: { $gte: start, $lte: end },
      deletedAt: null,
      isDeleted: false,
    };

    const skip = Math.max(0, (page - 1) * limit);
    const limitNum = Math.min(Math.max(1, limit), 100);

    const result = await WaterConsumptionModel.aggregate([
      { $match: match },
      {
        $facet: {
          summary: [
            {
              $group: {
                _id: null,
                totalEntries: { $sum: 1 },
                totalWaterMl: { $sum: "$amountMl" },
              },
            },
          ],
          logs: [
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: limitNum },
          ],
        },
      },
    ]).exec();

    const summary = result[0]?.summary?.[0];
    const totalEntries = summary?.totalEntries ?? 0;
    const totalWaterMl = summary?.totalWaterMl ?? 0;
    const averagePerLog = totalEntries > 0 ? Math.round((totalWaterMl / totalEntries) * 100) / 100 : 0;

    const logs = (result[0]?.logs ?? []) as IWaterConsumption[];

    return {
      logs,
      totalEntries,
      totalWaterMl,
      averagePerLog,
    };
  }
}

export default new WaterConsumptionService();
