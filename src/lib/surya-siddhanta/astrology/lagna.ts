/**
 * Siddhantic Lagna (Ascendant) Calculations
 * ==========================================
 * 
 * Implements the calculation of the Ascendant (Lagna) for a given location 
 * and time. 
 * 
 * [Ch. III, v.41-42] Defines the 'Udaya-prana' (Rising Times) of the 
 * twelve signs at the equator (Lanka).
 * [Ch. III, v.34] Establishes the 'Cara' (Ascensional Difference) logic 
 * required to correct rising times for the observer's specific latitude.
 * 
 * The Lagna is the point of the ecliptic that is rising on the eastern 
 * horizon at a specific moment.
 */

import { SINE_MAX_DECLINATION, RADIUS } from '../core/constants';

export interface LagnaInfo {
  rashiIndex: number;
  rashiName: string;
  degreeInRashi: number;
  absoluteDegree: number;
  localSiderealTime: number;
  latitude: number;
  longitude: number;
}

/**
 * Calculate Local Sidereal Time (LST) for a given location.
 * 
 * [Ch. III] Corresponds to the 'Ishta-kala' (Desired Time) of the 
 * celestial sphere. It represents the rotation of the heavens relative 
 * to the Prime Meridian (Lanka) adjusted for local longitude (Deshantara).
 * 
 * @param ahargana Current day count since epoch
 * @param longitude Longitude of the observer
 * @returns Local Sidereal Time in hours [0, 24)
 */
export function calculateLocalSiderealTime(ahargana: number, longitude: number): number {
  const J2000_JD = 2451545.0;
  const KALI_EPOCH_JDN = 588465.5;
  const jd = ahargana + KALI_EPOCH_JDN;
  const daysSinceJ2000 = jd - J2000_JD;

  const dayNumber = Math.floor(daysSinceJ2000);
  const timeFraction = daysSinceJ2000 - dayNumber;

  let gst0h = 18.697374558 + 24.06570982441908 * dayNumber;
  gst0h = gst0h % 24.0;

  const SIDEREAL_RATE = 24.06570982441908 / 24.0;
  const timeOfDayHours = timeFraction * 24.0;
  const siderealTimeHours = timeOfDayHours * SIDEREAL_RATE;

  const gstCurrent = (gst0h + siderealTimeHours) % 24.0;
  const longitudeHours = longitude / 15.0;

  let lst = (gstCurrent + longitudeHours) % 24.0;
  if (lst < 0) lst += 24.0;
  return lst;
}

/**
 * Calculate the ecliptic longitude of the ascendant (Lagna).
 * 
 * [Ch. III, v.41-42] In modern trigonometry, this internalizes the 
 * classical 'Udaya-prana' and 'Cara' corrections. It solves for 
 * the intersection of the local horizon and the ecliptic.
 * 
 * @param lstHours Local Sidereal Time in decimal hours
 * @param latitude Latitude of the observer
 * @param obliquity Obliquity of the ecliptic (standardly 24° in SS)
 * @returns Longitude of the Lagna in degrees [0, 360)
 */
export function calculateAscendantLongitude(
  lstHours: number,
  latitude: number,
  obliquity: number
): number {
  const lstDegrees = lstHours * 15.0;
  const lstRad = (lstDegrees * Math.PI) / 180.0;
  const latRad = (latitude * Math.PI) / 180.0;
  const oblRad = (obliquity * Math.PI) / 180.0;

  const numerator = Math.cos(lstRad);
  const denominator = -Math.sin(lstRad) * Math.cos(oblRad) + Math.tan(latRad) * Math.sin(oblRad);

  let ascRad = Math.atan2(numerator, denominator);
  let ascDegrees = (ascRad * 180.0) / Math.PI;

  if (ascDegrees < 0) ascDegrees += 360.0;
  return ascDegrees;
}

/**
 * Get the Lagna (ascendant) for a given time and location.
 * 
 * Overall procedure to identify the rising Rashi (sign).
 * 
 * @param ahargana Current day count
 * @param latitude Observer latitude
 * @param longitude Observer longitude
 * @returns Detailed Lagna information including Rashi index and name
 */
export function getLagna(ahargana: number, latitude: number, longitude: number): LagnaInfo {
  const lst = calculateLocalSiderealTime(ahargana, longitude);
  const obliquityDegrees = (Math.asin(SINE_MAX_DECLINATION / RADIUS) * 180.0) / Math.PI;
  const ascLong = calculateAscendantLongitude(lst, latitude, obliquityDegrees);

  const rashiIndex = Math.floor(ascLong / 30.0) + 1;
  const degreeInRashi = ascLong % 30.0;

  const rashiNames = [
    "Mesha (Aries)", "Vrishabha (Taurus)", "Mithuna (Gemini)",
    "Karka (Cancer)", "Simha (Leo)", "Kanya (Virgo)",
    "Tula (Libra)", "Vrishchika (Scorpio)", "Dhanus (Sagittarius)",
    "Makara (Capricorn)", "Kumbha (Aquarius)", "Meena (Pisces)"
  ];

  return {
    rashiIndex: Math.min(rashiIndex, 12),
    rashiName: rashiNames[Math.min(rashiIndex - 1, 11)],
    degreeInRashi,
    absoluteDegree: ascLong,
    localSiderealTime: lst,
    latitude,
    longitude,
  };
}
