/**
 * Surya-Siddhanta Utilities
 * =========================
 * 
 * Helper functions for angle normalization and sexagesimal conversions.
 * [Throughout] These utility functions support the mathematical baseline 
 * for all celestial calculations.
 */

/**
 * Normalize angle to [0, 360) range.
 * 
 * [Ch. I] This function implements the revolution (Bhagana) remainder 
 * logic. In Surya-Siddhanta, after calculating the total motion of a 
 * planet (Ahargana * Daily Motion), the whole circles are discarded 
 * to find the current position (Shesha). 
 * 
 * @param angleDeg Angle in degrees (any value)
 * @returns Normalized angle in degrees [0, 360)
 */
export function normalizeAngle(angleDeg: number): number {
  let normalized = angleDeg % 360.0;
  if (normalized < 0) normalized += 360.0;
  return normalized;
}

/**
 * Convert decimal degrees to Degrees, Minutes, Seconds.
 * 
 * [Ch. I, v.28] Implements the Sashti-vibhaga (sixty-fold division) system:
 * - 60 Vikala (Seconds) = 1 Kala (Minute)
 * - 60 Kala = 1 Amsha (Degree)
 * - 30 Amsha = 1 Rashi (Sign)
 * 
 * @param deg Decimal degrees
 * @returns Tuple of [degrees (Amsha), arcMinutes (Kala), arcSeconds (Vikala)]
 */
export function decimalToDms(deg: number): [number, number, number] {
  const d = Math.floor(deg);
  const rem = (deg - d) * 60.0;
  const m = Math.floor(rem);
  const s = (rem - m) * 60.0;
  return [d, m, s];
}

/**
 * Convert Degrees, Minutes, Seconds to decimal degrees.
 * 
 * [Ch. I, v.28] Supports calculations involving Lipta (Minutes) and 
 * Vikala (Seconds) as used throughout the Siddhanta.
 * 
 * @param d Degrees (Amsha)
 * @param m Arc-minutes (Kala/Lipta)
 * @param s Arc-seconds (Vikala)
 * @returns Decimal degrees
 */
export function dmsToDecimal(d: number, m: number, s: number): number {
  return d + m / 60.0 + s / 3600.0;
}
