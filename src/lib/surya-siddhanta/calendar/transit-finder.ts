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
import { aharganaToDateTime, dateTimeToAhargana } from '../time/conversions';
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
  // Ensure we check up to the end of the current civil day to capture transitions 
  // that happen after sunrise today.
  const dt = aharganaToDateTime(ahargana, KATHMANDU);
  const endOfDay = dt.set({ hour: 23, minute: 59, second: 59 }).toJSDate();
  
  // 1. Find the most recent New Moon (Tithi 0 boundary) before the end of today
  let currentNM = findModernLunarBoundary(endOfDay, 0, -1);
  
  // 2. Scan backwards looking for the NM where the Sun is in the target Rashi
  // We check up to 14 months to be safe (covers gaps/intercalary cases)
  for (let i = 0; i < 14; i++) {
    const el = ModernPanchangaEngine.getElements(currentNM, 'Chitrapaksha (Lahiri)');
    const rashi = Math.floor(el.siderealSun / 30);
    
    if (rashi === targetRashi) {
      // Return the floor of the transition Ahargana to represent the civil day
      const nmAhargana = dateTimeToAhargana(currentNM, KATHMANDU);
      return Math.floor(nmAhargana);
    }
    
    // Jump back 15 days and find preceding NM
    const prevDate = new Date(currentNM.getTime() - 15 * 86400000);
    currentNM = findModernLunarBoundary(prevDate, 0, -1);
  }
  
  return Math.floor(ahargana);
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

/**
 * Finds the exact Ahargana when the Sun enters a target sign in the SS engine.
 * 
 * @param ahargana Search start point
 * @param targetRashi Target Rashi index (0=Mesha, etc.)
 */
import { calculateTrueLongitudeSun } from '../celestial/sun';
import { calculateTrueLongitudeMoon } from '../celestial/moon';
import { normalizeAngle } from '../core/utils';

export function findSSSunIngress(ahargana: number, targetRashi: number): number {
  let lo = ahargana - 35; // A solar month is max ~32 days
  let hi = ahargana;

  // Binary search for 25 iterations (~1 minute precision)
  for (let i = 0; i < 25; i++) {
    const mid = (lo + hi) / 2;
    const sunLong = calculateTrueLongitudeSun(mid);
    const r = Math.floor(sunLong / 30);
    
    // Logic to handle 11 -> 0 wrap
    const diff = (r - targetRashi + 12) % 12;
    const isPast = diff < 6;

    if (isPast) hi = mid; else lo = mid;
  }
  
  return hi;
}

/**
 * Pinpoints the exact Ahargana of a Tithi transition in the SS engine.
 * 
 * [Ch. XIV, v.1-3] Calculates the precise moment a Tithi changes by 
 * solving for the 12-degree separation between the Sun and Moon.
 * 
 * @param ahargana Day count to search around
 * @param targetTithi 0-29 (0 = Amavasya/New Moon start, 15 = Purnima start)
 * @param direction -1 (preceding) or 1 (next)
 */
export function findSSLunarBoundary(ahargana: number, targetTithi: number, direction: -1 | 1 = -1): number {
  const getTithiIdx = (a: number) => {
    const s = calculateTrueLongitudeSun(a);
    const m = calculateTrueLongitudeMoon(a);
    const diff = normalizeAngle(m - s);
    return Math.floor(diff / 12);
  };

  let lo = ahargana + (direction === -1 ? -32 : 0);
  let hi = ahargana + (direction === -1 ? 0 : 32);

  // Binary search for 25 iterations (~1 second precision)
  for (let i = 0; i < 25; i++) {
    const mid = (lo + hi) / 2;
    const t = getTithiIdx(mid);
    
    // Logic to handle 29 -> 0 wrap
    let isPast;
    if (direction === -1) {
       // Finding preceding
       const diff = (t - targetTithi + 30) % 30;
       isPast = diff < 15;
    } else {
       // Finding next
       const diff = (targetTithi - t + 30) % 30;
       isPast = diff > 15;
    }

    if (isPast) hi = mid; else lo = mid;
  }
  return direction === -1 ? lo : hi;
}

/**
 * Finds the New Moon or Full Moon using the Modern JPL Engine.
 * 
 * Used for high-precision comparison (Audit) to determine the offset 
 * between traditional and modern lunar cycle boundaries.
 * 
 * @param date Reference date
 * @param targetTithi 0 (New Moon) or 15 (Full Moon)
 * @param direction Search direction
 */
export function findModernLunarBoundary(date: Date, targetTithi: number, direction: -1 | 1 = -1): Date {
  const step = direction * 0.5; // half day steps
  let current = new Date(date);
  
  const getTithi = (d: Date) => ModernPanchangaEngine.getElements(d).tithiIdx;

  // Linear scan to find the bracket [current, next]
  let next = new Date(date);

  for (let i = 0; i < 120; i++) {
    next = new Date(current.getTime() + step * 86400000);
    const nextT = getTithi(next);
    const currT = getTithi(current);

    if (direction === -1) {
      // Searching backwards for the most recent transition TO targetTithi
      // Transition is (Pre-target) -> targetTithi
      // If we are currently in targetTithi, we want its START.
      // If we are NOT in targetTithi, we want the most recent time it entered targetTithi.
      if (currT === targetTithi && nextT !== targetTithi) {
        // Found the boundary between next and current!
        break;
      }
    } else {
      // Searching forwards for the NEXT transition TO targetTithi
      if (currT !== targetTithi && nextT === targetTithi) {
        break;
      }
    }
    current = next;
  }

  // Binary search to refine in [lo, hi]
  let lo = direction === -1 ? next.getTime() : current.getTime();
  let hi = direction === -1 ? current.getTime() : next.getTime();
  
  for (let i = 0; i < 25; i++) {
    const mid = (lo + hi) / 2;
    const midT = getTithi(new Date(mid));
    
    if (direction === -1) {
       // Preceding: lo is pre-target, hi is target
       if (midT === targetTithi) hi = mid; else lo = mid;
    } else {
       // Next: lo is pre-target, hi is target
       if (midT === targetTithi) hi = mid; else lo = mid;
    }
  }
  return new Date(hi);
}
