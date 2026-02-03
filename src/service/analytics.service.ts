import type { IUserActivity } from "@/models";
import userActivityService from "@/service/userActivity.service";
import userGoalService from "@/service/userGoal.service";
import {
  getPeriodKey,
  getPeriodsBetween,
  normalizeUnit,
  parseRange,
} from "@/utils/analytics";

export interface CaloriesProgressPoint {
  period: string;
  averageCalories: number;
  dayCount: number;
}

export interface WaterProgressPoint {
  period: string;
  averageWaterMl: number;
  dayCount: number;
}

export interface GoalAchievementPoint {
  period: string;
  caloriesPercent: number;
  waterPercent: number;
  totalCalories: number;
  totalWaterMl: number;
  dayCount: number;
}

/**
 * Analytics Service
 * Aggregates user_activities (and user_goals for trend) by range and unit.
 */
class AnalyticsService {
  /**
   * Calories progress: average totalCalories per period over the range.
   */
  async getCaloriesProgress(
    userId: string,
    range: string,
    unit: string
  ): Promise<{ dataPoints: CaloriesProgressPoint[]; summary: { overallAverage: number } }> {
    const { start, end } = parseRange(range);
    const activities = await userActivityService.getByDateRange(userId, start, end);
    const u = normalizeUnit(unit);
    const periodKeys = getPeriodsBetween(start, end, unit);

    const byPeriod = new Map<string, { sum: number; count: number }>();
    for (const key of periodKeys) byPeriod.set(key, { sum: 0, count: 0 });

    for (const a of activities as IUserActivity[]) {
      const key = getPeriodKey(a.date, unit);
      const cur = byPeriod.get(key);
      if (cur) {
        cur.sum += a.totalCalories ?? 0;
        cur.count += 1;
      }
    }

    let totalSum = 0;
    let totalDays = 0;
    const dataPoints: CaloriesProgressPoint[] = periodKeys.map((period) => {
      const cur = byPeriod.get(period)!;
      const averageCalories = cur.count > 0 ? Math.round((cur.sum / cur.count) * 100) / 100 : 0;
      totalSum += cur.sum;
      totalDays += cur.count;
      return { period, averageCalories, dayCount: cur.count };
    });

    const overallAverage =
      totalDays > 0 ? Math.round((totalSum / totalDays) * 100) / 100 : 0;
    return { dataPoints, summary: { overallAverage } };
  }

  /**
   * Water progress: average totalWaterMl per period over the range.
   */
  async getWaterProgress(
    userId: string,
    range: string,
    unit: string
  ): Promise<{ dataPoints: WaterProgressPoint[]; summary: { overallAverage: number } }> {
    const { start, end } = parseRange(range);
    const activities = await userActivityService.getByDateRange(userId, start, end);
    const periodKeys = getPeriodsBetween(start, end, unit);

    const byPeriod = new Map<string, { sum: number; count: number }>();
    for (const key of periodKeys) byPeriod.set(key, { sum: 0, count: 0 });

    for (const a of activities as IUserActivity[]) {
      const key = getPeriodKey(a.date, unit);
      const cur = byPeriod.get(key);
      if (cur) {
        cur.sum += a.totalWaterMl ?? 0;
        cur.count += 1;
      }
    }

    let totalSum = 0;
    let totalDays = 0;
    const dataPoints: WaterProgressPoint[] = periodKeys.map((period) => {
      const cur = byPeriod.get(period)!;
      const averageWaterMl = cur.count > 0 ? Math.round((cur.sum / cur.count) * 100) / 100 : 0;
      totalSum += cur.sum;
      totalDays += cur.count;
      return { period, averageWaterMl, dayCount: cur.count };
    });

    const overallAverage =
      totalDays > 0 ? Math.round((totalSum / totalDays) * 100) / 100 : 0;
    return { dataPoints, summary: { overallAverage } };
  }

  /**
   * Goal achievement trend: per-period percentage of goal achieved (calories and water).
   * Uses user_goals.targetCalories and targetWaterMl; if no goal, percentages are 0.
   */
  async getGoalAchievementTrend(
    userId: string,
    range: string,
    unit: string
  ): Promise<{ dataPoints: GoalAchievementPoint[] }> {
    const { start, end } = parseRange(range);
    const [activities, goal] = await Promise.all([
      userActivityService.getByDateRange(userId, start, end),
      userGoalService.findOneByUserId(userId),
    ]);
    const periodKeys = getPeriodsBetween(start, end, unit);

    const targetCalories = goal && (goal.targetCalories ?? 0) > 0 ? goal.targetCalories! : 0;
    const targetWaterMl = goal && (goal.targetWaterMl ?? 0) > 0 ? goal.targetWaterMl! : 0;

    const byPeriod = new Map<
      string,
      { sumCalories: number; sumWaterMl: number; count: number }
    >();
    for (const key of periodKeys)
      byPeriod.set(key, { sumCalories: 0, sumWaterMl: 0, count: 0 });

    for (const a of activities as IUserActivity[]) {
      const key = getPeriodKey(a.date, unit);
      const cur = byPeriod.get(key);
      if (cur) {
        cur.sumCalories += a.totalCalories ?? 0;
        cur.sumWaterMl += a.totalWaterMl ?? 0;
        cur.count += 1;
      }
    }

    const dataPoints: GoalAchievementPoint[] = periodKeys.map((period) => {
      const cur = byPeriod.get(period)!;
      const dayCount = cur.count;
      const totalCalories = cur.sumCalories;
      const totalWaterMl = cur.sumWaterMl;
      const caloriesPercent =
        targetCalories > 0 && dayCount > 0
          ? Math.round((totalCalories / (targetCalories * dayCount)) * 10000) / 100
          : 0;
      const waterPercent =
        targetWaterMl > 0 && dayCount > 0
          ? Math.round((totalWaterMl / (targetWaterMl * dayCount)) * 10000) / 100
          : 0;
      return {
        period,
        caloriesPercent,
        waterPercent,
        totalCalories,
        totalWaterMl,
        dayCount,
      };
    });

    return { dataPoints };
  }
}

export default new AnalyticsService();
