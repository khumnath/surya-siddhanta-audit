/**
 * Samvatsara (60-Year Jupiter Cycle)
 * =================================
 * 
 * Implements the calculation of the 60-year Jovian cycle, known as the 
 * Barhaspatya Mana. 
 * 
 * [Ch. XIV, v.17] A year of Jupiter is the time during which he 
 * traverses one Rashi (30°) of the zodiac by his mean motion.
 */

import { SAMVATSARA_NAMES } from './names';
import { DAYS_PER_MAHAYUGA, REV_JUPITER } from '../core/constants';

/**
 * Get the South Indian (Solar/Shaka-based) Samvatsar.
 * 
 * This system uses a continuous cycle of 60 years tied to the 
 * Luni-solar calendar, avoiding the "lost" (Kshaya) years common 
 * in the Jupiter-motion system.
 * 
 * @param kaliYear Current lunar Kali year
 * @returns Object with index (1-60) and name
 */
export function getSouthSamvatsar(kaliYear: number): { index: number; name: string } {
  // Traditional offset: Kali year + 13 matches the South cycle
  const idx = (kaliYear + 13) % 60;
  return {
    index: idx + 1,
    name: SAMVATSARA_NAMES[idx]
  };
}

/**
 * Get the North Indian (Jupiter-based) Samvatsar.
 * 
 * [Ch. XIV, v.1-2, 17] Calculated strictly from Jupiter's mean motion. 
 * Because a Jupiter year is shorter than a solar year, a Samvatsar is 
 * occasionally "dropped" (Kshaya) to maintain synchronization.
 * 
 * @param ahargana Current day count
 * @returns Object with index (1-60), name, and elapsed fraction of current year
 */
export function getNorthSamvatsar(ahargana: number): { index: number; name: string; fraction: number } {
  // Total mean revolutions of Jupiter since epoch
  const totalRevs = (ahargana * REV_JUPITER) / DAYS_PER_MAHAYUGA;
  
  // 12 Samvatsars (years) per revolution
  const totalSamvatsars = totalRevs * 12;
  
  // Traditional offset: At the start of Kali Yuga, the year was Vijaya (27th year)
  const idx = (Math.floor(totalSamvatsars) + 26) % 60;
  const fraction = totalSamvatsars - Math.floor(totalSamvatsars);
  
  return {
    index: idx + 1,
    name: SAMVATSARA_NAMES[idx],
    fraction
  };
}

