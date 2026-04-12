/**
 * Siddhantic General Astronomy Utilities
 * ======================================
 * 
 * Provides foundational logic for anchoring astronomical time to the 
 * local civil day (Savana-dina).
 * 
 * [Ch. XIV, v.18-19] Establishes the 'Savana-dina' as the terrestrial 
 * day measured from sunrise to sunrise, which serves as the boundary 
 * for the 'Vara' (weekday).
 */

/**
 * Get the weekday (Vara) for a given Gregorian date.
 * 
 * [Ch. I, v.52] The regents of the days (weekdays) follow the specific 
 * order of the planets (Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn). 
 * The vāra is authoritatively determined by the remainder of the 
 * Ahargana (Sum of Days) when divided by seven.
 * 
 * @param date Modern Date or ISO string
 * @returns Weekday index (0=Ravivara/Sun, 1=Somavara/Moon, etc.)
 */
export function getWeekdayFromDate(date: Date | string): number {
  const d = new Date(date);
  // Standard JS: 0 (Sun) - 6 (Sat)
  return d.getDay();
}

/**
 * Standardize Ahargana anchor for daily Panchanga elements.
 * 
 * [Ch. XIV, v.18] In the Surya-Siddhanta, a civil day (Savana-dina) begins 
 * at the moment of local sunrise. To find the 'Elements for the Day', 
 * we must identify the state of the planets at this exact moment 
 * (Udaya-kaala).
 * 
 * @param ahargana Current decimal day count
 * @param sunriseHours Hours past midnight of local sunrise
 * @returns The integer Ahargana corresponding to the start of the Vedic day
 */
export function getSunriseAhargana(ahargana: number, sunriseHours: number): number {
  // Aligning the continuous day-count to the discrete sunrise-to-sunrise boundary.
  return Math.floor(ahargana - (sunriseHours / 24.0) + 0.0001);
}
