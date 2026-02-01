import { FoodConsumptionModel } from "@/models";
import type { IFoodConsumption } from "@/models";
import type { FilterQuery } from "mongoose";

/**
 * FoodConsumption Service
 * Handles operations for food_consumptions (food consumed in activities/meals).
 */
class FoodConsumptionService {

  async findOne(condition: FilterQuery<IFoodConsumption>): Promise<IFoodConsumption | null> {
    const res = await FoodConsumptionModel.findOne(condition).exec();
    return res ?? null;
  }
}

export default new FoodConsumptionService();
