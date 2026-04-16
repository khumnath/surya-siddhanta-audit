/**
 * Siddhantic Sun Calculations (Surya-spashti)
 * ==========================================
 * 
 * Implements the calculation of the True Longitude of the Sun (Ravisphuta).
 * 
 * [Ch. II, v.2]
 *
 * <details class="siddhantic-proof">
 * <summary>Siddhantic Proof: Spashta (True Longitudes) v.2</summary>
 *
 * **Sanskrit (Devanagari):**
 *
 * अंशाः सूर्यादियुग्मान्ते मन्दोच्चानां यथाक्रमम्। अशीतिः सप्ततिः षष्टिस्ततश्च त्र्याश्विनः खषट्॥
 *
 * **Translation (Burgess):**
 *
 * The degrees of the apogees (Mandocca) of the Sun and the others are: 80°, 70°, 60°, 223°, 160°...
 *
 * **Modern Technical Commentary:**
 *
 * Sets the fixed position of the Sun's apogee at 80 degrees (Gemini), which is the zero-point for calculating the mean anomaly (Kendra).
 *
 * </details>
 * Establishes the fixed apogee (Mandocca) of the Sun at 80°.
 * [Ch. II, v.14-16] Defines 'Spashti-karana' (correction process) to find 
 * the observable position.
 * [Ch. II, v.38-39]
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
 * Describes the Sun's Equation of the Center (Manda-phala) 
 * and the contraction of its epicycle (Manda-vritta).
 */

import { Body, calculateMeanLongitude } from './mean_motions';
import { APOGEE_SUN, RADIUS } from '../core/constants';
import { getJya, inverseJya } from '../core/sine-table';

/** 
 * Solar epicycle circumferences (Manda-paridhi).
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
 * The Surya-Siddhanta defines solar epicycles as 
 * pulsatory: they are 14° at the quadrants (Vishuvat) and 
 * contract to 13° 40' at the apsides.
 */
export const MANDA_CIRCUMFERENCE_SUN_EVEN = 14.0;
export const MANDA_CIRCUMFERENCE_SUN_ODD = 13.0 + (40.0 / 60.0);

/**
 * Calculate the dynamically corrected epicycle circumference for the Sun.
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
 * Implements the rule of epicyclic contraction. The 
 * circumference varies linearly with the sine of the anomaly (Kendra-jya).
 * 
 * @param kendra The mean anomaly in degrees
 * @returns The precise circumference for the current anomaly
 */
export function getVariableCircumferenceSun(kendra: number): number {
  const jya = Math.abs(getJya(kendra));
  const diff = MANDA_CIRCUMFERENCE_SUN_EVEN - MANDA_CIRCUMFERENCE_SUN_ODD;
  const correction = (diff * jya) / RADIUS;
  return MANDA_CIRCUMFERENCE_SUN_EVEN - correction;
}

/**
 * Calculate the Sun's Mean Anomaly (Manda Kendra).
 * 
 * [Ch. II, v.29] Specifically defined as the distance of the mean 
 * planet from its apogee (Mean Position - Apogee).
 * 
 * @param ahargana Current day count
 * @returns Mean anomaly in degrees [0, 360)
 */
export function calculateMeanAnomalySun(ahargana: number): number {
  const meanSun = calculateMeanLongitude(Body.SUN, ahargana);
  let anomaly = (meanSun - APOGEE_SUN) % 360.0;
  if (anomaly < 0) anomaly += 360.0;
  return anomaly;
}

/**
 * Calculate the True Longitude (Spashta-Surya) of the Sun.
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
 * 1. Calculate the Sine of the Anomaly (Kendra-jya).
 * 2. Resulting Phala (Equation of Center) = (Kendra-jya * Epicycle) / 360.
 * 3. Apply the correction to the Mean Sun based on the Kendra half-orbit.
 * 
 * @param ahargana Current day count
 * @returns True solar longitude (Ravisphuta) in degrees [0, 360)
 */
export function calculateTrueLongitudeSun(ahargana: number): number {
  const meanSun = calculateMeanLongitude(Body.SUN, ahargana);
  let kendra = (meanSun - APOGEE_SUN) % 360.0;
  if (kendra < 0) kendra += 360.0;

  const sinKendra = getJya(kendra);
  const circumference = getVariableCircumferenceSun(kendra);
  
  // Siddhantic Rule: Result = (Paridhi * Jya) / 360 (expressed as an arc)
  const term = (circumference / 360.0) * sinKendra;
  const correctionDeg = inverseJya(term);

  let trueSun: number;
  // [Ch. II, v.45] Apply Manda-phala: Negative in 1st/2nd quadrants, 
  // Positive in 3rd/4th.
  if (kendra < 180.0) {
    trueSun = meanSun - correctionDeg;
  } else {
    trueSun = meanSun + correctionDeg;
  }

  let result = trueSun % 360.0;
  if (result < 0) result += 360.0;
  return result;
}
