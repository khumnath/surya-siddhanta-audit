/**
 * Siddhantic Moon Calculations (Chandra-spashti)
 * =============================================
 * 
 * Implements the calculation of the True Longitude of the Moon (Candrasphuta).
 * 
 * [Ch. II, v.38]
 *
 * <details class="siddhantic-proof">
 * <summary>Siddhantic Proof: Spashta (True Longitudes) v.38</summary>
 *
 * **Sanskrit (Devanagari):**
 *
 * ओजयुग्मान्तरगुणा भुजज्या त्रिज्ययोद्धृता। युग्मवृत्ते धनर्णं स्यादोजादूनेऽधिके स्फुटम्॥
 *
 * **Translation (Burgess):**
 *
 * The difference of the epicycles of the odd and even quadrants, multiplied by the sine of the anomaly and divided by the radius, is additive to or subtractive from the even epicycle.
 *
 * **Modern Technical Commentary:**
 *
 * Implements 'Epicyclic Contraction'. The Siddhanta recognizes that the solar and lunar epicycles are not fixed circles but vary slightly in size depending on the planet's position. This specific formula calculates the 'Corrected Circumference' used for the Equation of the Center.
 *
 * </details>
 * Defines the lunar epicycles (Manda-vritta) as the largest 
 * in the system, varying between 32° and 31° 40'.
 * [Ch. I, v.33] Establishes that the Moon's apogee (Mandocca) is a moving 
 * point with its own revolution count, unlike the Sun's fixed apogee.
 * [Ch. II, v.39]
 *
 * <details class="siddhantic-proof">
 * <summary>Siddhantic Proof: Spashta (True Longitudes) v.39</summary>
 *
 * **Sanskrit (Devanagari):**
 *
 * तद्गुणे भुजकोटिज्ये भगणांशविभाजिते। तद्भुजज्याफलधनुर्मान्दं लिप्तादिकं फलम्॥
 *
 * **Translation (Burgess):**
 *
 * Multiply the sine of the anomaly (Kendra-jya) by the epicycle and divide by 360; the arc of the result is the Manda-correction (Equation of the Center).
 *
 * **Modern Technical Commentary:**
 *
 * The fundamental formula for the Equation of the Center. It transforms the mean eccentricity into a longitudinal correction (Phala) using a sine-wave model. This represents the Sun's non-uniform motion as seen from Earth.
 *
 * </details>
 * Applies the 'Manda-phala' (Equation of the Center) to 
 * reconcile mean lunar motion with observable position.
 */

import { Body, calculateMeanLongitude } from './mean_motions';
import { RADIUS } from '../core/constants';
import { getJya, inverseJya } from '../core/sine-table';

/** 
 * Lunar epicycle circumferences (Manda-paridhi).
 * 
 * [Ch. II, v.38]
 *
 * <details class="siddhantic-proof">
 * <summary>Siddhantic Proof: Spashta (True Longitudes) v.38</summary>
 *
 * **Sanskrit (Devanagari):**
 *
 * ओजयुग्मान्तरगुणा भुजज्या त्रिज्ययोद्धृता। युग्मवृत्ते धनर्णं स्यादोजादूनेऽधिके स्फुटम्॥
 *
 * **Translation (Burgess):**
 *
 * The difference of the epicycles of the odd and even quadrants, multiplied by the sine of the anomaly and divided by the radius, is additive to or subtractive from the even epicycle.
 *
 * **Modern Technical Commentary:**
 *
 * Implements 'Epicyclic Contraction'. The Siddhanta recognizes that the solar and lunar epicycles are not fixed circles but vary slightly in size depending on the planet's position. This specific formula calculates the 'Corrected Circumference' used for the Equation of the Center.
 *
 * </details>
 * The Moon's epicycle is 32° at the quadrants 
 * and contracts to 31° 40' at the apsides. This large size 
 * reflects the Moon's rapid and complex orbital variation.
 */
export const MANDA_CIRCUMFERENCE_MOON_EVEN = 32.0;
export const MANDA_CIRCUMFERENCE_MOON_ODD = 31.0 + (40.0 / 60.0);

/**
 * Calculate the dynamically corrected epicycle circumference for the Moon.
 * 
 * [Ch. II, v.38]
 *
 * <details class="siddhantic-proof">
 * <summary>Siddhantic Proof: Spashta (True Longitudes) v.38</summary>
 *
 * **Sanskrit (Devanagari):**
 *
 * ओजयुग्मान्तरगुणा भुजज्या त्रिज्ययोद्धृता। युग्मवृत्ते धनर्णं स्यादोजादूनेऽधिके स्फुटम्॥
 *
 * **Translation (Burgess):**
 *
 * The difference of the epicycles of the odd and even quadrants, multiplied by the sine of the anomaly and divided by the radius, is additive to or subtractive from the even epicycle.
 *
 * **Modern Technical Commentary:**
 *
 * Implements 'Epicyclic Contraction'. The Siddhanta recognizes that the solar and lunar epicycles are not fixed circles but vary slightly in size depending on the planet's position. This specific formula calculates the 'Corrected Circumference' used for the Equation of the Center.
 *
 * </details>
 * Implements the rule of epicyclic contraction for the Moon.
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
 * [Ch. II, v.39, 45]
 *
 * <details class="siddhantic-proof">
 * <summary>Siddhantic Proof: Spashta (True Longitudes) v.39</summary>
 *
 * **Sanskrit (Devanagari):**
 *
 * तद्गुणे भुजकोटिज्ये भगणांशविभाजिते। तद्भुजज्याफलधनुर्मान्दं लिप्तादिकं फलम्॥
 *
 * **Translation (Burgess):**
 *
 * Multiply the sine of the anomaly (Kendra-jya) by the epicycle and divide by 360; the arc of the result is the Manda-correction (Equation of the Center).
 *
 * **Modern Technical Commentary:**
 *
 * The fundamental formula for the Equation of the Center. It transforms the mean eccentricity into a longitudinal correction (Phala) using a sine-wave model. This represents the Sun's non-uniform motion as seen from Earth.
 *
 * </details>
 * Core Algorithm:
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
