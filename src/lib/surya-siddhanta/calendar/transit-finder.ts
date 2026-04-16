import { DAYS_PER_MAHAYUGA, REV_JUPITER } from '../core/constants';
import { aharganaToDateTime, dateTimeToAhargana } from '../time/conversions';
import { KATHMANDU } from '../geography/location';
import { calculateTrueLongitudeSun } from '../celestial/sun';
import { calculateTrueLongitudeMoon } from '../celestial/moon';
import { normalizeAngle } from '../core/utils';
import { getNorthSamvatsar, getSouthSamvatsar } from './samvatsar';
import { ModernPanchangaEngine } from '../../modern/modern-engine';
import { SAMVATSARA_NAMES } from './names';

// ============================================================================
// Foundational Search Utilities
// ============================================================================

/**
 * Local helper for Tithi index to avoid circular dependency with calendar.ts
 */
function getTithiIndex(ahargana: number): number {
  const lSun = calculateTrueLongitudeSun(ahargana);
  const lMoon = calculateTrueLongitudeMoon(ahargana);
  const diff = normalizeAngle(lMoon - lSun);
  return Math.floor(diff / 12.0) + 1;
}

/**
 * Pinpoints the exact Ahargana of a Tithi transition in the SS engine.
 */
export function findSSLunarBoundary(ahargana: number, targetTithi: number, direction: -1 | 1 = -1): number {
  const getTithiIdx0To29 = (a: number) => {
    const s = calculateTrueLongitudeSun(a);
    const m = calculateTrueLongitudeMoon(a);
    const diff = normalizeAngle(m - s);
    return Math.floor(diff / 12);
  };

  let lo = ahargana + (direction === -1 ? -32 : 0);
  let hi = ahargana + (direction === -1 ? 0 : 32);

  for (let i = 0; i < 25; i++) {
    const mid = (lo + hi) / 2;
    const t = getTithiIdx0To29(mid);
    
    let isPast;
    if (direction === -1) {
       const diff = (t - (targetTithi % 30) + 30) % 30;
       isPast = diff < 15;
    } else {
       const diff = ((targetTithi % 30) - t + 30) % 30;
       isPast = diff > 15;
    }

    if (isPast) hi = mid; else lo = mid;
  }
  return (lo + hi) / 2;
}

/**
 * Finds the New Moon or Full Moon using the Modern JPL Engine.
 */
export function findModernLunarBoundary(date: Date, targetTithi: number, direction: -1 | 1 = -1): Date {
  const step = direction * 0.5;
  const targetIdx = (targetTithi % 30);
  let current = new Date(date);
  const getTithi = (d: Date) => ModernPanchangaEngine.getElements(d).tithiIdx;

  let next = new Date(date);
  for (let i = 0; i < 120; i++) {
    next = new Date(current.getTime() + step * 86400000);
    const nextT = getTithi(next);
    const currT = getTithi(current);

    if (direction === -1) {
      if (currT === targetIdx && nextT !== targetIdx) break;
    } else {
      if (currT !== targetIdx && nextT === targetIdx) break;
    }
    current = next;
  }

  let l = direction === -1 ? next.getTime() : current.getTime();
  let r = direction === -1 ? current.getTime() : next.getTime();
  
  for (let i = 0; i < 25; i++) {
    const mid = (l + r) / 2;
    const midT = getTithi(new Date(mid));
    if (midT === targetIdx) r = mid; else l = mid;
  }
  return new Date(r);
}

/**
 * Finds the exact Ahargana when the Sun enters a target sign in the SS engine.
 */
export function findSSSunIngress(ahargana: number, targetRashi: number): number {
  const targetLong = (targetRashi % 12) * 30;
  let lo = ahargana - 35;
  let hi = ahargana + 35;

  for (let i = 0; i < 25; i++) {
    const mid = (lo + hi) / 2;
    const sunLong = calculateTrueLongitudeSun(mid);
    const diff = normalizeAngle(sunLong - targetLong);
    const isPast = diff < 180;
    if (isPast) hi = mid; else lo = mid;
  }
  return hi;
}

// ============================================================================
// Era and Cycle Transitions
// ============================================================================

export function findSSMeanTransitAhargana(ahargana: number): number {
  const totalRevs = (ahargana * REV_JUPITER) / DAYS_PER_MAHAYUGA;
  const totalSamvatsars = totalRevs * 12;
  const fraction = totalSamvatsars - Math.floor(totalSamvatsars);
  const samvatsarLengthDays = DAYS_PER_MAHAYUGA / (REV_JUPITER * 12);
  return ahargana - (fraction * samvatsarLengthDays);
}

