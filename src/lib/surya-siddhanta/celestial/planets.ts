/**
 * Siddhantic Planetary Calculations (Spashta-graha)
 * ================================================
 * 
 * Implements the calculation of True Longitudes for the five star-planets 
 * (Mars, Mercury, Jupiter, Venus, Saturn).
 * 
 * [Ch. II, v.1-5] Defines the fixed points (Mandocca and Sighrocca) for 
 * each planet.
 * [Ch. II, v.34-37] Establishes the variable epicycle circumferences 
 * (Paridhi) for both Manda (eccentricity) and Sighra (conjunction) cycles.
 * [Ch. II, v.43-44] Mandates the 'Four-Step' iterative correction sequence 
 * required to arrive at a high-precision True Longitude.
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
 * Manda Epicycle Circumferences (Manda-paridhi).
 * 
 * [Ch. II, v.34-35] Corrected to match Burgess (1935) Table C.
 * These dimensions reflect the eccentricity of planetary orbits.
 * Format: [Even, Odd] in degrees.
 */
export const MANDA_CIRC_MARS: [number, number] = [72.0, 75.0];
export const MANDA_CIRC_MERCURY: [number, number] = [28.0, 30.0];
export const MANDA_CIRC_JUPITER: [number, number] = [32.0, 33.0];
export const MANDA_CIRC_VENUS: [number, number] = [11.0, 12.0];
export const MANDA_CIRC_SATURN: [number, number] = [48.0, 49.0];

/** 
 * Sighra Epicycle Circumferences (Sighra-paridhi).
 * 
 * [Ch. II, v.36-37] Corrected to match Burgess (1935) Table D.
 * Mercury and Venus have large Sighra cycles as the 'Sighrocca' 
 * is their own orbital motion.
 * Format: [Even, Odd] in degrees.
 */
export const SIGHRA_CIRC_MARS: [number, number] = [235.0, 232.0];
export const SIGHRA_CIRC_MERCURY: [number, number] = [133.0, 132.0];
export const SIGHRA_CIRC_JUPITER: [number, number] = [70.0, 72.0];
export const SIGHRA_CIRC_VENUS: [number, number] = [262.0, 260.0];
export const SIGHRA_CIRC_SATURN: [number, number] = [39.0, 40.0];

/**
 * Calculate the dynamically corrected epicycle circumference based on anomaly.
 * 
 * [Ch. II, v.38] Implements the universal Siddhantic rule for epicyclic 
 * contraction, which applies to both Manda and Sighra cycles.
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
 * [Ch. II, v.39, 45] Transforms the mean eccentricity into a 
 * longitudinal correction.
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

  // [v.45] Quadrant-based application rule.
  if (anomaly >= 0.0 && anomaly < 180.0) {
    return -correction;
  } else {
    return correction;
  }
}

/**
 * Calculate the Sighra Equation (Equation of Conjunction).
 * 
 * [Ch. II, v.40-42] A more complex correction using the 'Chala-karna' 
 * (Variable Hypotenuse) to account for the planet's change in distance 
 * from Earth.
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

  // [v.41] Chala-karna (Hypotenuse) = sqrt((R + KotiPhala)^2 + BhujaPhala^2)
  const karnaSq = Math.pow(RADIUS + kotiPhala, 2) + Math.pow(bhujaPhala, 2);
  const karna = Math.sqrt(karnaSq);

  // [v.42] Resulting Phala is the arc of the Jya proportional to the distance.
  const eqSine = (bhujaPhala * RADIUS) / karna;
  return inverseJya(eqSine);
}

/**
 * Calculate the True Longitude (Spashta) for star planets.
 * 
 * [Ch. II, v.43-44] Implements the rigorous four-step correction procedure:
 * 1. Apply half of the Sighra-phala to the Mean Longitude.
 * 2. Apply half of the Manda-phala to the result.
 * 3. Apply the full Manda-phala to the original Mean Longitude to 
 *    find the 'Manda-spashta'.
 * 4. Apply the full Sighra-phala to the 'Manda-spashta' to find the 
 *    final 'True Longitude'.
 * 
 * @param body The star planet (Mars, Mercury, Jupiter, Venus, Saturn)
 * @param ahargana Current civil day count since epoch
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

  // [v.44-45] The 4-Step Iteration.
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
 * Determine if a planet is in Retrograde (Vakra) motion.
 * 
 * [Ch. II, v.52-53] Identifies when the planet reaches the 'turning points' 
 * in its synodic cycle relative to the Sighrocca.
 * 
 * @param body The star planet
 * @param ahargana Current day count
 * @returns True if the planet is currently moving retrograde (Vakra)
 */
export function isRetrograde(body: Body, ahargana: number): boolean {
  const truePlanet = calculateTrueLongitudePlanet(body, ahargana);
  
  let sighraLong: number;
  if (([Body.MARS, Body.JUPITER, Body.SATURN] as Body[]).includes(body)) {
    // Outer planets: Forced by the Mean Sun.
    sighraLong = calculateMeanLongitude(Body.SUN, ahargana);
  } else {
    // Inner planets: Forced by their own orbital motion.
    sighraLong = calculateMeanLongitude(body, ahargana);
  }

  let kendra = (sighraLong - truePlanet) % 360.0;
  if (kendra < 0) kendra += 360.0;

  // [v.53] Specific degrees of stationary points for Vakra-gati.
  const retrogradeRanges: Partial<Record<Body, [number, number]>> = {
    [Body.MERCURY]: [144.0, 216.0],
    [Body.VENUS]: [168.0, 197.0],
    [Body.MARS]: [164.0, 196.0],
    [Body.JUPITER]: [130.0, 230.0], // Adjusted to match scriptural range
    [Body.SATURN]: [115.0, 245.0],
  };

  const range = retrogradeRanges[body];
  if (!range) return false;

  const [low, high] = range;
  return kendra >= low && kendra <= high;
}
