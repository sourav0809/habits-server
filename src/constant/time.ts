import { unitOfTime } from "moment-timezone";

export const timeUnits: Record<
  | 'DAY'
  | 'DAYS'
  | 'HOUR'
  | 'HOURS'
  | 'MILLISECOND'
  | 'MILLISECONDS'
  | 'MINUTE'
  | 'MINUTES'
  | 'MONTH'
  | 'MONTHS'
  | 'SECOND'
  | 'SECONDS'
  | 'YEAR'
  | 'YEARS',
  unitOfTime.DurationAs
> = {
  DAY: 'day',
  DAYS: 'days',
  HOUR: 'hour',
  HOURS: 'hours',
  MILLISECOND: 'millisecond',
  MILLISECONDS: 'milliseconds',
  MINUTE: 'minute',
  MINUTES: 'minutes',
  MONTH: 'month',
  MONTHS: 'months',
  SECOND: 'second',
  SECONDS: 'seconds',
  YEAR: 'year',
  YEARS: 'years'
};

export const timeFormats = {
  // Date formats
  DATE_DMY: 'DD-MM-YYYY', // 20-05-2025
  DATE_FULL: 'Do MMMM YYYY', // 20th May 2025
  DATE_SHORT: 'DD MMM YYYY', // 20 May 2025
  DATE_YMD: 'YYYY-MM-DD', // 2025-05-20

  // Date + Time formats
  DATETIME_24: 'DD-MM-YYYY HH:mm', // 20-05-2025 14:30
  DATETIME_24_WITH_SECONDS: 'YYYY-MM-DD HH:mm:ss', // 2025-05-20 14:30:45
  DATETIME_PRETTY: 'Do MMM YYYY, hh:mm A', // 20th May 2025, 02:30 PM

  // Unit-specific
  MONTH_NAME: 'MMMM', // May
  TIME_12: 'hh:mm A', // 02:30 PM
  // Time formats
  TIME_24: 'HH:mm', // 14:30

  TIME_24_WITH_SECONDS: 'HH:mm:ss', // 14:30:45
  YEAR: 'YYYY' // 2025
};
