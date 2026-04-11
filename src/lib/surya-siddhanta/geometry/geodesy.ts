/**
 * Surya-Siddhanta Geodesy & Spherical Astronomy
 * =============================================
 * 
 * Implements the mathematical relationships between the ecliptic 
 * and the local horizon, primarily used for determining day length 
 * and shadow lengths.
 */

import { getJya, getKojya, inverseJya } from '../core/sine-table';
import { RADIUS } from '../core/constants';

/** 
 * [Ch. II, v.28] The Sine (Jya) of the maximum declination (24°).
 * In a radius of 3438, this value is canonically 1397.
 */
export const SINE_MAX_DECLINATION = 1397.0;

/** [Ch. II, v.58] The obliquity of the ecliptic (fixed at 24.0°). */
export const OBLIQUITY_DEG = inverseJya(SINE_MAX_DECLINATION);

/**
 * [Ch. III, v.1] The standard gnomon length in digits (Angula).
 */
export const GNOMON_DIGITS = 12;

/**
 * Right ascension values for the twelve zodiac signs in arc-minutes.
 * [Ch. III, v.42-45] Describes the periods of rising of the signs 
 * (Udayaprama).
 */
export const RIGHT_ASCENSION_SIGNS: Record<number, number> = {
  0: 1670.0,
  1: 1795.0,
  2: 1985.0,
  3: 3465.0 - 1670.0,
  4: 3465.0 - 1795.0,
  5: 3465.0 - 1985.0,
  6: 3465.0 - 1670.0,
  7: 3465.0 - 1795.0,
  8: 3465.0 - 1985.0,
  9: 3465.0 - 1670.0,
  10: 3465.0 - 1795.0,
  11: 3465.0 - 1985.0,
};

/**
 * Calculate the equinoctial shadow (Vishuvachaya) from latitude.
 * 
 * [Ch. III, v.13] The shadow at noon on the equinox day.
 */
export function getGnomonShadowFromLatitude(latitudeDeg: number): number {
  const sinLat = getJya(latitudeDeg);
  const cosLat = getKojya(latitudeDeg);

  if (Math.abs(cosLat) < 1e-6) return Infinity;

  const tanLat = sinLat / cosLat;
  return 12.0 * tanLat;
}

/**
 * Calculate the Sun's declination (Kranti).
 * 
 * [Ch. III, v.12] The distance of the Sun from the equator.
 * Formula: sin(Decl) = sin(Long) * sin(24°) / R
 * 
 * @param longitude True Sidereal Longitude of the Sun
 * @returns Declination in degrees
 */
export function calculateDeclination(longitude: number): number {
  const sinLong = getJya(longitude);
  const sinDecl = (sinLong * SINE_MAX_DECLINATION) / RADIUS;
  return inverseJya(sinDecl);
}

/**
 * Calculate the radius of the diurnal circle (Dyujya).
 * 
 * @param declination Current solar declination
 * @returns Diurnal radius in arc-minutes
 */
export function getDayRadius(declination: number): number {
  return getKojya(declination);
}

/**
 * Calculate the Ascensional Difference (Cara).
 * 
 * [Ch. III, v.34-36] Cara is the difference between half-day and 
 * a quadrant (15 Ghatis), caused by the Sun's declination and observer's latitude.
 * 
 * @param declination Solar declination
 * @param latitude Observer's latitude
 * @returns Cara in Pranas (1/360th of a Ghati)
 */
export function calculateAscensionalDifference(declination: number, latitude: number): number {
  const sinLat = getJya(latitude);

  const tanLat = sinLat / getKojya(latitude);
  const equinoctialShadow = 12.0 * tanLat;

  const sinDecl = getJya(declination);
  /** [Ch. III, v.34] Kujya: The sine of the earth-correction */
  const kujya = (sinDecl * equinoctialShadow) / 12.0;

  const dayRadius = getDayRadius(declination);
  /** [Ch. III, v.36] Carajya: The sine of the ascensional difference */
  const carajya = (kujya * RADIUS) / dayRadius;

  return inverseJya(carajya) * 60.0; 
}

/**
 * Calculate the length of the day (Dinamana) in Ghatis.
 * 
 * [Ch. III, v.36] The length of the day is 30 Ghatis increased or 
 * decreased by twice the Cara.
 * 
 * @param longitude True Sun longitude
 * @param latitude Observer's latitude
 * @returns Day length in Ghatis (1 Ghati = 24 minutes)
 */
export function calculateDayLength(longitude: number, latitude: number): number {
  const declination = calculateDeclination(longitude);
  const caraPranas = calculateAscensionalDifference(declination, latitude);
  // 6 Ghatis = 360 Pranas
  const caraGhatis = caraPranas / 360.0;
  
  // During Uttarayana (Northward progress), day remains > 30 for North latitudes
  return 30.0 + 2.0 * caraGhatis;
}

/**
 * Calculate Sunrise and Sunset times.
 * 
 * High-level bridge converting traditional Dinamana (Ghatis) 
 * into decimal hours for modern UI integration.
 * 
 * @param sunLongitude True Sun longitude
 * @param latitude Observer's latitude
 * @returns Sunrise/Sunset in decimal local solar hours
 */
export function calculateSunriseSunset(
  sunLongitude: number,
  latitude: number
): { sunrise: number; sunset: number; dayLengthHours: number } {
  const dayGhatis = calculateDayLength(sunLongitude, latitude);
  const dayLengthHours = (dayGhatis / 60.0) * 24.0;

  // Local solar noon is defined as 12:00
  const sunrise = 12.0 - dayLengthHours / 2.0;
  const sunset = 12.0 + dayLengthHours / 2.0;

  return { sunrise, sunset, dayLengthHours };
}
