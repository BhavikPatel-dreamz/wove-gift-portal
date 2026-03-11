export const SOUTH_AFRICA_TIMEZONE = "Africa/Johannesburg";

// South Africa Standard Time (SAST) is UTC+02:00 and does not observe DST.
export const SOUTH_AFRICA_UTC_OFFSET_MINUTES = 120;
const SOUTH_AFRICA_UTC_OFFSET_MS = SOUTH_AFRICA_UTC_OFFSET_MINUTES * 60 * 1000;

/**
 * Returns date parts as they would be in South Africa time.
 * Uses a fixed UTC+02:00 offset (SAST).
 */
export function getSouthAfricaDateParts(date = new Date()) {
  const shifted = new Date(date.getTime() + SOUTH_AFRICA_UTC_OFFSET_MS);
  return {
    year: shifted.getUTCFullYear(),
    monthIndex: shifted.getUTCMonth(), // 0-based
    day: shifted.getUTCDate(),
    dayOfWeek: shifted.getUTCDay(), // 0 (Sun) .. 6 (Sat)
    hour: shifted.getUTCHours(),
    minute: shifted.getUTCMinutes(),
    second: shifted.getUTCSeconds(),
    millisecond: shifted.getUTCMilliseconds(),
  };
}

/**
 * Creates a real Date for a local time in South Africa (SAST, UTC+02:00).
 */
export function makeSouthAfricaDate({
  year,
  monthIndex,
  day,
  hour = 0,
  minute = 0,
  second = 0,
  millisecond = 0,
}) {
  const utcMs =
    Date.UTC(year, monthIndex, day, hour, minute, second, millisecond) -
    SOUTH_AFRICA_UTC_OFFSET_MS;
  return new Date(utcMs);
}

/**
 * Start of the day (00:00) in South Africa for the given Date.
 */
export function startOfSouthAfricaDay(date = new Date()) {
  const { year, monthIndex, day } = getSouthAfricaDateParts(date);
  return makeSouthAfricaDate({ year, monthIndex, day, hour: 0, minute: 0 });
}

