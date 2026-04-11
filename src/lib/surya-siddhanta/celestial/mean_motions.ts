/**
 * Surya-Siddhanta Mean Motions
 * ============================
 * 
 * Calculates mean longitudes (Madhyama-Graha) of celestial bodies 
 * based on the Ahargana (number of civil days elapsed since the epoch).
 * 
 * [Ch. I, v.29-36] Each body completes a specific number of revolutions 
 * (Bhagana) per Mahayuga.
 */

import {
  REV_SUN,
  REV_MOON,
  REV_MARS,
  REV_MERCURY_SIGHRA,
  REV_JUPITER,
  REV_VENUS_SIGHRA,
  REV_SATURN,
  REV_MOON_APSIS,
  REV_MOON_NODE,
  DAYS_PER_MAHAYUGA,
} from '../core/constants';

/**
 * Identifiers for celestial bodies and their secondary points (Node/Apsis).
 */
export const Body = {
  SUN: 'SUN',
  MOON: 'MOON',
  MARS: 'MARS',
  /** Mercury's Sighra (fast epicycle). Note: Mean Budha longitude matches Sun. */
  MERCURY: 'MERCURY', 
  JUPITER: 'JUPITER',
  /** Venus's Sighra (fast epicycle). Note: Mean Shukra longitude matches Sun. */
  VENUS: 'VENUS', 
  SATURN: 'SATURN',
  /** Moon's apogee/apsis (Mandocca) */
  MOON_APSIS: 'MOON_APSIS',
  /** Moon's ascending node (Rahu/Pata) */
  MOON_NODE: 'MOON_NODE'
} as const;

export type Body = typeof Body[keyof typeof Body];

/**
 * Internal mapping of revolutions per Mahayuga for each body.
 */
const REVOLUTIONS: Record<Body, number> = {
  [Body.SUN]: REV_SUN,
  [Body.MOON]: REV_MOON,
  [Body.MARS]: REV_MARS,
  [Body.MERCURY]: REV_MERCURY_SIGHRA,
  [Body.JUPITER]: REV_JUPITER,
  [Body.VENUS]: REV_VENUS_SIGHRA,
  [Body.SATURN]: REV_SATURN,
  [Body.MOON_APSIS]: REV_MOON_APSIS,
  [Body.MOON_NODE]: REV_MOON_NODE,
};

/**
 * Calculate the mean daily motion in degrees per day.
 * 
 * [Ch. I, v.53] The daily motion is derived from the total revolutions
 * in a Mahayuga divided by the total civil days (1,577,917,828).
 * 
 * @param body The celestial body
 * @returns Average daily motion in degrees
 */
export function getMeanDailyMotion(body: Body): number {
  const revs = REVOLUTIONS[body];
  const motion = (revs * 360.0) / DAYS_PER_MAHAYUGA;

  // [Ch. I, v.36] The Node (Rahu) moves in a retrograde direction.
  if (body === Body.MOON_NODE) {
    return -motion;
  }
  return motion;
}

/**
 * Calculate the mean longitude (Madhyama) at a given Ahargana.
 * 
 * [Ch. I, v.53-54] Core Mean Motion Algorithm:
 * 1. Multiply Ahargana by total revolutions.
 * 2. Divide by civil days per Yuga.
 * 3. The remainder (Shesha) represents the current position in the orbit.
 * 
 * @param body The celestial body
 * @param ahargana Number of civil days elapsed since the epoch
 * @returns Normalized mean longitude in degrees [0, 360)
 */
export function calculateMeanLongitude(body: Body, ahargana: number): number {
  const dailyMotion = getMeanDailyMotion(body);
  const totalDegrees = dailyMotion * ahargana;
  
  let longitude = totalDegrees % 360.0;
  if (longitude < 0) longitude += 360.0;
  
  return longitude;
}