export function findPrecedingLunarBoundary(ahargana: number, targetRashi: number): number {
  const dt = aharganaToDateTime(ahargana, KATHMANDU);
  const endOfDay = dt.set({ hour: 23, minute: 59, second: 59 }).toJSDate();
  
  let currentNM = findModernLunarBoundary(endOfDay, 0, -1);
  
  for (let i = 0; i < 14; i++) {
    const el = ModernPanchangaEngine.getElements(currentNM, 'lahiri');
    const rashi = Math.floor(el.siderealSun / 30);
    
    if (rashi === targetRashi) {
      const nmAhar = dateTimeToAhargana(currentNM, KATHMANDU);
      const dayOfTransit = Math.floor(nmAhar);
      const nextSunrise = dayOfTransit + 1;
      const elNext = ModernPanchangaEngine.getElements(aharganaToDateTime(nextSunrise, KATHMANDU).toJSDate(), 'lahiri');
      
      if (elNext.tithiIdx === 0) return nextSunrise;
      return dayOfTransit;
    }
    
    const prevDate = new Date(currentNM.getTime() - 15 * 86400000);
    currentNM = findModernLunarBoundary(prevDate, 0, -1);
  }
  
  return Math.floor(ahargana);
}

export function findPrecedingTraditionalYugadiAhargana(ahargana: number): number {
  const currentDays = Math.floor(ahargana);
  
  for (let d = currentDays; d > currentDays - 400; d--) {
    const tIdx = getTithiIndex(d);
    if (tIdx === 1) {
      const nm1 = findSSLunarBoundary(d, 0, -1);
      const sunNM1 = calculateTrueLongitudeSun(nm1);
      const nm2 = findSSLunarBoundary(nm1 + 15, 0, 1);
      const sunNM2 = calculateTrueLongitudeSun(nm2);
      
      const r1 = Math.floor(sunNM1 / 30.0) % 12;
      const r2 = Math.floor(sunNM2 / 30.0) % 12;
      
      if (r2 === 0 || (r1 === r2 && (r1 + 1) % 12 === 0)) {
        return d;
      }
    }
    
    const tIdxPrev = getTithiIndex(d - 1);
    const tIdxCurr = getTithiIndex(d);
    if (tIdxPrev === 30 && tIdxCurr === 2) {
       return d - 1;
    }
  }
  return currentDays;
}

export function findPrecedingYugadiAhargana(ahargana: number): number {
  return findPrecedingLunarBoundary(ahargana, 11);
}

export function findPrecedingNepalSambatAhargana(ahargana: number): number {
  return findPrecedingLunarBoundary(ahargana, 6);
}

export function getNorthCivilSamvatsar(ahargana: number): string {
  const yugadi = findPrecedingYugadiAhargana(ahargana);
  const ss = getNorthSamvatsar(yugadi);
  return ss.name;
}

export function getSouthCivilSamvatsar(ahargana: number): string {
  const yugadi = findPrecedingYugadiAhargana(ahargana);
  const dt = aharganaToDateTime(yugadi, KATHMANDU);
  const shaka = dt.year - 78;
  return getSouthSamvatsar(shaka).name;
}

export function findNextSSMeanTransitAhargana(ahargana: number): number {
  const samvatsarLengthDays = DAYS_PER_MAHAYUGA / (REV_JUPITER * 12);
  const start = findSSMeanTransitAhargana(ahargana);
  return start + samvatsarLengthDays;
}

export function getSSNextSamvatsarName(ahargana: number): string {
  const nextStart = findNextSSMeanTransitAhargana(ahargana);
  const next = getNorthSamvatsar(nextStart + 1);
  return next.name;
}

export function getModernNextSamvatsarName(date: Date, ayanamsha: string): string {
  const nextIngress = ModernPanchangaEngine.findNextJupiterIngress(date, ayanamsha);
  const nextDate = new Date(nextIngress.getTime() + 86400000);
  const elements = ModernPanchangaEngine.getElements(nextDate, ayanamsha);
  return elements.modernSamvatsarName;
}

export function getNextSamvatsarName(currentName: string): string {
  const idx = SAMVATSARA_NAMES.indexOf(currentName);
  if (idx === -1) return "Unknown";
  return SAMVATSARA_NAMES[(idx + 1) % 60];
}

export function formatAharganaDate(ahargana: number): string {
  const dt = aharganaToDateTime(ahargana, KATHMANDU);
  return dt.toFormat("MMM d, yyyy");
}
