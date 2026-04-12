/**
 * Siddhantic Transit and Boundary Finder (Sankranti-vicara)
 * ========================================================
 * 
 * Utilities for locating the transitions of solar, lunar, and planetary 
 * cycles. In the Surya Siddhanta, boundaries (Sankrantis) are the 
 * primary markers for the adoption of names and eras.
 * 
 * [Ch. XIV, v.7-11] Defines the 'Sankranti' (solar transit) as the moment the 
 * Sun enters a new zodiacal sign (Rashi), marking the start of a solar month.
 * [Ch. I, v.55] Establishes the boundary for Jovian years (Samvatsara).
 */

import { DAYS_PER_MAHAYUGA, REV_JUPITER } from '../core/constants';
import { aharganaToDateTime } from '../time/conversions';
import { KATHMANDU } from '../geography/location';
import { getNorthSamvatsar, getSouthSamvatsar } from './samvatsar';
import { ModernPanchangaEngine } from '../../modern/modern-engine';

/**
 * Calculates the exact Ahargana when the current Siddhantic Mean Samvatsara started.
 * 
 * [Ch. I, v.55] Uses the mean motion of Jupiter to find the precise moment 
 * it entered its current mean 30-degree sign.
 * 
 * @param ahargana Current day count (decimal)
 * @returns Ahargana of the most recent mean Jupiter ingress.
 */
export function findSSMeanTransitAhargana(ahargana: number): number {
  const totalRevs = (ahargana * REV_JUPITER) / DAYS_PER_MAHAYUGA;
  const totalSamvatsars = totalRevs * 12;
  const fraction = totalSamvatsars - Math.floor(totalSamvatsars);
  const samvatsarLengthDays = DAYS_PER_MAHAYUGA / (REV_JUPITER * 12);
  
  return ahargana - (fraction * samvatsarLengthDays);
}

/**
 * Stably identifies a Lunar New Month boundary (Shukla Pratipada).
 * 
 * [Ch. XIV, v.1-3] Traditional lunar months are named after the solar 
 * transit (Sankranti) that occurs within them. This function finds 
 * the Shukla Pratipada (1st Tithi) that marks the start of the 
 * lunar month preceding a scan date.
 * 
 * @param ahargana Day count to scan from
 * @param targetRashi The target solar sign (e.g., 11 for Chaitra/Meena)
 * @returns Ahargana of the preceding lunar boundary.
 */
export function findPrecedingLunarBoundary(ahargana: number, targetRashi: number): number {
  // Scan forward from a safe distance looking for the Tithi/Rashi signature.
  let currentAhar = Math.floor(ahargana - 400); 
  
  let foundBoundary = 0;
  for (let d = 0; d < 450; d++) {
    if (currentAhar > ahargana) break;

    const checkDate = aharganaToDateTime(currentAhar, KATHMANDU).toJSDate();
    const el = ModernPanchangaEngine.getElements(checkDate, 'Chitrapaksha (Lahiri)');
    const rashi = Math.floor(el.siderealSun / 30);
    
    // Check for Shukla Pratipada (index 1) in the correct solar sign.
    if (rashi === targetRashi) {
      if (el.tithiIdx === 1) {
         const prevDate = new Date(checkDate);
         prevDate.setDate(prevDate.getDate() - 1);
         const prevEl = ModernPanchangaEngine.getElements(prevDate, 'Chitrapaksha (Lahiri)');
         
         if (prevEl.tithiIdx >= 28) {
            foundBoundary = currentAhar - 1;
         } else {
            foundBoundary = currentAhar - 1;
         }
      } else if (el.tithiIdx === 0) {
         foundBoundary = currentAhar;
      }
    }
    
    currentAhar++;
  }
  
  return foundBoundary || ahargana;
}

/**
 * Identifies the Yugadi (Chaitra Shukla Pratipada) boundary.
 * 
 * The formal beginning of the lunar year, calculated as the first Tithi 
 * of the lunar month when the Sun is in the sign of Pisces (Meena/11).
 */
export function findPrecedingYugadiAhargana(ahargana: number): number {
  return findPrecedingLunarBoundary(ahargana, 11);
}

/**
 * Identifies the Nepal Sambat (Kartik Shukla Pratipada) boundary.
 * 
 * Boundary of the Nepal Samvat era, starting when the Sun is in 
 * the sign of Libra (Tula/6).
 */
export function findPrecedingNepalSambatAhargana(ahargana: number): number {
  return findPrecedingLunarBoundary(ahargana, 6);
}

/**
 * Identifies the North Indian Samvatsara name for the current year.
 * 
 * Adoption Rule: The Jovian name active at the moment of the 
 * lunar New Year (Yugadi) is assigned to the entire ensuing year.
 */
export function getNorthCivilSamvatsar(ahargana: number): string {
  const yugadi = findPrecedingYugadiAhargana(ahargana);
  const ss = getNorthSamvatsar(yugadi);
  return ss.name;
}

/**
 * Identifies the South Indian Samvatsara name for the current year.
 * 
 * Adoption Rule: Uses the Salivahana Shaka era count at the moment 
 * of Yugadi to index the 60-year cycle.
 */
export function getSouthCivilSamvatsar(ahargana: number): string {
  const yugadi = findPrecedingYugadiAhargana(ahargana);
  const dt = aharganaToDateTime(yugadi, KATHMANDU);
  
  // Salivahana Shaka epoch correction.
  const shaka = dt.year - 78;
  
  return getSouthSamvatsar(shaka).name;
}

/**
 * Calculates when the current Siddhantic Mean Samvatsara ends.
 */
export function findNextSSMeanTransitAhargana(ahargana: number): number {
  const samvatsarLengthDays = DAYS_PER_MAHAYUGA / (REV_JUPITER * 12);
  const start = findSSMeanTransitAhargana(ahargana);
  return start + samvatsarLengthDays;
}

/**
 * Returns the name of the next mean transit based Samvatsara.
 */
export function getSSNextSamvatsarName(ahargana: number): string {
  const nextStart = findNextSSMeanTransitAhargana(ahargana);
  const next = getNorthSamvatsar(nextStart + 1);
  return next.name;
}

/**
 * Returns the name of the modern Jupiter Samvatsar following the current one.
 */
export function getModernNextSamvatsarName(date: Date, ayanamsha: string): string {
  const nextIngress = ModernPanchangaEngine.findNextJupiterIngress(date, ayanamsha);
  const nextDate = new Date(nextIngress.getTime() + 86400000);
  const elements = ModernPanchangaEngine.getElements(nextDate, ayanamsha);
  return elements.modernSamvatsarName;
}

/**
 * Predicts the next name in the standard 60-year sequence.
 */
import { SAMVATSARA_NAMES } from './names';
export function getNextSamvatsarName(currentName: string): string {
  const idx = SAMVATSARA_NAMES.indexOf(currentName);
  if (idx === -1) return "Unknown";
  return SAMVATSARA_NAMES[(idx + 1) % 60];
}

/**
 * Descriptive formatting of an Ahargana boundary into a date string.
 */
export function formatAharganaDate(ahargana: number): string {
  const dt = aharganaToDateTime(ahargana, KATHMANDU);
  return dt.toFormat("MMM d, yyyy");
}
