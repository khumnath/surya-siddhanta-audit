/**
 * Surya-Siddhanta Sun Calculations
 * ================================
 * 
 * Implements the calculation of the True Longitude of the Sun (Ravisphuta).
 * In the Surya-Siddhanta, the Sun's position is corrected using only 
 * the Equation of the Center (Manda-phala).
 */

import { Body, calculateMeanLongitude } from './mean_motions';
import { APOGEE_SUN, RADIUS } from '../core/constants';
import { getJya, inverseJya } from '../core/sine-table';

/** 
 * [Ch. II, v.38] Manda (slow) epicycle circumference for the Sun.
 * Traditionally specified as 14° in even quadrants and diminished 
 * by 20' (totaling 13° 40') in odd quadrants.
 */
export const MANDA_CIRCUMFERENCE_SUN_EVEN = 14.0;
export const MANDA_CIRCUMFERENCE_SUN_ODD = 13.0 + (40.0 / 60.0);

/**
 * Calculate the variable epicycle circumference for the Sun.
 * 
 * [Ch. II, v.38] Dynamically adjusts the solar epicycle between 14° 
 * and 13° 40' based on the sine of the anomaly.
 * 
 * @param kendra The mean anomaly
 * @returns Corrected circumference for the current position
 */
export function getVariableCircumferenceSun(kendra: number): number {
  const jya = Math.abs(getJya(kendra));
  const diff = MANDA_CIRCUMFERENCE_SUN_EVEN - MANDA_CIRCUMFERENCE_SUN_ODD;
  const correction = (diff * jya) / RADIUS;
  return MANDA_CIRCUMFERENCE_SUN_EVEN - correction;
}

/**
 * Calculate the mean anomaly (Manda Kendra) of the Sun.
 * 
 * [Ch. II, v.29] The distance of the mean Sun from its fixed apogee.
 * 
 * @param ahargana Current day count
 * @returns Mean anomaly in degrees [0, 360)
 */
export function calculateMeanAnomalySun(ahargana: number): number {
  const meanSun = calculateMeanLongitude(Body.SUN, ahargana);
  let anomaly = (meanSun - APOGEE_SUN) % 360.0;
  if (anomaly < 0) anomaly += 360.0;
  return anomaly;
}

/**
 * Calculate the true longitude (Spashta / Ravisphuta) of the Sun.
 * 
 * [Ch. II, v.39] The Equation of the Center (Manda-phala) is 
 * applied negatively in the first half of the anomaly and 
 * positively in the second half.
 * 
 * @param ahargana Current day count
 * @returns True solar longitude (Ravisphuta) in degrees [0, 360)
 */
export function calculateTrueLongitudeSun(ahargana: number): number {
  const meanSun = calculateMeanLongitude(Body.SUN, ahargana);
  let kendra = (meanSun - APOGEE_SUN) % 360.0;
  if (kendra < 0) kendra += 360.0;

  const sinKendra = getJya(kendra);
  const circumference = getVariableCircumferenceSun(kendra);
  const term = (circumference / 360.0) * sinKendra;
  const correctionDeg = inverseJya(term);

  let trueSun: number;
  // Apply Manda-phala based on quadrant
  if (kendra < 180.0) {
    trueSun = meanSun - correctionDeg;
  } else {
    trueSun = meanSun + correctionDeg;
  }

  let result = trueSun % 360.0;
  if (result < 0) result += 360.0;
  return result;
}
