import moment, { Moment, unitOfTime } from 'moment-timezone';

import { timeFormats, timeUnits } from '@/constant';

export const DEFAULT_TIMEZONE = 'Asia/Kolkata';

type DateType = Date | Moment | string;

/**
 * Get the current date and time.
 *
 * @param {*} format - The format to use.
 * @returns {*} The current date and time.
 */
export const getCurrentDateAndTime = (format?: null | string): Date | Moment | string => {
  const currentMoment = moment().tz(DEFAULT_TIMEZONE);
  return format ? currentMoment.format(format) : currentMoment;
};

/**
 * Get the current date.
 *
 * @param {*} format - The format to use.
 * @returns {*} The current date.
 */
export const getCurrentDate = (format?: null | string): Moment | string => {
  const currentMoment = moment().tz(DEFAULT_TIMEZONE).startOf(timeUnits.DAY);
  return format ? currentMoment.format(format) : currentMoment;
};

/**
 * Format a time to a moment object.
 *
 * @param {*} date - The date to format.
 * @param {*} format - The format to use.
 * @param {*} timezone - The timezone to use.
 * @returns {*} The formatted time.
 */
export const formatTimeToMoment = (
  date: DateType,
  format?: string,
  timezone: string = DEFAULT_TIMEZONE
): Date | Moment | null | string => {
  if (!date) return null;
  if (format) {
    return moment(date).tz(timezone).format(format);
  }
  return moment(date).tz(timezone);
};

/**
 * Get the start date.
 *
 * @param {*} date - The date to format.
 * @param {*} timezone - The timezone to use.
 * @returns {*} The start date.
 */
export const getStartDate = (date?: DateType, timezone: string = DEFAULT_TIMEZONE): Moment => {
  if (date) {
    return moment(date).tz(timezone).startOf(timeUnits.DAY);
  }
  return moment().tz(timezone).startOf(timeUnits.DAY);
};

/**
 * Get the end date.
 *
 * @param {*} date - The date to format.
 * @param {*} timezone - The timezone to use.
 * @returns {*} The end date.
 */
export const getEndDate = (date?: DateType, timezone: string = DEFAULT_TIMEZONE): Moment => {
  if (date) {
    return moment(date).tz(timezone).endOf(timeUnits.DAY);
  }
  return moment().tz(timezone).endOf(timeUnits.DAY);
};

/**
 * Get start of day as a native Date (for DB queries, comparisons).
 * Uses project timezone (default Asia/Kolkata).
 */
export const getStartOfDayAsDate = (
  date?: DateType,
  timezone: string = DEFAULT_TIMEZONE
): Date => getStartDate(date, timezone).toDate();

/**
 * Get end of day as a native Date (for date-range queries).
 * Uses project timezone (default Asia/Kolkata).
 */
export const getEndOfDayAsDate = (
  date?: DateType,
  timezone: string = DEFAULT_TIMEZONE
): Date => getEndDate(date, timezone).toDate();

/**
 * Get the yesterday date.
 *
 * @param {*} toDate - Whether to return the end date.
 * @param {*} timezone - The timezone to use.
 * @returns {*} The yesterday date.
 */
export const getYesterday = (toDate: boolean, timezone: string = DEFAULT_TIMEZONE): Moment => {
  const currentMoment = moment().tz(timezone).subtract(1, timeUnits.DAY);
  return toDate ? currentMoment.endOf(timeUnits.DAY) : currentMoment;
};

/**
 * Get the tomorrow date.
 *
 * @param {*} toDate - Whether to return the end date.
 * @param {*} timezone - The timezone to use.
 * @returns {*} The tomorrow date.
 */
export const getTomorrow = (toDate?: boolean, timezone: string = DEFAULT_TIMEZONE): Moment => {
  const currentMoment = moment().tz(timezone).add(1, timeUnits.DAY);
  return toDate ? currentMoment.endOf(timeUnits.DAY) : currentMoment;
};

/**
 * Calculate the time difference between two dates.
 *
 * @param {*} date1 - The first date.
 * @param {*} primary - Whether to use the current date and time as the second date.
 * @param {*} unit - The unit of time to use.
 * @param {*} date2 - The second date.
 * @param {*} timezone - The timezone to use.
 * @returns {*} The time difference in the specified unit.
 */
export const calculateTimeDifference = (
  date1: DateType,
  unit: any = timeUnits.DAYS,
  primary?: boolean,
  date2?: DateType,
  timezone: string = DEFAULT_TIMEZONE
): number => {
  if (date2) {
    return moment(date1).diff(date2, unit);
  }
  if (primary) {
    return moment.tz(date1, timezone).diff(moment.tz(timezone), unit);
  }
  return moment.tz(timezone).diff(moment.tz(date1, timezone), unit);
};

/**
 * Check if a date is before another date.
 *
 * @param {*} date1 - The first date.
 * @param {*} primary - Whether to use the current date and time as the second date.
 * @param {*} unit - The unit of time to use.
 * @param {*} date2 - The second date.
 * @param {*} timezone - The timezone to use.
 * @returns {*} True if the first date is before the second date.
 */
