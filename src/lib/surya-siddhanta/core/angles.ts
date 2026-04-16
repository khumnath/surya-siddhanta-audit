/**
 * Surya-Siddhanta Angle Conversions
 * =================================
 * 
 * Implements angle conversion and manipulation functions, primarily
 * managing the transition between decimal degrees and the traditional
 * Sign/Degree/Minute system.
 */

import { RADIUS } from './constants';
import { getKojya } from './sine-table';
import { normalizeAngle, dmsToDecimal, decimalToDms } from './utils';

/**
 * Convert Amsha (Degrees), Kala (Minutes), and Vikala (Seconds) 
 * to decimal degrees.
 * 
 * @param d Degrees (Amsha)
 * @param m Minutes (Kala)
 * @param s Seconds (Vikala)
 * @returns Decimal degrees
 */
export function degToDecimal(d: number, m: number, s: number): number {
  return dmsToDecimal(d, m, s);
}

/**
 * Convert decimal degrees to the Amsha/Kala/Vikala tuple.
 * 
 * @param deg Decimal degrees
 * @returns Tuple of [degrees, minutes, seconds]
 */
export function decimalToDmsTuple(deg: number): [number, number, number] {
  return decimalToDms(deg);
}

/**
 * Convert Rashi (Zodiac Sign) notation to absolute longitude.
 * 
 * [Ch. I, v.29]
 *
 * <details class="siddhantic-proof">
 * <summary>Siddhantic Proof: Madhyama (Mean Motions) v.29</summary>
 *
 * **Sanskrit (Devanagari):**
 *
 * युगे सूर्यबुधशुक्राणां खचतुष्करदार्णवाः। कुजार्किगुरुशीघ्राणां भगणाः पूर्वयायिनाम्॥
 *
 * **Translation (Burgess):**
 *
 * In a Mahayuga, the Sun, Mercury, and Venus complete 4,320,000 revolutions. This number also applies to the Sighra (conjunction) points of Mars, Saturn, and Jupiter.
 *
 * **Modern Technical Commentary:**
 *
 * Establishes the mean solar year. For Mercury and Venus, these are their actual orbital revolutions around the Sun. For outer planets, this count applies to their 'Sighra' (fast) epicycle, which represents the Earth's orbital motion.
 *
 * </details>
 * "Twelve signs (Rashi) make a circle."
 * Each Rashi consists of 30 degrees (Amsha).
 * 
 * @param sign Sign number (0-11)
 * @param deg Degrees within sign (0-29)
 * @param min Minutes within degree (0-59)
 * @returns Absolute longitude in degrees [0, 360)
 */
export function signLongitudeToDeg(sign: number, deg: number, min: number = 0): number {
  const longitude = sign * 30.0 + deg + (min / 60.0);
  return normalizeAngle(longitude);
}

/**
 * Convert longitude in degrees to Rashi (Zodiac Sign) notation.
 * 
 * @param longitude Absolute longitude in degrees
 * @returns Tuple of [sign (Rashi), degrees, minutes]
 */
export function degToSignLongitude(longitude: number): [number, number, number] {
  const normLong = normalizeAngle(longitude);
  const sign = Math.floor(normLong / 30.0);
  const rem = normLong % 30.0;
  const deg = Math.floor(rem);
  const min = Math.floor((rem - deg) * 60.0);
  return [sign, deg, min];
}

/**
 * Convert Degrees/Minutes/Seconds to total Liptas (Arc-minutes).
 * 
 * [Ch. I] Most core algorithms (especially Jya lookups) require 
 * the arc to be expressed in Liptas.
 * 
 * @param d Degrees
 * @param m Minutes
 * @param s Seconds
 * @returns Total arc-minutes (Lipta/Kala)
 */
export function dmsToArcmin(d: number, m: number, s: number = 0): number {
  return d * 60.0 + m + (s / 60.0);
}

/**
 * Convert total Liptas (Arc-minutes) to the Amsha/Kala/Vikala tuple.
 * 
 * @param arcmin Total arc-minutes (Lipta)
 * @returns Tuple of [degrees, minutes, seconds]
 */
export function arcminToDms(arcmin: number): [number, number, number] {
  const totalDeg = arcmin / 60.0;
  return decimalToDms(totalDeg);
}

/**
 * Get the quadrant (Pada) for a given angle.
 * 
 * @param angleDeg Angle in degrees
 * @returns Quadrant number (1-4)
 */
export function getQuadrant(angleDeg: number): number {
  const normAngle = normalizeAngle(angleDeg);
  return Math.floor(normAngle / 90.0) + 1;
}

/**
 * Get the supplement of an angle (180° - angle).
 * 
 * @param angleDeg Angle in degrees
 * @returns Supplementary angle in degrees
 */
export function supplementAngle(angleDeg: number): number {
  return 180.0 - angleDeg;
}

/**
 * Get the complement of an angle (90° - angle).
 * 
 * @param angleDeg Angle in degrees
 * @returns Complementary angle in degrees
 */
export function complementAngle(angleDeg: number): number {
  return 90.0 - angleDeg;
}

/**
 * Calculate the Versed Sine (Utkramajya) of an angle.
 * 
 * [Ch. II, v.22] Utkramajya(θ) = R - R*cos(θ)
 * Traditionally found by subtracting sines in reverse order from the Radius.
 * 
 * @param angleDeg Angle in degrees
 * @returns Versine value (scaled by R = 3438)
 */
export function getVersine(angleDeg: number): number {
  const cosVal = getKojya(angleDeg);
  return RADIUS - cosVal;
}

