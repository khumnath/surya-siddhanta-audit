/**
 * Siddhantic Time Conversions (Ahargana)
 * =====================================
 * 
 * Provides the mathematical bridge between modern Gregorian/Julian calendars 
 * and the traditional continuous day-count (Ahargana) since the Kali Epoch.
 * 
 * [Ch. I, v.48-51]
 *
 * <details class="siddhantic-proof">
 * <summary>Siddhantic Proof: Madhyama (Mean Motions) v.48</summary>
 *
 * **Sanskrit (Devanagari):**
 *
 * कल्पादिगुणितं कालमुपर्युपरि संस्थितं । सौरैर्वर्षगतैः सार्धं संकल्य तानि पिण्डयेत् ॥
 *
 * **Translation (Burgess):**
 *
 * Having multiplied the time from the beginning of the creation by the number of years, add to the product the number of years elapsed of the current year.
 *
 * **Modern Technical Commentary:**
 *
 * The first step of the Ahargana (heaping of days) process: converting cumulative Kalpa/Yuga time into a single count of elapsed solar years.
 *
 * </details>
 * Defines the process of 'Ahargana' (heap of days)—the 
 * summation of months and days to arrive at a serial count for astronomical 
 * lookups.
 * [Ch. I, v.52] Establishes the Ahargana as the count of terrestrial 
 * (civil/civilian) days elapsed since the zero-point of the epoch.
 */

import { DateTime } from 'luxon';
import type { Location } from '../../../types/astronomy';
import { KATHMANDU } from '../geography/location';

/** 
 * Siddhantic Epoch (Kali Yuga).
 * 
 * [Ch. I, v.17, 21]
 *
 * <details class="siddhantic-proof">
 * <summary>Siddhantic Proof: Madhyama (Mean Motions) v.17</summary>
 *
 * **Sanskrit (Devanagari):**
 *
 * युगस्य दशमो भागश्चतुस्त्रिद्व्येकसंगुणः । क्रमात्कृतयुगादीनां षष्ठांशः सन्ध्ययो स्वकः ॥
 *
 * **Translation (Burgess):**
 *
 * The tenth part of a Mahayuga, multiplied by 4, 3, 2, 1, gives the lengths of the four ages respectively.
 *
 * **Modern Technical Commentary:**
 *
 * Calculates the specific lengths of the Yugas: Satya (1,728,000y), Treta (1,296,000y), Dvapara (864,000y), and Kali (432,000y) based on a 4:3:2:1 ratio.
 *
 * </details>
 * Corresponds to Midnight (Ujjain Meridian) on Friday, 
 * February 18, 3102 BCE (Julian). At this epoch, the mean positions of 
 * all planets are scripturally defined as being exactly at 0° (Revati).
 */
export const KALI_EPOCH_JDN = 588465.5;

/**
 * Convert a proleptic Gregorian date to a Julian Day Number (JDN).
 * 
 * This is the standard continuous day count used by modern astronomers 
 * (starting from Jan 1, 4713 BCE).
 * 
 * @param year Proleptic Gregorian year
 * @param month Month (1-12)
 * @param day Day (1-31)
 * @param hour Hour (0-23)
 * @param minute Minute (0-59)
 * @param second Second (0-59)
 * @param timezoneOffset Offset from UTC in hours (e.g., +5.75 for Kathmandu)
 * @returns Julian Day Number as a decimal.
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
 * Convert a continuous Julian Day Number back to a calendar date.
 * 
 * This function accounts for the Gregorian calendar reform (Oct 1582) 
 * for large JDN values.
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
 * Calculate the Siddhantic Ahargana from a JD.
 * 
 * [Ch. I, v.52] The Ahargana is the count of terrestrial (civil) days 
 * that have elapsed since the Midnight at Ujjain epoch of 3102 BCE.
 * 
 * @param jdn Current Julian Day Number
 * @returns Decimal days since Kali Epoch.
 */
export function daysSinceKali(jdn: number): number {
  return jdn - KALI_EPOCH_JDN;
}

/**
 * Convert a modern DateTime object to the traditional Ahargana (Sum of Days).
 * 
 * [Ch. I, v.48-51]
 *
 * <details class="siddhantic-proof">
 * <summary>Siddhantic Proof: Madhyama (Mean Motions) v.48</summary>
 *
 * **Sanskrit (Devanagari):**
 *
 * कल्पादिगुणितं कालमुपर्युपरि संस्थितं । सौरैर्वर्षगतैः सार्धं संकल्य तानि पिण्डयेत् ॥
 *
 * **Translation (Burgess):**
 *
 * Having multiplied the time from the beginning of the creation by the number of years, add to the product the number of years elapsed of the current year.
 *
 * **Modern Technical Commentary:**
 *
 * The first step of the Ahargana (heaping of days) process: converting cumulative Kalpa/Yuga time into a single count of elapsed solar years.
 *
 * </details>
 * This is the core time input for the library. All 
 * planetary positions (True Longitudes) are derived purely from this 
 * single day-count value.
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

/**
 * Reverse conversion from traditional Ahargana back to Gregorian time.
 * 
 * Useful for verifying historical planetary configurations against 
 * reconstructed dates.
 * 
 * @param ahargana Days since Kali Epoch
 * @returns Luxon DateTime in the observer's zone (Asia/Kathmandu).
 */
export function aharganaToDateTime(
  ahargana: number,
  _location: Location = KATHMANDU
): DateTime {
  const jdn = ahargana + KALI_EPOCH_JDN;
  const [y, m, d] = jdnToGregorian(jdn);
  
  const dayFrac = (jdn + 0.5) % 1;
  const totalSeconds = Math.round(dayFrac * 86400);
  const hour = Math.floor(totalSeconds / 3600);
  const minute = Math.floor((totalSeconds % 3600) / 60);
  const second = totalSeconds % 60;

  return DateTime.fromObject({
    year: y,
    month: m,
    day: d,
    hour,
    minute,
    second
  }, { zone: 'Asia/Kathmandu' });
}

// ============================================================================
// Siddhantic Period Multipliers (Traditional Parity)
// ============================================================================
/** Mean synodic month (Tithi-span average) */
export const SYNODIC_MONTH = 29.530588;
/** Mean sidereal month (Moon's transit of Nakshatras) */
export const SIDEREAL_MONTH = 27.321661;
/** Moon's anomalistic month (Perigee to Perigee) */
export const ANOMALISTIC_MONTH = 27.554550;
/** Moon's draconic month (Node to Node) */
export const DRACONIC_MONTH = 27.212221;
