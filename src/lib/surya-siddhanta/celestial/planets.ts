/**
 * Surya-Siddhanta Planetary Calculations
 * ======================================
 * 
 * Implements the calculation of True Longitudes (Spashta-graha) for the 
 * five star-planets (Mars, Mercury, Jupiter, Venus, Saturn).
 */

import { Body, calculateMeanLongitude } from './mean_motions';
import {
  APOGEE_MARS,
  APOGEE_MERCURY,
  APOGEE_JUPITER,
  APOGEE_VENUS,
  APOGEE_SATURN,
  RADIUS,
} from '../core/constants';
import { getJya, getKojya, inverseJya } from '../core/sine-table';

/** 
 * [Ch. II, v.34-37] Manda Epicycle Circumferences (Paridhi).
 * Format: [Even quadrant, Odd quadrant] in degrees.
 */
export const MANDA_CIRC_MARS: [number, number] = [75.0, 72.0];
export const MANDA_CIRC_MERCURY: [number, number] = [30.0, 28.0];
export const MANDA_CIRC_JUPITER: [number, number] = [33.0, 32.0];
export const MANDA_CIRC_VENUS: [number, number] = [12.0, 11.0];
export const MANDA_CIRC_SATURN: [number, number] = [49.0, 48.0];

/** 
 * [Ch. II, v.34-37] Sighra Epicycle Circumferences (Paridhi).
 * Format: [Even quadrant, Odd quadrant] in degrees.
 */
export const SIGHRA_CIRC_MARS: [number, number] = [235.0, 232.0];
export const SIGHRA_CIRC_MERCURY: [number, number] = [133.0, 132.0];
export const SIGHRA_CIRC_JUPITER: [number, number] = [70.0, 72.0];
export const SIGHRA_CIRC_VENUS: [number, number] = [262.0, 260.0];
export const SIGHRA_CIRC_SATURN: [number, number] = [39.0, 40.0];

/**
 * Calculate the variable epicycle circumference based on anomaly.
 * 
 * [Ch. II, v.38-40] The dimensions of the epicycles are variable, 
 * diminishing in the odd quadrants proportional to the Jya (Sine) 
 * of the anomaly (Kendra).
 * 
 * @param circEven Circumference at 0°/180°
 * @param circOdd Circumference at 90°/270°
 * @param anomalyDeg Current anomaly (Kendra)
 * @returns Corrected circumference for the current position
 */
export function getVariableCircumference(
  circEven: number,
  circOdd: number,
  anomalyDeg: number
 ): number {
  const jya = Math.abs(getJya(anomalyDeg));
  const diff = circEven - circOdd;
  const correction = (diff * jya) / RADIUS;
  return circEven - correction;
}

/**
 * Calculate the Manda Equation (Equation of the Center).
 * 
 * [Ch. II, v.39] Manda-phala = (Circumference * Sine(Anomaly)) / 360.
 * Applied negatively in the first six signs and positively in the last six.
 * 
 * @param meanLong Mean longitude
 * @param apogee Apogee position (Mandocca)
 * @param circTuple Manda epicycle circumferences
 * @returns Manda correction (Manda-phala) in degrees
 */
export function calculateMandaEquation(
  meanLong: number,
  apogee: number,
  circTuple: [number, number]
): number {
  let anomaly = (meanLong - apogee) % 360.0;
  if (anomaly < 0) anomaly += 360.0;

  const circ = getVariableCircumference(circTuple[0], circTuple[1], anomaly);
  const sinKendra = getJya(anomaly);
  const eqSine = (circ / 360.0) * sinKendra;
  const correction = inverseJya(eqSine);

  // Correction is negative in quadrants 1 and 2 (0-180), positive in 3 and 4
  if (anomaly >= 0.0 && anomaly < 180.0) {
    return -correction;
  } else {
    return correction;
  }
}

/**
 * Calculate the Sighra Equation (Equation of Conjunction).
 * 
 * [Ch. II, v.40-42] Sighra-phala calculation involves finding the 
 * Hypothenuse (Karna) of the triangle formed by the epicycle.
 * 
 * @param planetLong Current corrected position
 * @param sighraLong Longitude of the conjunction point
 * @param circTuple Sighra epicycle circumferences
 * @returns Sighra correction (Sighra-phala) in degrees
 */
export function calculateSighraEquation(
  planetLong: number,
  sighraLong: number,
  circTuple: [number, number]
): number {
  let anomaly = (sighraLong - planetLong) % 360.0;
  if (anomaly < 0) anomaly += 360.0;

  const circ = getVariableCircumference(circTuple[0], circTuple[1], anomaly);
  const bhujaJya = getJya(anomaly);
  const kotiJya = getKojya(anomaly);

  const bhujaPhala = (circ / 360.0) * bhujaJya;
  const kotiPhala = (circ / 360.0) * kotiJya;

  // Karna (Hypothenuse) = sqrt((R + KotiPhala)^2 + BhujaPhala^2)
  const karnaSq = Math.pow(RADIUS + kotiPhala, 2) + Math.pow(bhujaPhala, 2);
  const karna = Math.sqrt(karnaSq);

  // Resulting Phala is the arc of the Jya proportional to the distance
  const eqSine = (bhujaPhala * RADIUS) / karna;
  return inverseJya(eqSine);
}

