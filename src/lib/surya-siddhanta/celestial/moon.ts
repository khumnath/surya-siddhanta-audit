/**
 * Surya-Siddhanta Moon Calculations
 * =================================
 * 
 * Implements the calculation of the True Longitude of the Moon (Candrasphuta).
 * In the Surya-Siddhanta, the Moon's position is corrected using 
 * the Equation of the Center (Manda-phala) relative to a moving apogee.
 */

import { Body, calculateMeanLongitude } from './mean_motions';
import { RADIUS } from '../core/constants';
import { getJya, inverseJya } from '../core/sine-table';

/** 
 * [Ch. II, v.38] Manda (slow) epicycle circumference for the Moon.
 * Traditionally specified as 32° in even quadrants and diminished 
 * by 20' (totaling 31° 40') in odd quadrants.
 */
export const MANDA_CIRCUMFERENCE_MOON_EVEN = 32.0;
export const MANDA_CIRCUMFERENCE_MOON_ODD = 31.0 + (40.0 / 60.0);

/**
 * Calculate the variable epicycle circumference for the Moon.
 * 
 * [Ch. II, v.38] Dynamically adjusts the lunar epicycle between 32° 
 * and 31° 40' based on the sine of the anomaly.
 * 
 * @param kendra The mean anomaly
 * @returns Corrected circumference for the current position
 */
export function getVariableCircumferenceMoon(kendra: number): number {
  const jya = Math.abs(getJya(kendra));
  const diff = MANDA_CIRCUMFERENCE_MOON_EVEN - MANDA_CIRCUMFERENCE_MOON_ODD;
  const correction = (diff * jya) / RADIUS;
  return MANDA_CIRCUMFERENCE_MOON_EVEN - correction;
}

/**
 * Calculate the mean anomaly (Manda Kendra) of the Moon.
 * 
 * [Ch. I, v.35] Unlike the star-planets, the Moon's Mandocca (Apogee) 
 * is a moving point with its own set of revolutions in a Mahayuga.
 * 
 * @param ahargana Current day count
 * @returns Mean anomaly in degrees [0, 360)
 */
export function calculateMeanAnomalyMoon(ahargana: number): number {
  const meanMoon = calculateMeanLongitude(Body.MOON, ahargana);
  const meanApogee = calculateMeanLongitude(Body.MOON_APSIS, ahargana);
  let anomaly = (meanMoon - meanApogee) % 360.0;
  if (anomaly < 0) anomaly += 360.0;
  return anomaly;
}

/**
 * Calculate the true longitude (Spashta / Candrasphuta) of the Moon.
 * 
 * [Ch. II, v.39] The Equation of the Center (Manda-phala) is 
 * applied negatively in the first half of the anomaly and 
 * positively in the second half.
 * 
 * @param ahargana Current day count
 * @returns True lunar longitude (Candrasphuta) in degrees [0, 360)
 */
export function calculateTrueLongitudeMoon(ahargana: number): number {
  const meanMoon = calculateMeanLongitude(Body.MOON, ahargana);
  const meanApogee = calculateMeanLongitude(Body.MOON_APSIS, ahargana);
  let kendra = (meanMoon - meanApogee) % 360.0;
  if (kendra < 0) kendra += 360.0;

  const sinKendra = getJya(kendra);
  const circumference = getVariableCircumferenceMoon(kendra);
  const term = (circumference / 360.0) * sinKendra;
  const correctionDeg = inverseJya(term);

  let trueMoon: number;
  // Apply Manda-phala based on quadrant
  if (kendra < 180.0) {
    trueMoon = meanMoon - correctionDeg;
  } else {
    trueMoon = meanMoon + correctionDeg;
  }

  let result = trueMoon % 360.0;
  if (result < 0) result += 360.0;
  return result;
}
