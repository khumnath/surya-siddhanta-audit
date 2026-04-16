/**
 * Siddhantic Geodesy and Spherical Astronomy (Gola-vicara)
 * ========================================================
 * 
 * Implements the mathematical relationships between the ecliptic 
 * and the local horizon for a given location, primarily for determining 
 * the length of the civil day (Dinamana).
 * 
 * [Ch. III, v.1-13]
 *
 * <details class="siddhantic-proof">
 * <summary>Siddhantic Proof: Tri-Prasna (Shadows & Direction) v.1</summary>
 *
 * **Sanskrit (Devanagari):**
 *
 * अम्बुसंशुद्धे जलवत्‌ समीकृते शिलाप्रदेशे ... तन्मध्ये द्वादशसंख्यकाङ्गुलानि स्थापयेत् ॥
 *
 * **Translation (Burgess):**
 *
 * On a stony surface made level as a mirror, describe a circle... at the center, place a gnomon twelve fingers high.
 *
 * **Modern Technical Commentary:**
 *
 * Defines the standard instrument for ancient observation: the **Shanku** (Gnomon). Its 12-digit height is universal in Siddhantic math, establishing a fixed unit for trigonometric shadow-to-angle conversions (cotangent relation).
 *
 * </details>
 * Establishes the use of the gnomon (Shanku) and 
 * its shadow for determining latitude (Aksha) and declination (Kranti).
 */

import { getJya, getKojya, inverseJya } from '../core/sine-table';
import { RADIUS } from '../core/constants';

/** 
 * [Ch. II, v.28] The Sine (Jya) of the maximum declination (24°).
 * 
 * In a radius of 3438, this value is canonically 1397, representing the 
 * extreme northern/southern deviation of the Sun at the solstices.
 */
export const SINE_MAX_DECLINATION = 1397.0;

/** 
 * [Ch. II, v.58] The obliquity of the ecliptic.
 * 
 * Calculated from the canonical sine of maximum declination (24.0°).
 */
export const OBLIQUITY_DEG = inverseJya(SINE_MAX_DECLINATION);

/**
 * The canonical gnomon length in digits (Angula).
 * 
 * [Ch. III, v.1]
 *
 * <details class="siddhantic-proof">
 * <summary>Siddhantic Proof: Tri-Prasna (Shadows & Direction) v.1</summary>
 *
 * **Sanskrit (Devanagari):**
 *
 * अम्बुसंशुद्धे जलवत्‌ समीकृते शिलाप्रदेशे ... तन्मध्ये द्वादशसंख्यकाङ्गुलानि स्थापयेत् ॥
 *
 * **Translation (Burgess):**
 *
 * On a stony surface made level as a mirror, describe a circle... at the center, place a gnomon twelve fingers high.
 *
 * **Modern Technical Commentary:**
 *
 * Defines the standard instrument for ancient observation: the **Shanku** (Gnomon). Its 12-digit height is universal in Siddhantic math, establishing a fixed unit for trigonometric shadow-to-angle conversions (cotangent relation).
 *
 * </details>
 * Dimensions of the 12-digit Shanku used as the 
 * fundamental unit for local height/shadow measurements.
 */
export const GNOMON_DIGITS = 12;

/**
 * Right ascension values for the twelve zodiac signs (Udayaprama).
 * 
 * [Ch. III, v.42-45]
 *
 * <details class="siddhantic-proof">
 * <summary>Siddhantic Proof: Tri-prasna (Direction, Place and Time) v.42</summary>
 *
 * **Sanskrit (Devanagari):**
 *
 * खागाष्टयोडर्धगोडगैकाः शरत््यङ्कहिमांशवः। मेषाल्लाकोदयासवः क्रमादेते प्रकीर्तिताः।।
 *
 * **Translation (Burgess):**
 *
 * 1670, 1795, and 1935 are, in order, the rising times (in respirations) of Aries, Taurus, and Gemini at the equator.
 *
 * **Modern Technical Commentary:**
 *
 * Defines the **Standard Right Ascension** for the first three signs. These values (1670, 1795, 1935 Pranas) are the basis for all local Lagna (Ascendant) calculations, representing the time it takes for each zodiac sign to rise at the Earth's equator.
 *
 * </details>
 * Describes the periods of rising at the equator 
 * in arc-minutes (Equivalent to Asu/Pranas).
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
 * [Ch. III, v.13]
 *
 * <details class="siddhantic-proof">
 * <summary>Siddhantic Proof: Tri-Prasna (Shadows & Direction) v.13</summary>
 *
 * **Sanskrit (Devanagari):**
 *
 * शङ्कुच्छायाहते त्रिज्ये विषुवत्कर्णभाजिते । लम्बाक्षज्ये तयोश्चापे लम्बाक्षौ दक्षिणौ सदा ॥
 *
 * **Translation (Burgess):**
 *
 * The sine of the latitude (Akshajya) is found from the equinoctial shadow... the arcs are the latitude and co-latitude.
 *
 * **Modern Technical Commentary:**
 *
 * The fundamental formula for **Geodesy**: `sin(latitude) = (Equinoctial Shadow * R) / Hypotenuse`. It converts the observed physical shadow at noon on the equinox into the observer's angular latitude (Aksha).
 *
 * </details>
 * The shadow of a 12-digit gnomon on the day of the 
 * equinox, representing the tangent of the location's latitude.
 * 
 * @param latitudeDeg Terrestrial latitude in degrees
 * @returns Equinoctial shadow in digits
 */
