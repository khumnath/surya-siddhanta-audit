/**
 * Surya-Siddhanta Time Conversions
 * ================================
 * 
 * Provides the mathematical transformation between modern Gregorian/Julian 
 * dates and the traditional day-count (Ahargana) since the Kali Epoch.
 */

import { DateTime } from 'luxon';
import type { Location } from '../../../types/astronomy';

/** 
 * [Ch. I] The Kali Yuga Epoch JDN.
 * Corresponds to Midnight (Ujjain) on Friday, February 18, 3102 BCE.
 * At this moment, the mean longitudes of all planets were at 0° (Revati).
 */
export const KALI_EPOCH_JDN = 588465.5;

/**
 * Convert Gregorian date to Julian Day Number (JDN).
 * 
 * @param year Proleptic Gregorian year
 * @param month Month (1-12)
 * @param day Day (1-31)
 * @param hour Hour (0-23)
 * @param minute Minute (0-59)
 * @param second Second (0-59)
 * @param timezoneOffset Offset from UTC in hours
 * @returns Julian Day Number
 */
export function gregorianToJdn(
  year: number,
  month: number,
  day: number,
  hour: number = 12,
  minute: number = 0,
  second: number = 0,
  timezoneOffset: number = 0.0
): number {
  let dt = DateTime.fromObject({ year, month, day, hour, minute, second }, { zone: 'utc' });
  dt = dt.minus({ hours: timezoneOffset });

  const Y = dt.year;
  const M = dt.month;
  const D = dt.day + (dt.hour / 24.0) + (dt.minute / 1440.0) + (dt.second / 86400.0);

  let y = Y;
  let m = M;
  if (m <= 2) {
    y -= 1;
    m += 12;
  }

  const A = Math.floor(y / 100);
  const B = 2 - A + Math.floor(A / 4);

  return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + D + B - 1524.5;
}

/**
 * Convert Julian Day Number to Gregorian date.
 * 
 * @param jdn Julian Day Number
 * @returns Tuple of [year, month, day]
 */
export function jdnToGregorian(jdn: number): [number, number, number] {
  const f = jdn + 0.5;
  const i = Math.floor(f);
  const frac = f - i;

  let B = i;
  if (i > 2299160) {
    const A = Math.floor((i - 1867216.25) / 36524.25);
    B = i + 1 + A - Math.floor(A / 4);
  }

  const C = B + 1524;
  const D = Math.floor((C - 122.1) / 365.25);
  const E = Math.floor(365.25 * D);
  const G = Math.floor((C - E) / 30.6001);
  const day = Math.floor(C - E - Math.floor(30.6001 * G)) + frac;
  const month = G < 14 ? G - 1 : G - 13;
  const year = month > 2 ? D - 4716 : D - 4715;

  return [year, month, Math.floor(day)];
}

/**
 * Calculate the number of days elapsed since the Kali Yuga Epoch.
 * 
 * @param jdn Current Julian Day Number
 * @returns Days since Kali Epoch
 */
export function daysSinceKali(jdn: number): number {
  return jdn - KALI_EPOCH_JDN;
}

/**
 * Convert a DateTime object to the traditional Ahargana (Sum of Days).
 * 
 * [Ch. I, v.51-54] This sum of days is the fundamental time input for 
 * mean motion and planetary anomaly lookups in the Surya-Siddhanta.
 * 
 * @param dt Modern DateTime or JS Date
 * @param location Geographic location for local time adjustments
 * @returns The Ahargana value (decimal days since Kali Epoch)
 */
export function dateTimeToAhargana(
  dt: DateTime | Date,
  location?: Location
): number {
  const luxonDt = dt instanceof Date ? DateTime.fromJSDate(dt) : dt;
  const offset = location?.timezone_offset !== undefined ? location.timezone_offset : (luxonDt.offset / 60.0);
  
  const jdn = gregorianToJdn(
    luxonDt.year,
    luxonDt.month,
    luxonDt.day,
    luxonDt.hour,
    luxonDt.minute,
    luxonDt.second,
    offset
  );
  
  return daysSinceKali(jdn);
}

// ============================================================================
// Lunar Month Constants (Modern Engine Parity)
// Note: Traditional SS values are expressed as discrete Bhaganas (revolutions).
// ============================================================================
export const SYNODIC_MONTH = 29.530588;
export const SIDEREAL_MONTH = 27.321661;
export const ANOMALISTIC_MONTH = 27.554550;
export const DRACONIC_MONTH = 27.212221;
