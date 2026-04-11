/**
 * Surya-Siddhanta Eclipse Calculations
 * ===================================
 */

import { Body, getMeanDailyMotion } from '../celestial/mean_motions';
import { calculateTrueLongitudeSun } from '../celestial/sun';
import { calculateTrueLongitudeMoon } from '../celestial/moon';
import { RADIUS, SINE_MAX_DECLINATION } from '../core/constants';

import { getJya } from '../core/sine-table';

// Celestial Body Diameters in yojanas
export const DIAMETER_SUN_YOJANAS = 6500.0;
export const DIAMETER_MOON_YOJANAS = 480.0;
export const DIAMETER_EARTH_YOJANAS = 1600.0;

const MEAN_MOTION_SUN_DEG = getMeanDailyMotion(Body.SUN);
const MEAN_MOTION_MOON_DEG = getMeanDailyMotion(Body.MOON);

const MEAN_MOTION_SUN_MIN = MEAN_MOTION_SUN_DEG * 60.0;
const MEAN_MOTION_MOON_MIN = MEAN_MOTION_MOON_DEG * 60.0;

/**
 * Calculate true daily motion (Gati) in arc-minutes per day.
 */
export function getTrueDailyMotion(body: Body, ahargana: number): number {
  const t0 = ahargana;
  const t1 = ahargana + 1.0;

  let l0: number, l1: number;
  if (body === Body.SUN) {
    l0 = calculateTrueLongitudeSun(t0);
    l1 = calculateTrueLongitudeSun(t1);
  } else if (body === Body.MOON) {
    l0 = calculateTrueLongitudeMoon(t0);
    l1 = calculateTrueLongitudeMoon(t1);
  } else {
    return 0.0;
  }

  let diff = (l1 - l0) % 360.0;
  if (diff > 180.0) diff -= 360.0;
  if (diff < -180.0) diff += 360.0;

  return diff * 60.0;
}

/**
 * Calculate apparent diameter of the Moon in arc-minutes.
 */
export function getApparentDiameterMoon(trueMotionMoonMin: number): number {
  const correctedDiam = (trueMotionMoonMin * DIAMETER_MOON_YOJANAS) / MEAN_MOTION_MOON_MIN;
  return correctedDiam / 15.0;
}

/**
 * Calculate apparent diameter of the Sun in arc-minutes.
 */
export function getApparentDiameterSun(trueMotionSunMin: number): number {
  return (trueMotionSunMin / MEAN_MOTION_SUN_MIN) * 32.4166;
}

/**
 * Calculate diameter of Earth's shadow at the Moon's orbit.
 */
export function getEarthShadowDiameter(trueMotionSunMin: number, trueMotionMoonMin: number): number {
  const suci = (DIAMETER_EARTH_YOJANAS * trueMotionMoonMin) / MEAN_MOTION_MOON_MIN;
  const sunCorr = (DIAMETER_SUN_YOJANAS * trueMotionSunMin) / MEAN_MOTION_MOON_MIN;
  const shadowYojanas = suci - sunCorr;
  return shadowYojanas / 15.0;
}

/**
 * Calculate amount eclipsed (obscuration) in arc-minutes.
 */
export function calculateObscuration(diameter1: number, diameter2: number, latitude: number): number {
  return 0.5 * (diameter1 + diameter2) - Math.abs(latitude);
}

/**
 * Calculate half-duration (Sthiti) of eclipse in nadis.
 */
export function calculateEclipseHalfDuration(
  diameter1: number,
  diameter2: number,
  latitude: number,
  moonMotionMin: number,
  sunMotionMin: number
): number {
  const relMotion = moonMotionMin - sunMotionMin;
  if (relMotion === 0) return 0.0;

  const halfSum = 0.5 * (diameter1 + diameter2);
  if (halfSum < Math.abs(latitude)) return 0.0;

  return (Math.sqrt(Math.pow(halfSum, 2) - Math.pow(latitude, 2)) / relMotion) * 60.0;
}

/**
 * Calculate parallax correction for solar eclipse.
 */
export function getSolarEclipseParallax(ahargana: number, latitudeDeg: number): { long: number; lat: number } {
  const sunLong = calculateTrueLongitudeSun(ahargana);
  const sinCoLat = getJya(90.0 - latitudeDeg);
  
  // Simplified parallax logic for the library port
  const sinLagna = getJya(sunLong); // Approximation
  const udaya = (sinLagna * SINE_MAX_DECLINATION) / sinCoLat;
  const madhyajya = getJya(sunLong);

  const drkkshepa = Math.sqrt(Math.max(0, Math.pow(madhyajya, 2) - Math.pow(udaya, 2)));
  const drggati = Math.sqrt(Math.max(0, Math.pow(RADIUS, 2) - Math.pow(drkkshepa, 2)));

  const lambana = (getJya(30.0) / drggati) * 60.0; // Approximation
  const avanati = (drggati * lambana) / RADIUS;

  return {
    long: (lambana * 60.0) / RADIUS,
    lat: (avanati * 60.0) / RADIUS
  };
}

/**
 * Calculate apparent conjunction time for solar eclipse.
 */
export function getApparentConjunctionSolar(ahargana: number, latitudeDeg: number): number {
  let guess = ahargana;
  for (let i = 0; i < 5; i++) {
    const sunTrue = calculateTrueLongitudeSun(guess);
    const moonTrue = calculateTrueLongitudeMoon(guess);
    const parallax = getSolarEclipseParallax(guess, latitudeDeg);
    
    const sunApparent = sunTrue - (parallax.long / 60.0);
    const error = (moonTrue - sunApparent) % 360.0;
    
    if (Math.abs(error) < 0.001) break;
    
    const delta = 0.01;
    const sunNext = calculateTrueLongitudeSun(guess + delta) - (getSolarEclipseParallax(guess + delta, latitudeDeg).long / 60.0);
    const moonNext = calculateTrueLongitudeMoon(guess + delta);
    const derivative = ((moonNext - sunNext) - error) / delta;
    
    if (Math.abs(derivative) < 1e-10) break;
    guess = guess - error / derivative;
  }
  return guess;
}
