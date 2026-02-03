import moment, { unitOfTime } from "moment-timezone";
import {
  DEFAULT_TIMEZONE,
  getEndOfDayAsDate,
  getStartOfDayAsDate,
} from "@/utils/date";

/** Unit for grouping: day | month | year. Pass-through for aggregation. */
export type UnitValue = "day" | "month" | "year";

/**
 * Parse range string into amount + moment unit.
 * Examples: "7d", "6day", "30 days", "1m", "6month", "12 months", "1y", "2 year", "3 years".
 * Supports: number + (d|day|days|m|month|months|y|year|years). Case-insensitive, optional space.
 */
function parseRangeToAmountAndUnit(range: string): { amount: number; momentUnit: unitOfTime.DurationAs } {
  const normalized = String(range).trim().toLowerCase();
  const match = normalized.match(/^(\d+)\s*(d|day|days|m|month|months|y|year|years)?$/);
  const amount = match ? Math.max(1, parseInt(match[1], 10)) : 1;
  const u = (match && match[2]) || "d";

  if (u === "d" || u === "day" || u === "days") return { amount, momentUnit: "days" };
  if (u === "m" || u === "month" || u === "months") return { amount, momentUnit: "months" };
  return { amount, momentUnit: "years" };
}

/**
 * Parse any range string (e.g. 6d, 6day, 6 month, 1y) into start and end dates (project TZ).
 * end = end of today; start = start of (today - range).
 */
export function parseRange(range: string): { start: Date; end: Date } {
  const end = getEndOfDayAsDate(new Date());
  const startMoment = moment().tz(DEFAULT_TIMEZONE).startOf("day");
  const { amount, momentUnit } = parseRangeToAmountAndUnit(range);
  startMoment.subtract(amount, momentUnit);
  const start = getStartOfDayAsDate(startMoment.toDate());
  return { start, end };
}

/**
 * Normalize unit string to UnitValue (day | month | year). Default "day" for unknown.
 */
export function normalizeUnit(unit: string): UnitValue {
  const u = String(unit).trim().toLowerCase();
  if (u === "month" || u === "months" || u === "m") return "month";
  if (u === "year" || u === "years" || u === "y") return "year";
  return "day";
}

/**
 * Get period key for grouping (day: "YYYY-MM-DD", month: "YYYY-MM", year: "YYYY").
 */
export function getPeriodKey(date: Date, unit: string): string {
  const u = normalizeUnit(unit);
  const m = moment(date).tz(DEFAULT_TIMEZONE);
  if (u === "day") return m.format("YYYY-MM-DD");
  if (u === "month") return m.format("YYYY-MM");
  return m.format("YYYY");
}

/**
 * List all period keys between start and end for the given unit (inclusive).
 */
export function getPeriodsBetween(start: Date, end: Date, unit: string): string[] {
  const u = normalizeUnit(unit);
  const periods: string[] = [];
  const current = moment(start).tz(DEFAULT_TIMEZONE);
  const endM = moment(end).tz(DEFAULT_TIMEZONE);
  const granularity: unitOfTime.StartOf = u === "day" ? "day" : u === "month" ? "month" : "year";

  while (current.isSameOrBefore(endM, granularity)) {
    periods.push(getPeriodKey(current.toDate(), u));
    if (u === "day") current.add(1, "day");
    else if (u === "month") current.add(1, "month");
    else current.add(1, "year");
  }

  return periods;
}
