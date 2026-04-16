/**
 * Siddhantic Mean Motions (Madhyama-Gati)
 * =======================================
 * 
 * Calculates the mean longitudes of celestial bodies based on the Ahargana 
 * (civil days elapsed since the epoch).
 * 
 * [Ch. I, v.29-37]
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
 * Defines the 'Bhagana' (sidereal revolutions) for each 
 * celestial body within a Mahayuga. These discrete counts are the absolute 
 * source for planetary speeds in the Siddhanta.
 * [Ch. I, v.53-54] Establishes the 'Graha-anayana' (planetary calculation) 
 * rule: Longitude = (Revolutions * Days Elapsed) / Total Days in Yuga.
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
 * Identifiers for celestial bodies and their calculation points.
 */
export const Body = {
  /** The Sun (Surya). Mean motion is the fundamental sidereal year. */
  SUN: 'SUN',
  /** The Moon (Chandra). The fastest moving scriptural body. */
  MOON: 'MOON',
  /** Mars (Mangala). [Ch. I, v.30] */
  MARS: 'MARS',
  /** 
   * Mercury (Budha). 
   * Note: In mean motion, Budha and Shukra orbit with the Sun. 
   * The specific 'Mercury' identifier here refers to its orbital velocity. 
   */
  MERCURY: 'MERCURY', 
  /** Jupiter (Guru). [Ch. I, v.31] */
  JUPITER: 'JUPITER',
  /** Venus (Shukra). Orbital velocity identifier. */
  VENUS: 'VENUS', 
  /** Saturn (Shani). The slowest moving graha. [Ch. I, v.32] */
  SATURN: 'SATURN',
  /** 
   * Moon's Apogee (Mandocca). [Ch. I, v.33] 
   * Used for calculating the lunar Equation of Center.
   */
  MOON_APSIS: 'MOON_APSIS',
  /** 
   * Moon's Node (Rahu/Pata). [Ch. I, v.33] 
   * Moves in a retrograde (Vamam) direction.
   */
  MOON_NODE: 'MOON_NODE'
} as const;

export type Body = typeof Body[keyof typeof Body];

/**
 * Mapping of revolutions (Bhagana) per Mahayuga for each body.
 * 
 * [Ch. I, v.29-33]
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
 * These values are derived from the scriptural counts.
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
 * Calculate the Sidereal Mean Daily Motion in degrees.
 * 
 * [Ch. I, v.53] Derived as (Bhaganas * 360) / Total Days in Yuga.
 * 
 * @param body The celestial body or calculation point
 * @returns Average daily movement in sidereal degrees
 */
export function getMeanDailyMotion(body: Body): number {
  const revs = REVOLUTIONS[body];
  const motion = (revs * 360.0) / DAYS_PER_MAHAYUGA;

  // [Ch. I, v.33] Explicitly marks the Moon's Node as retrograde (Vamam).
  if (body === Body.MOON_NODE) {
    return -motion;
  }
  return motion;
}

/**
 * Calculate the mean longitude (Madhyama) at a given Ahargana.
 * 
 * [Ch. I, v.53-54] Core Planetary Computation:
 * Multiplies the total days elapsed by the planetary revolution count 
 * and normalizes the result into the 360-degree zodiac.
 * 
 * @param body The celestial body
 * @param ahargana Number of terrestrial days elapsed since the epoch
 * @returns Normalized mean longitude in degrees [0, 360)
 */
export function calculateMeanLongitude(body: Body, ahargana: number): number {
  const dailyMotion = getMeanDailyMotion(body);
  const totalDegrees = dailyMotion * ahargana;
  
  let longitude = totalDegrees % 360.0;
  if (longitude < 0) longitude += 360.0;
  
  return longitude;
}
