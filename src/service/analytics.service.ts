import moment from "moment-timezone";
import type { IUserActivity } from "@/models";
import userActivityService from "@/service/userActivity.service";
import userGoalService from "@/service/userGoal.service";
import foodConsumptionService from "@/service/foodConsumption.service";
import { DEFAULT_TIMEZONE } from "@/utils/date";
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

export interface HydrationInsights {
  dayStreak: number;
  goalsMet: number;
  dailyAvgMl: number;
  dailyAvgL: number;
  bestDayMl: number;
  bestDayL: number;
  targetWaterMl: number | null;
}

export interface CaloriesOverTimePoint {
  period: string;
  calories: number;
}

export interface CaloriesOverTimeResult {
  caloriesOverTime: CaloriesOverTimePoint[];
  calories: number;
  mealsLogged: number;
  avgCaloriesPerMeal: number;
}

/**
 * Analytics Service
 * Aggregates user_activities (and user_goals for trend) by range and unit.
 */
class AnalyticsService {
  /**
   * Calories progress: average totalCalories per period over the range.
   * When start/end are provided they override range.
   */
  async getCaloriesProgress(
    userId: string,
    range: string,
    unit: string,
    startOverride?: Date,
    endOverride?: Date
  ): Promise<{ dataPoints: CaloriesProgressPoint[]; summary: { overallAverage: number } }> {
    const { start, end } = startOverride != null && endOverride != null
      ? { start: startOverride, end: endOverride }
      : parseRange(range);
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
   * When start/end are provided they override range.
   */
  async getWaterProgress(
    userId: string,
    range: string,
    unit: string,
    startOverride?: Date,
    endOverride?: Date
  ): Promise<{ dataPoints: WaterProgressPoint[]; summary: { overallAverage: number } }> {
    const { start, end } = startOverride != null && endOverride != null
      ? { start: startOverride, end: endOverride }
      : parseRange(range);
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
   * When start/end are provided they override range.
   */
  async getGoalAchievementTrend(
    userId: string,
    range: string,
    unit: string,
    startOverride?: Date,
    endOverride?: Date
  ): Promise<{ dataPoints: GoalAchievementPoint[] }> {
    const { start, end } = startOverride != null && endOverride != null
      ? { start: startOverride, end: endOverride }
      : parseRange(range);
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

  /**
   * Hydration insights for the date range: day streak, goals met, daily avg, best day.
   * If user has a goal (targetWaterMl > 0), goalsMet and dayStreak are relative to that; otherwise goalsMet and dayStreak are 0.
   */
  async getHydrationInsights(
    userId: string,
    start: Date,
    end: Date
  ): Promise<HydrationInsights> {
    const [activities, goal] = await Promise.all([
      userActivityService.getByDateRange(userId, start, end),
      userGoalService.findOneByUserId(userId),
    ]);

    const targetWaterMl = goal && (goal.targetWaterMl ?? 0) > 0 ? goal.targetWaterMl! : 0;
    const byDay = new Map<string, number>();
    for (const a of activities as IUserActivity[]) {
      const key = moment(a.date).tz(DEFAULT_TIMEZONE).format("YYYY-MM-DD");
      byDay.set(key, a.totalWaterMl ?? 0);
    }

    let goalsMet = 0;
    if (targetWaterMl > 0) {
      for (const ml of byDay.values()) {
        if (ml >= targetWaterMl) goalsMet += 1;
      }
    }

    let dayStreak = 0;
    if (targetWaterMl > 0) {
      const endM = moment(end).tz(DEFAULT_TIMEZONE).startOf("day");
      let current = endM.clone();
      const startM = moment(start).tz(DEFAULT_TIMEZONE).startOf("day");
      while (current.isSameOrAfter(startM)) {
        const key = current.format("YYYY-MM-DD");
        const ml = byDay.get(key) ?? 0;
        if (ml >= targetWaterMl) {
          dayStreak += 1;
          current.subtract(1, "day");
        } else {
          break;
        }
      }
    }

    const totalWaterMl = Array.from(byDay.values()).reduce((s, v) => s + v, 0);
    const daysInRange = moment(end).tz(DEFAULT_TIMEZONE).startOf("day")
      .diff(moment(start).tz(DEFAULT_TIMEZONE).startOf("day"), "days") + 1;
    const dailyAvgMl = daysInRange > 0 ? Math.round((totalWaterMl / daysInRange) * 100) / 100 : 0;
    const dailyAvgL = Math.round((dailyAvgMl / 1000) * 100) / 100;

    const bestDayMl = byDay.size > 0 ? Math.max(...byDay.values()) : 0;
    const bestDayL = Math.round((bestDayMl / 1000) * 100) / 100;

    return {
      dayStreak,
      goalsMet,
      dailyAvgMl,
      dailyAvgL,
      bestDayMl,
      bestDayL,
      targetWaterMl: goal && (goal.targetWaterMl ?? 0) >= 0 ? goal.targetWaterMl! : null,
    };
  }

  /**
   * Calories over time: chart data (calories per period) plus total calories, meals logged, avg calories per meal.
   * Uses user_activities for chart and total; food_consumptions for meals count.
   */
  async getCaloriesOverTime(
    userId: string,
    start: Date,
    end: Date,
    unit: string
  ): Promise<CaloriesOverTimeResult> {
    const [activities, consumptions] = await Promise.all([
      userActivityService.getByDateRange(userId, start, end),
      foodConsumptionService.getAll({
        userId,
        dateAndTime: { $gte: start, $lte: end },
      }),
    ]);

    const periodKeys = getPeriodsBetween(start, end, unit);
    const byPeriod = new Map<string, number>();
    for (const key of periodKeys) byPeriod.set(key, 0);

    let totalCalories = 0;
    for (const a of activities as IUserActivity[]) {
      const key = getPeriodKey(a.date, unit);
      const cal = a.totalCalories ?? 0;
      totalCalories += cal;
      const cur = byPeriod.get(key);
      if (cur !== undefined) byPeriod.set(key, cur + cal);
    }

    const caloriesOverTime: CaloriesOverTimePoint[] = periodKeys.map((period) => ({
      period,
      calories: byPeriod.get(period) ?? 0,
    }));

    const mealsLogged = consumptions.length;
    const avgCaloriesPerMeal =
      mealsLogged > 0 ? Math.round((totalCalories / mealsLogged) * 100) / 100 : 0;

    return {
      caloriesOverTime,
      calories: Math.round(totalCalories * 100) / 100,
      mealsLogged,
      avgCaloriesPerMeal,
    };
  }
}

export default new AnalyticsService();
