/**
 * Surya-Siddhanta Astronomical General Utilities
 * =============================================
 * 
 * Provides foundational logic for anchoring astronomical time to the 
 * local civil day (Savana-dina).
 */

/**
 * Get the weekday (Vara) for a given Date.
 * 
 * [Ch. I, v.52] The regents of the days (weekdays) follow the specific 
 * order of the planets (Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn). 
 * In the Vedic system, the weekday of the sunrise governs the entire 
 * period until the next sunrise.
 * 
 * @param date Modern Date or ISO string
 * @returns Weekday index (0-6, where 0 is Sunday/Ravivara)
 */
export function getWeekdayFromDate(date: Date | string): number {
  const d = new Date(date);
  // Standard JS: 0 (Sun) - 6 (Sat), which luckily matches the SS order.
  return d.getDay();
}

/**
 * Standardize Ahargana anchor for daily Panchanga elements.
 * 
 * In the Surya-Siddhanta, a civil day (Savana-dina) begins at the 
 * moment of local sunrise. This function ensures the integer day count 
 * is correctly aligned with the start of the Vedic day.
 * 
 * @param ahargana Current decimal day count
 * @param sunriseHours Hours past midnight of local sunrise
 * @returns The integer Ahargana corresponding to the start of the day
 */
export function getSunriseAhargana(ahargana: number, sunriseHours: number): number {
  // Subtracting the sunrise fraction identifies the Ahargana of the sunrise itself.
  return Math.floor(ahargana - (sunriseHours / 24.0) + 0.0001);
}
