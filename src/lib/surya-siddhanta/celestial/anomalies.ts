/**
 * Siddhantic Anomaly Calculations (Kendra-vicara)
 * ===============================================
 * 
 * Implements Manda (Apsis) and Sighra (Conjunction) anomaly (Kendra) 
 * calculations required to find true celestial longitudes.
 * 
 * [Ch. II, v.29] Defines 'Kendra' as the angular distance between a 
 * planet and its apsis/conjunction point.
 * [Ch. II, v.46] Establishes the rules for identifying the Sighra point 
 * for inner and outer planets.
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
 * [Ch. II, v.29] The Manda Kendra is specifically defined as: 
 * Distance = Mean planet - Apogee (Mandocca).
 * 
 * @param body The celestial body
 * @param ahargana Current civil day count since epoch
 * @returns Manda Kendra in degrees [0, 360)
 */
export function getMandaKendra(body: Body, ahargana: number): number {
  const meanPos = calculateMeanLongitude(body, ahargana);

  let apogee: number;
  if (body === Body.MOON) {
    // [Ch. I, v.33] The Moon's Mandocca (Apogee) is a moving point, 
    // unlike the relatively fixed apogees of other planets.
    apogee = calculateMeanLongitude(Body.MOON_APSIS, ahargana);
  } else {
    // [Ch. II, v.2] Fixed apogees for the current Kalpa.
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
 * [Ch. II, v.46] Defines the Sighrocca (Point of Conjunction).
 * - For Outer Planets (Mars, Jupiter, Saturn): The Sighrocca is the Mean Sun.
 * - For Inner Planets (Mercury, Venus): The Sighrocca is the planet's 
 *   own mean motion.
 * 
 * @param body The celestial body (Mars, Mercury, Jupiter, Venus, Saturn)
 * @param ahargana Current day count
 * @returns Sighra Kendra in degrees [0, 360)
 */
export async function getSighraKendra(body: Body, ahargana: number): Promise<number> {
  let sighraPos: number;
  if (([Body.MARS, Body.JUPITER, Body.SATURN] as Body[]).includes(body)) {
    // [Ch. II, v.46] For outer planets, the Sighra is the Sun.
    sighraPos = calculateMeanLongitude(Body.SUN, ahargana);
  } else if (([Body.MERCURY, Body.VENUS] as Body[]).includes(body)) {
    // For inner planets, the Sighra is their own mean orbital motion.
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
 * Corresponds to the angular distance of the planet from its Ascending 
 * Node (Pata). This Kendra is used in the Surya Siddhanta for 
 * calculating celestial latitude (Vikshepa).
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
