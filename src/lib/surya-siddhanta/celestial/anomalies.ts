/**
 * Surya-Siddhanta Anomaly Calculations
 * ======================================
 * 
 * Implements Manda (Apsis) and Sighra (Conjunction) anomaly (Kendra) 
 * calculations required to find true celestial longitudes.
 * 
 * [Ch. II, v.29] "Subtracting the apsis (Mandocca) from the planet, 
 * the remainder is its anomaly (Kendra)."
 */

import { Body, calculateMeanLongitude } from './mean_motions';
import {
  APOGEE_SUN,
  APOGEE_MARS,
  APOGEE_MERCURY,
  APOGEE_JUPITER,
  APOGEE_VENUS,
  APOGEE_SATURN,
  NODE_MARS,
  NODE_MERCURY,
  NODE_JUPITER,
  NODE_VENUS,
  NODE_SATURN,
} from '../core/constants';

/**
 * Calculate the Manda Kendra (Anomaly of the Apsis).
 * 
 * [Ch. II, v.29] The Manda Kendra is the distance of the mean planet 
 * from its apogee (Mandocca). This is used to calculate the Equation 
 * of the Center.
 * 
 * @param body The celestial body
 * @param ahargana Current day count
 * @returns Manda Kendra in degrees [0, 360)
 */
export function getMandaKendra(body: Body, ahargana: number): number {
  const meanPos = calculateMeanLongitude(body, ahargana);

  let apogee: number;
  if (body === Body.MOON) {
    // [Ch. I, v.35] The Moon's Mandocca is a moving point.
    apogee = calculateMeanLongitude(Body.MOON_APSIS, ahargana);
  } else {
    // For other planets, the Mandocca is treated as fixed for the Kalpa.
    const apogees: Partial<Record<Body, number>> = {
      [Body.SUN]: APOGEE_SUN,
      [Body.MARS]: APOGEE_MARS,
      [Body.MERCURY]: APOGEE_MERCURY,
      [Body.JUPITER]: APOGEE_JUPITER,
      [Body.VENUS]: APOGEE_VENUS,
      [Body.SATURN]: APOGEE_SATURN,
    };
    apogee = apogees[body] || 0.0;
  }

  let kendra = (meanPos - apogee) % 360.0;
  if (kendra < 0) kendra += 360.0;
  return kendra;
}

/**
 * Calculate the Sighra Kendra (Anomaly of Conjunction).
 * 
 * [Ch. II, v.43-46] The Sighra Kendra is the distance between the
 * planet and its conjunction point (Sighra).
 * 
 * Traditional Rules for Sighra Point [v.46]:
 * - For Outer Planets (Mars, Jupiter, Saturn): The Sighra is the mean Sun.
 * - For Inner Planets (Mercury, Venus): The Sighra is the planet's own fast motion.
 * 
 * @param body The celestial body
 * @param ahargana Current day count
 * @returns Sighra Kendra in degrees [0, 360)
 */
export async function getSighraKendra(body: Body, ahargana: number): Promise<number> {
  let sighraPos: number;
  if (([Body.MARS, Body.JUPITER, Body.SATURN] as Body[]).includes(body)) {
    // [Ch. II, v.46] For Mars etc., the Sighra is the Sun.
    sighraPos = calculateMeanLongitude(Body.SUN, ahargana);
  } else if (([Body.MERCURY, Body.VENUS] as Body[]).includes(body)) {
    // For Mercury/Venus, the Sighra is their own calculated fast position.
    sighraPos = calculateMeanLongitude(body, ahargana);
  } else {
    return 0.0;
  }

  // Dynamic import to break circular dependency with planets.ts
  const { calculateTrueLongitudePlanet } = await import('./planets');
  const planetPos = calculateTrueLongitudePlanet(body, ahargana);

  let kendra = (sighraPos - planetPos) % 360.0;
  if (kendra < 0) kendra += 360.0;
  return kendra;
}

/**
 * Calculate the Node Kendra (Anomaly from the Node).
 * 
 * [Ch. II] The angular distance of the planet from its Ascending 
 * Node (Pata). Primarily used for calculating celestial latitude.
 * 
 * @param body The celestial body
 * @param ahargana Current day count
 * @returns Node Kendra in degrees [0, 360)
 */
export async function getNodeKendra(body: Body, ahargana: number): Promise<number> {
  const { calculateTrueLongitudePlanet } = await import('./planets');
  const planetPos = calculateTrueLongitudePlanet(body, ahargana);

  const nodes: Partial<Record<Body, number>> = {
    [Body.MARS]: NODE_MARS,
    [Body.MERCURY]: NODE_MERCURY,
    [Body.JUPITER]: NODE_JUPITER,
    [Body.VENUS]: NODE_VENUS,
    [Body.SATURN]: NODE_SATURN,
  };

  const node = nodes[body] || 0.0;

  let kendra = (planetPos - node) % 360.0;
  if (kendra < 0) kendra += 360.0;
  return kendra;
}