export function getGnomonShadowFromLatitude(latitudeDeg: number): number {
  const sinLat = getJya(latitudeDeg);
  const cosLat = getKojya(latitudeDeg);

  if (Math.abs(cosLat) < 1e-6) return Infinity;

  const tanLat = sinLat / cosLat;
  return GNOMON_DIGITS * tanLat;
}

/**
 * Calculate the Sun's declination (Kranti).
 * 
 * [Ch. II, v.28] The angular distance of the Sun from the equator 
 * is found by multiplying the sine of the Sun's longitude by the 
 * sine of maximum declination (obliquity).
 * 
 * @param longitude True Sidereal Longitude of the Sun
 * @returns Declination in degrees (North positive)
 */
export function calculateDeclination(longitude: number): number {
  const sinLong = getJya(longitude);
  const sinDecl = (sinLong * SINE_MAX_DECLINATION) / RADIUS;
  return inverseJya(sinDecl);
}

/**
 * Calculate the radius of the diurnal circle (Dyujya).
 * 
 * Represents the cosine of the declination in the Siddhantic 
 * radius of 3438.
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
 * [Ch. III, v.34-36]
 *
 * <details class="siddhantic-proof">
 * <summary>Siddhantic Proof: Tri-prasna (Direction, Place and Time) v.34</summary>
 *
 * **Sanskrit (Devanagari):**
 *
 * त्रिज्योदक्चरजायुक्ता याम्यायां तद्विवर्जिता। अन्त्या नतोत्क्रमज्योना स्वाहोरात्रार्दसङ्गुणा।। त्रिज्या भक्ता भवेच्छेदो लम्बज्याघ्नोऽथ भाजितः।।
 *
 * **Translation (Burgess):**
 *
 * The Radius increased by the Sine of ascensional difference in the north, and diminished by it in the south, is the 'antya'. This, diminished by the Sine of the hour-angle, and multiplied by the radius of the diurnal circle and divided by the Radius, is the 'cheda' (divisor).
 *
 * **Modern Technical Commentary:**
 *
 * Calculates the **Ascensional Difference (Cara)**. This is a critical correction in Indian astronomy that accounts for the difference between the local celestial horizon and the prime meridian (Lanka), determining the length of day and night for a given latitude.
 *
 * </details>
 * 'Cara' is the time difference between the semi-diurnal 
 * arc and a quadrant due to latitude. It is derived from 'Kujya' 
 * (earth-correction) and 'Carajya'.
 * 
 * @param declination Solar declination
 * @param latitude Observer's latitude
 * @returns Cara in Pranas (Time-units)
 */
export function calculateAscensionalDifference(declination: number, latitude: number): number {
  const sinLat = getJya(latitude);
  const tanLat = sinLat / getKojya(latitude);
  const equinoctialShadow = GNOMON_DIGITS * tanLat;

  const sinDecl = getJya(declination);
  /** [Ch. III, v.34] Kujya: The earth-correction sine */
  const kujya = (sinDecl * equinoctialShadow) / GNOMON_DIGITS;

  const dayRadius = getDayRadius(declination);
  /** [Ch. III, v.36] Carajya: The sine of the ascensional difference */
  const carajya = (kujya * RADIUS) / dayRadius;

  return inverseJya(carajya) * 60.0; 
}

/**
 * Calculate the length of the day (Dinamana).
 * 
 * [Ch. III, v.36]
 *
 * <details class="siddhantic-proof">
 * <summary>Siddhantic Proof: Tri-prasna (Direction, Place and Time) v.36</summary>
 *
 * **Sanskrit (Devanagari):**
 *
 * अभीष्टच्छाययाभ्यस्ता त्रिज्या तत्कर्णभाजिता। दृग्ज्या तद्र्गसंशुदधात्‌ त्रिज्यावर्गाच्च यत्‌ पदम्‌।।
 *
 * **Translation (Burgess):**
 *
 * The Radius multiplied by the desired shadow and divided by its hypotenuse is the Sine of altitude; from its square subtracted from the square of the Radius, the square root is the gnomon.
 *
 * </details>
 * The length of the day is 30 Ghatis increased or 
 * decreased by twice the Cara, depending on the Sun's Ayana (hemisphere).
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
  
  // Logical adoption for North latitudes (Day increases with North declination)
  return 30.0 + 2.0 * caraGhatis;
}

/**
 * Calculate local Sunrise and Sunset times.
 * 
 * Maps the traditional Dinamana calculation to modern civil hours 
 * relative to local solar noon (12:00).
 * 
 * @param sunLongitude True Sun longitude
 * @param latitude Observer's latitude
 * @returns Transition times in decimal hours
 */
export function calculateSunriseSunset(
  sunLongitude: number,
  latitude: number
): { sunrise: number; sunset: number; dayLengthHours: number } {
  const dayGhatis = calculateDayLength(sunLongitude, latitude);
  const dayLengthHours = (dayGhatis / 60.0) * 24.0;

  // Local solar noon is established as 12:00
  const sunrise = 12.0 - dayLengthHours / 2.0;
  const sunset = 12.0 + dayLengthHours / 2.0;

  return { sunrise, sunset, dayLengthHours };
}