/**
 * Calculate the True Longitude (Spashta) for star planets.
 * 
 * [Ch. II, v.43-45] The Four-Step Correction Procedure:
 * 1. Apply half the Sighra-phala to the Mean Longitude.
 * 2. Apply half the Manda-phala to that result.
 * 3. Apply the full Manda-phala to the original Mean Longitude (Finding True-Mean).
 * 4. Apply the full Sighra-phala to the True-Mean to find the final True Longitude.
 * 
 * @param body The celestial body (Mars, Mercury, Jupiter, Venus, Saturn)
 * @param ahargana Current day count
 * @returns Final True Longitude (Spashta) in degrees [0, 360)
 */
export function calculateTrueLongitudePlanet(body: Body, ahargana: number): number {
  let meanBody: Body;
  let mandaCirc: [number, number];
  let sighraCirc: [number, number];
  let apogee: number;
  let sighraSource: Body;

  switch (body) {
    case Body.MARS:
      meanBody = Body.MARS;
      mandaCirc = MANDA_CIRC_MARS;
      sighraCirc = SIGHRA_CIRC_MARS;
      apogee = APOGEE_MARS;
      sighraSource = Body.SUN;
      break;
    case Body.MERCURY:
      meanBody = Body.SUN;
      mandaCirc = MANDA_CIRC_MERCURY;
      sighraCirc = SIGHRA_CIRC_MERCURY;
      apogee = APOGEE_MERCURY;
      sighraSource = Body.MERCURY;
      break;
    case Body.JUPITER:
      meanBody = Body.JUPITER;
      mandaCirc = MANDA_CIRC_JUPITER;
      sighraCirc = SIGHRA_CIRC_JUPITER;
      apogee = APOGEE_JUPITER;
      sighraSource = Body.SUN;
      break;
    case Body.VENUS:
      meanBody = Body.SUN;
      mandaCirc = MANDA_CIRC_VENUS;
      sighraCirc = SIGHRA_CIRC_VENUS;
      apogee = APOGEE_VENUS;
      sighraSource = Body.VENUS;
      break;
    case Body.SATURN:
      meanBody = Body.SATURN;
      mandaCirc = MANDA_CIRC_SATURN;
      sighraCirc = SIGHRA_CIRC_SATURN;
      apogee = APOGEE_SATURN;
      sighraSource = Body.SUN;
      break;
    default:
      throw new Error(`Body ${body} is not a star planet`);
  }

  const meanPos = calculateMeanLongitude(meanBody, ahargana);
  const sighraPos = calculateMeanLongitude(sighraSource, ahargana);

  // [v.44-45] 4-Step Correction Process
  const mandaEq1 = calculateMandaEquation(meanPos, apogee, mandaCirc);
  const m1 = meanPos + mandaEq1 / 2.0;

  const sighraEq1 = calculateSighraEquation(m1, sighraPos, sighraCirc);
  const m2 = m1 + sighraEq1 / 2.0;

  const mandaEq2 = calculateMandaEquation(m2, apogee, mandaCirc);
  const trueMean = meanPos + mandaEq2;

  const sighraEq2 = calculateSighraEquation(trueMean, sighraPos, sighraCirc);
  const trueLong = trueMean + sighraEq2;

  let result = trueLong % 360.0;
  if (result < 0) result += 360.0;
  return result;
}

/**
 * Check if the planet is in Retrograde (Vakra) motion.
 * 
 * [Ch. II, v.52-53] The motion becomes retrograde at certain degrees
 * of the Sighra-kendra.
 * 
 * @param body The celestial body
 * @param ahargana Current day count
 * @returns True if the planet is currently moving retrograde
 */
export function isRetrograde(body: Body, ahargana: number): boolean {
  const truePlanet = calculateTrueLongitudePlanet(body, ahargana);
  
  let sighraLong: number;
  if (([Body.MARS, Body.JUPITER, Body.SATURN] as Body[]).includes(body)) {
    // For outer planets, Sighra is the Sun
    sighraLong = calculateMeanLongitude(Body.SUN, ahargana);
  } else {
    // For inner planets, Sighra is their own fast motion
    sighraLong = calculateMeanLongitude(body, ahargana);
  }

  let kendra = (sighraLong - truePlanet) % 360.0;
  if (kendra < 0) kendra += 360.0;

  // [v.52-53] Specific degrees of Sighra-kendra for retrograde motion
  const retrogradeRanges: Partial<Record<Body, [number, number]>> = {
    [Body.MERCURY]: [144.0, 216.0],
    [Body.VENUS]: [168.0, 197.0],
    [Body.MARS]: [164.0, 196.0],
    [Body.JUPITER]: [180.0, 280.0],
    [Body.SATURN]: [115.0, 245.0],
  };

  const range = retrogradeRanges[body];
  if (!range) return false;

  const [low, high] = range;
  return kendra >= low && kendra <= high;
}
