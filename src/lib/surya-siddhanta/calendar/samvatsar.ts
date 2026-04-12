/**
 * Siddhantic Samvatsara (60-Year Jupiter Cycle)
 * ============================================
 * 
 * Implements the calculation of the 60-year Jovian cycle, known as the 
 * Barhaspatya Mana (Measure of Jupiter).
 * 
 * [Ch. I, v.55] Defines the mathematical procedure for calculating 
 * the current Jovian year based on Jupiter's revolutions.
 * [Ch. XIV, v.17] Technically defines the Jupiter year (Samvatsara) 
 * as the time taken for a mean transit across one zodiacal sign (~361 days).
 */

import { SAMVATSARA_NAMES } from './names';
import { DAYS_PER_MAHAYUGA, REV_JUPITER } from '../core/constants';

/**
 * Get the South Indian (Solar/Shaka-based) Samvatsar.
 * 
 * A luni-solar adaptation of the 60-year cycle where years are 
 * synchronized with the solar calendar (beginning at Chaitra Sukla). 
 * This system prevents 'skipped' years and is dominant in the 
 * Southern states of India.
 * 
 * @param shakaYear Current Shaka year (e.g., 1946)
 * @returns Object with index (1-60) and the traditional name (e.g., 'Krodhi')
 */
export function getSouthSamvatsar(shakaYear: number): { index: number; name: string } {
  // Traditional South offset: (Shaka + 11) % 60 provides parity.
  const idx = (shakaYear + 11) % 60;
  return {
    index: idx + 1,
    name: SAMVATSARA_NAMES[idx]
  };
}

/**
 * Get the North Indian (Jupiter-based) Samvatsar.
 * 
 * [Ch. I, v.55] Calculates the 'canonical' Jovian year based strictly 
 * on Jupiter's mean motion.
 * 
 * Algorithm:
 * 1. Calculate total elapsed revolutions of Jupiter.
 * 2. Multiply by 12 to find the total elapsed signs (each sign = 1 year).
 * 3. [Ch. I, v.55] Anchor to the 'Vijaya' year at the start of the cycle.
 * 
 * NOTE: Because a Jovian year is ~4 days shorter than a solar year, 
 * this system occasionally 'skips' a solar year (Kshaya Samvatsara).
 * 
 * @param ahargana Current Ahargana (civil days elapsed since epoch)
 * @returns Detailed result including index, name, and fractional progress
 */
export function getNorthSamvatsar(ahargana: number): { index: number; name: string; fraction: number; rawCount: number; label: string } {
  // Epoch anchoring: Days from Kali Yuga start to the current Ahargana.
  const daysSinceKali = ahargana; 
  const totalRevs = (daysSinceKali * REV_JUPITER) / DAYS_PER_MAHAYUGA;
  const totalSamvatsars = totalRevs * 12;
  
  // [Ch. I, v.55] Anchor to Vijaya (the 27th name in the list of 60).
  const samvatsarIndex = (Math.floor(totalSamvatsars) + 26) % 60;
  
  return {
    index: samvatsarIndex + 1,
    name: SAMVATSARA_NAMES[samvatsarIndex],
    fraction: totalSamvatsars % 1,
    rawCount: Math.floor(totalSamvatsars),
    label: "Pure Surya Siddhanta (Mean Motion)"
  };
}
