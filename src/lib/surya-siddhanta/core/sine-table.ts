/**
 * Surya-Siddhanta Trigonometry (Sine Table)
 * =========================================
 * 
 * Implements the 24 sine values (Jya) and interpolation logic derived
 * from Chapter II (True Places of the Planets).
 * 
 * [Ch. II, v.15-22]
 *
 * <details class="siddhantic-proof">
 * <summary>Siddhantic Proof: Spashta (True Longitudes) v.15</summary>
 *
 * **Sanskrit (Devanagari):**
 *
 * चतुर्विंशतिधा चक्रे ज्यार्धारिण पृथक्पृथक् । तानि पञ्चविंशतियुक्तानि त्रीणि शतानि च ॥
 *
 * **Translation (Burgess):**
 *
 * Divide the quadrant of the circle into 24 parts... the first sine is 225 minutes.
 *
 * **Modern Technical Commentary:**
 *
 * Establishes the 24-point Sine table (Jya). The interval is 225' (3° 45'), chosen because in a circle where R = 3438', the arc of 225' is approximately equal to its sine.
 *
 * </details>
 * The definition of the 24-point Sine table.
 */

import { RADIUS } from './constants';

/** 
 * [Ch. II, v.15]
 *
 * <details class="siddhantic-proof">
 * <summary>Siddhantic Proof: Spashta (True Longitudes) v.15</summary>
 *
 * **Sanskrit (Devanagari):**
 *
 * चतुर्विंशतिधा चक्रे ज्यार्धारिण पृथक्पृथक् । तानि पञ्चविंशतियुक्तानि त्रीणि शतानि च ॥
 *
 * **Translation (Burgess):**
 *
 * Divide the quadrant of the circle into 24 parts... the first sine is 225 minutes.
 *
 * **Modern Technical Commentary:**
 *
 * Establishes the 24-point Sine table (Jya). The interval is 225' (3° 45'), chosen because in a circle where R = 3438', the arc of 225' is approximately equal to its sine.
 *
 * </details>
 * Arc increment between table entries (225').
 * Traditionally called "the eighth part of the minutes of a sign".
 */
export const ARC_INCREMENT_MIN = 225.0;

/**
 * The base sine values (Jya) for every 3°45' (225') of arc.
 * 
 * [Ch. II, v.17-22] Numerical values for the R=3438 sine table.
 */
export const SINE_TABLE: number[] = [
  225,  // [v.17] sin(3°45')
  449,  // [v.17] sin(7°30')
  671,  // [v.17] sin(11°15')
  890,  // [v.18] sin(15°)
  1105, // [v.18] sin(18°45')
  1315, // [v.18] sin(22°30')
  1520, // [v.19] sin(26°15')
  1719, // [v.19] sin(30°)
  1910, // [v.19] sin(33°45')
  2093, // [v.20] sin(37°30')
  2267, // [v.20] sin(41°15')
  2431, // [v.20] sin(45°)
  2585, // [v.21] sin(48°45')
  2728, // [v.21] sin(52°30')
  2859, // [v.21] sin(56°15')
  2978, // [v.22] sin(60°)
  3084, // [v.22] sin(63°45')
  3177, // [v.22] sin(67°30')
  3256, // [v.22] sin(71°15')
  3321, // [v.22] sin(75°)
  3372, // [v.22] sin(78°45')
  3409, // [v.22] sin(82°30')
  3431, // [v.22] sin(86°15')
  3438, // [v.22] sin(90°) = Full Radius (Trijya)
];

/**
 * Calculate the Indian Sine (Jya) for a given angle.
 * 
 * [Ch. II, v.15-22]
 *
 * <details class="siddhantic-proof">
 * <summary>Siddhantic Proof: Spashta (True Longitudes) v.15</summary>
 *
 * **Sanskrit (Devanagari):**
 *
 * चतुर्विंशतिधा चक्रे ज्यार्धारिण पृथक्पृथक् । तानि पञ्चविंशतियुक्तानि त्रीणि शतानि च ॥
 *
 * **Translation (Burgess):**
 *
 * Divide the quadrant of the circle into 24 parts... the first sine is 225 minutes.
 *
 * **Modern Technical Commentary:**
 *
 * Establishes the 24-point Sine table (Jya). The interval is 225' (3° 45'), chosen because in a circle where R = 3438', the arc of 225' is approximately equal to its sine.
 *
 * </details>
 * Calculation of the intermediate Jya using interpolation.
 * 
 * @param angleDeg Angle in degrees (will be normalized to 0-360)
 * @returns The Jya value (R × sin(θ)), signed for quadrants 3 and 4
 */
export function getJya(angleDeg: number): number {
  // Normalize angle to 0-360 range
  let normalizedAngle = angleDeg % 360.0;
  if (normalizedAngle < 0) normalizedAngle += 360.0;

  // Determine quadrant and calculate remainder
  const quadrant = Math.floor(normalizedAngle / 90.0);
  const remainderDeg = normalizedAngle % 90.0;

  // Apply quadrant symmetry
  let effAngle: number;
  if (quadrant === 0) {
    effAngle = remainderDeg;
  } else if (quadrant === 1) {
    effAngle = 90.0 - remainderDeg;
  } else if (quadrant === 2) {
    effAngle = remainderDeg;
  } else { // quadrant === 3
    effAngle = 90.0 - remainderDeg;
  }

  // Sine is negative in quadrants 3 and 4 (180°-360°)
  const sign = quadrant >= 2 ? -1.0 : 1.0;

  // Convert angle from degrees to arc-minutes (Lipta)
  const angleMin = effAngle * 60.0;

  // Find position in sine table
  const indexFloat = angleMin / ARC_INCREMENT_MIN;
  const index = Math.floor(indexFloat);

  // Handle edge case: angle is exactly 90°
  if (index >= 24) {
    return sign * SINE_TABLE[23];
  }

  // Linear interpolation between table values
  const valBase = index === 0 ? 0.0 : SINE_TABLE[index - 1];
  const valNext = SINE_TABLE[index];

  const fraction = indexFloat - index;
  const interpolatedVal = valBase + fraction * (valNext - valBase);

  return sign * interpolatedVal;
}

/**
 * Calculate the Indian Cosine (Kotijya).
 * 
 * [Ch. II] Kotijya(θ) = Jya(90° - θ) = R × cos(θ)
 * 
 * @param angleDeg Angle in degrees
 * @returns The Kotijya value (R × cos(θ))
 */
export function getKojya(angleDeg: number): number {
  return getJya(90.0 - angleDeg);
}

/**
 * Calculate the arc (Capa) in degrees for a given Jya value.
 * 
 * Note: The traditional text describes find the arc by reversing the table
 * lookup (inverse interpolation). This function uses Math.asin for 
 * computational precision while adhering to the R=3438 baseline.
 * 
 * @param jyaVal The Jya value (R × sin(θ))
 * @returns Angle in degrees (0° to 90° range for positive input)
 */
export function inverseJya(jyaVal: number): number {
  let ratio = jyaVal / RADIUS;
  ratio = Math.max(-1.0, Math.min(1.0, ratio));
  return (Math.asin(ratio) * 180.0) / Math.PI;
}