export const checkIsBefore = (
  date1: DateType,
  unit: any = timeUnits.MINUTES,
  primary?: boolean,
  date2?: DateType,
  timezone: string = DEFAULT_TIMEZONE
): any => {
  if (date2) {
    return moment(date1).tz(timezone).isBefore(moment(date2).tz(timezone), unit);
  }
  if (primary) {
    return moment(date1).tz(timezone).isBefore(getCurrentDateAndTime(), unit);
  }
  return moment().tz(timezone).isBefore(date1, unit);
};

/**
 * Check if a date is the same or before another date.
 *
 * @param {*} date1 - The first date.
 * @param {*} primary - Whether to use the current date and time as the second date.
 * @param {*} unit - The unit of time to use.
 * @param {*} date2 - The second date.
 * @param {*} timezone - The timezone to use.
 * @returns {*} True if the first date is the same or before the second date.
 */
export const checkIsSameOrBefore = (
  date1: DateType,
  unit: unitOfTime.DurationAs = timeUnits.DAYS,
  primary?: boolean,
  date2?: DateType,
  timezone: string = DEFAULT_TIMEZONE
): boolean => {
  if (date2) {
    return moment(date1).tz(timezone).isSameOrBefore(moment(date2).tz(timezone), unit);
  }
  if (primary) {
    return moment(date1).tz(timezone).isSameOrBefore(getCurrentDateAndTime(), unit);
  }
  return moment().tz(timezone).isSameOrBefore(date1, unit);
};

/**
 * Check if a date is after another date.
 *
 * @param {*} date1 - The first date.
 * @param {*} primary - Whether to use the current date and time as the second date.
 * @param {*} unit - The unit of time to use.
 * @param {*} date2 - The second date.
 * @param {*} timezone - The timezone to use.
 * @returns {*} True if the first date is after the second date.
 */
export const checkIsAfter = (
  unit: unitOfTime.DurationAs = timeUnits.MINUTES,
  primary?: boolean,
  date1?: DateType,
  date2?: DateType,
  timezone: string = DEFAULT_TIMEZONE
): boolean => {
  date1 ??= getCurrentDateAndTime();
  if (date2) {
    return moment(date1).tz(timezone).isAfter(moment(date2).tz(timezone), unit);
  }
  if (primary) {
    return moment(date1).tz(timezone).isAfter(moment(), unit);
  }
  return moment().tz(timezone).isAfter(date1, unit);
};

/**
 * Check if a date is the same or after another date.
 *
 * @param {*} date1 - The first date.
 * @param {*} unit - The unit of time to use.
 * @param {*} date2 - The second date.
 * @param {*} timezone - The timezone to use.
 * @returns {*} True if the first date is the same or after the second date.
 */
export const checkIsSameOrAfter = (
  date1: DateType,
  unit: unitOfTime.DurationAs = timeUnits.DAYS,
  date2?: DateType,
  timezone: string = DEFAULT_TIMEZONE
): boolean => {
  if (date2) {
    return moment(date1).tz(timezone).isSameOrAfter(moment(date2).tz(timezone), unit);
  }
  return moment().tz(timezone).isSameOrAfter(date1, unit);
};

/**
 * Get the time difference between two dates.
 *
 * @param {*} date1 - The first date.
 * @param {*} unit - The unit of time to use.
 * @param {*} date2 - The second date.
 * @param {*} timezone - The timezone to use.
 * @returns {*} The time difference between the two dates.
 */
export const getTimeDifference = (
  date1: DateType,
  unit: unitOfTime.DurationAs = timeUnits.DAYS,
  date2?: DateType,
  timezone: string = DEFAULT_TIMEZONE
): number => {
  if (date2) {
    return moment(date1).tz(timezone).diff(date2, unit);
  }
  return moment().tz(timezone).diff(date1, unit);
};

/**
 * Convert a time to a string.
 *
 * @param {*} date - The date to convert.
 * @param {*} format - The format to use.
 * @param {*} timezone - The timezone to use.
 * @returns {*} The time as a string.
 */
export const convertTimeToString = (
  date?: DateType,
  format: string = timeFormats.DATETIME_24_WITH_SECONDS,
  timezone: string = DEFAULT_TIMEZONE
): string => {
  return moment
    .tz(date ?? getCurrentDateAndTime(), timezone)
    .format(format)
    .toString();
};

/**
 * Add time to a date.
 *
 * @param {*} date - The date to add time to.
 * @param {*} amount - The amount of time to add.
 * @param {*} unit - The unit of time to add.
 * @param {*} startDate - Whether to start the date at the beginning of the day.
 * @param {*} endDate - Whether to end the date at the end of the day.
 * @param {*} format - The format to return the date in.
 * @param {*} timezone - The timezone to use.
 * @returns {*} The date with time added.
 */
