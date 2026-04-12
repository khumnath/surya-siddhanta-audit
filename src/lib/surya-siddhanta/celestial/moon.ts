/**
 * Siddhantic Moon Calculations (Chandra-spashti)
 * =============================================
 * 
 * Implements the calculation of the True Longitude of the Moon (Candrasphuta).
 * 
 * [Ch. II, v.38] Defines the lunar epicycles (Manda-vritta) as the largest 
 * in the system, varying between 32° and 31° 40'.
 * [Ch. I, v.33] Establishes that the Moon's apogee (Mandocca) is a moving 
 * point with its own revolution count, unlike the Sun's fixed apogee.
 * [Ch. II, v.39] Applies the 'Manda-phala' (Equation of the Center) to 
 * reconcile mean lunar motion with observable position.
 */

import { Body, calculateMeanLongitude } from './mean_motions';
import { RADIUS } from '../core/constants';
import { getJya, inverseJya } from '../core/sine-table';

/** 
 * Lunar epicycle circumferences (Manda-paridhi).
 * 
 * [Ch. II, v.38] The Moon's epicycle is 32° at the quadrants 
 * and contracts to 31° 40' at the apsides. This large size 
 * reflects the Moon's rapid and complex orbital variation.
 */
export const MANDA_CIRCUMFERENCE_MOON_EVEN = 32.0;
export const MANDA_CIRCUMFERENCE_MOON_ODD = 31.0 + (40.0 / 60.0);

/**
 * Calculate the dynamically corrected epicycle circumference for the Moon.
 * 
 * [Ch. II, v.38] Implements the rule of epicyclic contraction for the Moon.
 * 
 * @param kendra The mean anomaly in degrees
 * @returns The precise circumference for the current anomaly
 */
export function getVariableCircumferenceMoon(kendra: number): number {
  const jya = Math.abs(getJya(kendra));
  const diff = MANDA_CIRCUMFERENCE_MOON_EVEN - MANDA_CIRCUMFERENCE_MOON_ODD;
  const correction = (diff * jya) / RADIUS;
  return MANDA_CIRCUMFERENCE_MOON_EVEN - correction;
}

/**
 * Calculate the Moon's Mean Anomaly (Manda Kendra).
 * 
 * [Ch. I, v.33 & Ch. II, v.29] The Moon's Kendra is the distance 
 * between the Mean Moon and its moving Apogee (Mandocca).
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
 * Calculate the True Longitude (Spashta-Chandra) of the Moon.
 * 
 * [Ch. II, v.39, 45] Core Algorithm:
 * 1. Identify the Mean Anomaly (Kendra).
 * 2. Calculate the Manda-phala (Equation of Center).
 * 3. Apply the correction to the Mean Moon (Subtract if Kendra < 180, 
 *    Add if Kendra > 180).
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
  
  // Siddhantic Rule: Result = (Paridhi * Jya) / 360 (expressed as an arc)
  const term = (circumference / 360.0) * sinKendra;
  const correctionDeg = inverseJya(term);

  let trueMoon: number;
  // [Ch. II, v.45] Apply Manda-phala.
  if (kendra < 180.0) {
    trueMoon = meanMoon - correctionDeg;
  } else {
    trueMoon = meanMoon + correctionDeg;
  }

  let result = trueMoon % 360.0;
  if (result < 0) result += 360.0;
  return result;
}
