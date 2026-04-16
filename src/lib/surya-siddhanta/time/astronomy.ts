/**
 * Siddhantic General Astronomy Utilities
 * ======================================
 * 
 * Provides foundational logic for anchoring astronomical time to the 
 * local civil day (Savana-dina).
 * 
 * [Ch. XIV, v.18-19]
 *
 * <details class="siddhantic-proof">
 * <summary>Siddhantic Proof: Manadhya (Systems of Measurement) v.18</summary>
 *
 * **Sanskrit (Devanagari):**
 *
 * उदयादुदयं भानोः सावनं तत्‌ प्रकीर्तितम्‌।
 *
 * **Translation (Burgess):**
 *
 * The time from one sunrise to the next is designated as a Savana (civil) day.
 *
 * **Modern Technical Commentary:**
 *
 * Defines the fundamental civil day. This sunrise-to-sunrise period is the basis for determining the weekday (Vara), the planetary hours (Hora), and the divisions used in Muhurta calculations like Choghadia.
 *
 * </details>
 * Establishes the 'Savana-dina' as the terrestrial 
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
 * [Ch. XIV, v.18]
 *
 * <details class="siddhantic-proof">
 * <summary>Siddhantic Proof: Manadhya (Systems of Measurement) v.18</summary>
 *
 * **Sanskrit (Devanagari):**
 *
 * उदयादुदयं भानोः सावनं तत्‌ प्रकीर्तितम्‌।
 *
 * **Translation (Burgess):**
 *
 * The time from one sunrise to the next is designated as a Savana (civil) day.
 *
 * **Modern Technical Commentary:**
 *
 * Defines the fundamental civil day. This sunrise-to-sunrise period is the basis for determining the weekday (Vara), the planetary hours (Hora), and the divisions used in Muhurta calculations like Choghadia.
 *
 * </details>
 * In the Surya-Siddhanta, a civil day (Savana-dina) begins 
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