export const addTimeToDate = (
  amount: string,
  unit: unitOfTime.DurationAs,
  date?: DateType,
  startDate?: boolean,
  endDate?: boolean,
  format?: null | string,
  timezone: string = DEFAULT_TIMEZONE
): Moment | string => {
  const currentMoment = moment.tz(date ?? getCurrentDateAndTime(), timezone).add(amount, unit);
  if (startDate) {
    return currentMoment.startOf(timeUnits.DAY);
  }
  if (endDate) {
    return currentMoment.endOf(timeUnits.DAY);
  }
  return format ? currentMoment.format(format) : currentMoment;
};

/**
 * Get the past time based on the provided amount, unit, and timezone.
 *
 * @param {number} amount - The amount of time to subtract.
 * @param {string} unit - The unit of time to subtract.
 * @param {Date|string} [date=null] - The date to subtract from.
 * @param {string} [format=false] - The format to return the date in.
 * @param {string} [timezone=DEFAULT_TIMEZONE] - The timezone to use.
 * @returns {string|moment.Moment} The past time.
 */
export const getPastTime = (
  amount: number,
  unit: unitOfTime.DurationAs,
  date?: DateType,
  format?: string,
  timezone: string = DEFAULT_TIMEZONE
): Moment | string => {
  let currentMoment;
  if (date) {
    currentMoment = moment(date).tz(timezone).subtract(amount, unit);
  } else {
    currentMoment = moment().tz(timezone).subtract(amount, unit);
  }

  return format ? currentMoment.format(format) : currentMoment;
};

/**
 * Get the current year based on the provided timezone.
 *
 * @param {string} timezone - The timezone to use for the current year.
 * @returns {number} The current year.
 */
export const getCurrentYear = (timezone: string = DEFAULT_TIMEZONE): number =>
  moment().tz(timezone).year();

/**
 * Check if a date is a moment object.
 *
 * @param {*} date - The date to check.
 * @returns {*} True if the date is a moment object.
 */
export const isMomentObject = (date: DateType): boolean => moment(date).isValid();

/**
 * Check if two dates are the same.
 *
 * @param {*} date1 - The first date.
 * @param {*} date2 - The second date.
 * @returns {*} True if the dates are the same.
 */
export const isSameTime = (date1: DateType, date2: DateType): boolean =>
  moment(date1).isSame(moment(date2));

/**
 * Check if two dates are the same based on the provided comparison unit.
 *
 * @param {DateType} date1 - The first date to compare.
 * @param {DateType} date2 - The second date to compare.
 * @param {string} comparisonUnit - The unit of time to compare.
 * @returns {boolean} True if the dates are the same, false otherwise.
 */

export const checkIfSameOrNot = (
  date1: DateType,
  date2: DateType,
  comparisonUnit: unitOfTime.DurationAs | unitOfTime.StartOf
): boolean => {
  const momentDate1 = moment(date1);
  const momentDate2 = moment(date2);

  return momentDate1.isSame(momentDate2, comparisonUnit);
};

/**
 * Convert milliseconds to a time.
 *
 * @param {*} milliseconds - The milliseconds to convert.
 * @param {*} timeZone - The timezone to use.
 * @param {*} format - The format to use.
 * @returns {*} The time.
 */
export const convertMillisecondsToTime = (
  milliseconds: number | string,
  timeZone: string = DEFAULT_TIMEZONE,
  format?: null | string
): Moment | string => {
  const currentMoment = moment.unix(Number(milliseconds)).tz(timeZone);
  if (format) {
    return currentMoment.format(format);
  }
  return currentMoment;
};

/**
 * Create academic year dates based on year or custom dates
 * @param data - Object containing year or startDate/endDate
 * @param timezone - Timezone to use (defaults to DEFAULT_TIMEZONE)
 * @returns Object with startDate, endDate, and name
 */
export const createAcademicYearDates = (
  data: { endDate?: string; name?: string; startDate?: string; year?: number; },
  timezone: string = DEFAULT_TIMEZONE
): { endDate: Date; name: string; startDate: Date; } => {
  let startDate: Moment;
  let endDate: Moment;
  let name: string;

  if (data.year) {
    // If year is provided, create academic year from June to May
    const year = data.year;
    startDate = moment.tz([year, 5, 1], timezone); // June 1st (month 5 = June)
    endDate = moment.tz([year + 1, 4, 31], timezone); // May 31st (month 4 = May)
    name = `Jun${year}-May${year + 1}`;
  } else if (data.startDate && data.endDate) {
    // If startDate and endDate are provided, use them
    startDate = moment.tz(data.startDate, timezone);
    endDate = moment.tz(data.endDate, timezone);
    name = data.name || `${startDate.year()}-${endDate.year()}`;
  } else {
    throw new Error('Either year or both startDate and endDate must be provided');
  }

  // Validate dates
  if (startDate.isSameOrAfter(endDate)) {
    throw new Error('Start date must be before end date');
  }

  return {
    endDate: endDate.toDate(),
    name,
    startDate: startDate.toDate()
  };
};
