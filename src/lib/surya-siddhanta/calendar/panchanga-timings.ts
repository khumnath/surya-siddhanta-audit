/**
 * Siddhantic Panchanga Timings (Anta-kala-sadhana)
 * ===============================================
 * 
 * Computes the exact transition times (end-moments) for the five limbs 
 * of the traditional calendar: Tithi, Nakshatra, Yoga, Karana, and Vara.
 * 
 * [Ch. XIV, v.18-19] Aligns all computations with the Savana-dina 
 * (civil day), which begins at astronomical sunrise.
 * [Ch. II, v.64-69] Implements the formulas for the five limbs, finding 
 * the 'Anta-kala'—the precise moment a limb completes its arc—based 
 * on the continuous relative motion of the Sun and Moon.
 */

import { calculateTrueLongitudeSun } from '../celestial/sun';
import { calculateTrueLongitudeMoon } from '../celestial/moon';
import { normalizeAngle } from '../core/utils';
import { calculateSunriseSunset } from '../geometry/geodesy';
import { getAnandadiYoga, getAnandadiNak28Idx, getTamilYoga, getNetraJeeva } from './anandadi-yoga';
import { NAKSHATRA_NAMES, TITHI_NAMES, YOGA_NAMES } from './names';
import { getSunNakshatraIdx } from './calendar';
import { jdnToGregorian } from '../time/conversions';

// ============================================================================
// Panchanga Limb Logic (0-based indices)
// ============================================================================

/**
 * Get current Tithi Index.
 * 
 * [Ch. II, v.66] Calculated as the quotient of the angular distance 
 * between the Moon and Sun and the 12-degree tithi-span.
 * 
 * @param ahargana Current day count (decimal)
 * @returns 0-indexed tithi (0-29)
 */
function getTithiIdx(ahargana: number): number {
  const lSun = calculateTrueLongitudeSun(ahargana);
  const lMoon = calculateTrueLongitudeMoon(ahargana);
  return Math.floor(normalizeAngle(lMoon - lSun) / 12.0);
}

/**
 * Get current Nakshatra Index.
 * 
 * [Ch. II, v.64] Calculated based on the Moon's true longitude 
 * within the 27 equal mathematical stations of 13° 20' each.
 * 
 * @param ahargana Current day count (decimal)
 * @returns 0-indexed nakshatra (0-26)
 */
function getNakshatraIdx(ahargana: number): number {
  const lMoon = calculateTrueLongitudeMoon(ahargana);
  return Math.floor(lMoon / (360.0 / 27.0));
}

/**
 * Get current Yoga Index.
 * 
 * [Ch. II, v.65] Derived from the sum of the Sun and Moon's 
 * longitudes, divided into 27 equal portions.
 * 
 * @param ahargana Current day count (decimal)
 * @returns 0-indexed yoga (0-26)
 */
function getYogaIdx(ahargana: number): number {
  const lSun = calculateTrueLongitudeSun(ahargana);
  const lMoon = calculateTrueLongitudeMoon(ahargana);
  return Math.floor(normalizeAngle(lSun + lMoon) / (360.0 / 27.0));
}

/**
 * Get current Karana Index.
 * 
 * [Ch. II, v.67-69] Calculated as half-tithis (6-degree spans), 
 * following the specific sequence of 11 traditional names.
 * 
 * @param ahargana Current day count (decimal)
 * @returns 0-indexed karana (0-59)
 */
function getKaranaIdx(ahargana: number): number {
  const lSun = calculateTrueLongitudeSun(ahargana);
  const lMoon = calculateTrueLongitudeMoon(ahargana);
  return Math.floor(normalizeAngle(lMoon - lSun) / 6.0) % 60;
}

// ============================================================================
// Name Formatting and Lookup
// ============================================================================

/** 
 * Returns the full tithi name including the lunar fortnight.
 */
function tithiFullName(idx: number): string {
  const paksha = idx < 15 ? "Shukla" : "Krishna";
  return `${paksha} ${TITHI_NAMES[idx]}`;
}

/** Returns the common name of the lunar mansion. */
function nakshatraName(idx: number): string {
  return NAKSHATRA_NAMES[idx % 27];
}

/** Returns the name of the solar-lunar yoga. */
function yogaName(idx: number): string {
  return YOGA_NAMES[idx % 27];
}

/** Returns the specific name for the current half-tithi. */
function karanaName(idx60: number): string {
  if (idx60 === 0) return "Kimstughna";
  if (idx60 >= 57) return ["Shakuni", "Chatushpada", "Naga"][idx60 - 57];
  const MOVING = ["Bava", "Balava", "Kaulava", "Taitila", "Gara", "Vanija", "Vishti"];
  return MOVING[(idx60 - 1) % 7];
}

// ============================================================================
// Core Computation Engine
// ============================================================================

/**
 * Computes the 'Anta-kala' (end-moment) of a Panchanga element.
 * 
 * This identifies the precise Ahargana when an element transitions. 
 * Scripturally, this replaces the linear Trairashika (Rule of Three) 
 * with a high-precision binary search for the boundary.
 */
function binarySearchTransition(
  indexFn: (a: number) => number,
  lo: number,
  hi: number,
  iterations: number = 25
): number {
  const targetIdx = indexFn(hi);
  for (let i = 0; i < iterations; i++) {
    const mid = (lo + hi) / 2.0;
    if (indexFn(mid) === targetIdx) {
      hi = mid;
    } else {
      lo = mid;
    }
  }
  return (lo + hi) / 2.0;
}

export interface ElementTiming {
  name: string;
  index: number;      
  pada?: number;
  endAhargana: number | null; 
  endTimeStr: string;  
}

/** 
 * Formats time relative to sunrise using a 30-hour clock system.
 */
function formatHours(decimalHours: number): string {
  const hours = Math.floor(decimalHours);
  const minutes = Math.floor((decimalHours - hours) * 60);
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

/**
 * Scans a 24-hour window to identify all limb transitions.
 * 
 * Correctly detects 'Kshaya' (skipped) and 'Vriddhi' (repeated) elements 
 * by checking transitions relative to successive sunrises.
 */
function findElementTimings(
  indexFn: (a: number) => number,
  nameFn: (idx: number) => string,
  sunriseA: number,
  nextSunriseA: number,
  sunriseHours: number,
): ElementTiming[] {
  const results: ElementTiming[] = [];
  const step = 0.005; // Guard step
  
  let prevIdx = indexFn(sunriseA);
  let t = sunriseA + step;
  
  while (t <= nextSunriseA + step * 0.1) {
    const clampedT = Math.min(t, nextSunriseA);
    const curIdx = indexFn(clampedT);
    
    if (curIdx !== prevIdx) {
      const transA = binarySearchTransition(indexFn, t - step, clampedT);
      const transHours = sunriseHours + (transA - sunriseA) * 24.0;
      
      results.push({
        name: nameFn(prevIdx),
        index: prevIdx + 1,
        endAhargana: transA,
        endTimeStr: formatHours(transHours),
      });
      
      prevIdx = curIdx;
    }
    t += step;
  }
  
  results.push({
    name: nameFn(prevIdx),
    index: prevIdx + 1,
    endAhargana: null,
    endTimeStr: '→',
  });
  
  return results;
}

/**
 * Finds transitions in the 28-station electional system (including Abhijit).
 */
function findAnandadi28Timings(
  sunriseA: number,
  nextSunriseA: number,
  sunriseHours: number
): ElementTiming[] {
  const getIdx = (a: number) => {
    const lMoon = calculateTrueLongitudeMoon(a);
    return getAnandadiNak28Idx(lMoon);
  };

  const results: ElementTiming[] = [];
  let prevIdx = getIdx(sunriseA);
  let t = sunriseA;
  const step = 20.0 / 1440.0;
  
  while (t < nextSunriseA) {
    const curIdx = getIdx(t);
    if (curIdx !== prevIdx) {
      const transA = binarySearchTransition(getIdx, t - step, t);
      const transHours = sunriseHours + (transA - sunriseA) * 24.0;

      results.push({
        name: (prevIdx + 1).toString(),
        index: prevIdx,
        endAhargana: transA,
        endTimeStr: formatHours(transHours),
      });
      prevIdx = curIdx;
    }
    t += step;
  }
  results.push({ name: (prevIdx + 1).toString(), index: prevIdx, endAhargana: null, endTimeStr: '→' });
  return results;
}

export interface YogaTiming extends ElementTiming {
  type: 'auspicious' | 'inauspicious' | 'neutral';
  tamilYoga?: { name: string; type: string };
  netra?: number;
  jeeva?: number;
}

export interface DayPanchangaTimings {
  sunriseHours: number;
  sunsetHours: number;
  dayLengthHours: number;
  nextSunriseHours: number;
  sunriseAhargana: number;
  nextSunriseAhargana: number;
  tithis: ElementTiming[];
  nakshatras: ElementTiming[];
  yogas: ElementTiming[];
  karanas: ElementTiming[];
  anandadi28: YogaTiming[];
}

/**
 * Orchestrates total Panchanga timing computation for a civil day.
 * 
 * [Ch. XIV, v.18] Anchors all celestial transitions to the 'Savana' 
 * frame (sunrise to sunrise), ensuring that ritual elements are 
 * correctly ascribed to the operative solar day.
 * 
 * @param ahargana Target day count
 * @param latitude Observer latitude
 * @returns Complete timing dataset for the solar day
 */
export function computeDayPanchangaTimings(
  ahargana: number,
  latitude: number
): DayPanchangaTimings {
  let dayA = Math.floor(ahargana);
  
  let sunLong = calculateTrueLongitudeSun(dayA);
  let sunTimes = calculateSunriseSunset(sunLong, latitude);
  let sunriseA = dayA + (sunTimes.sunrise - 12.0) / 24.0;
  
  if (ahargana < sunriseA) {
    dayA -= 1;
    sunLong = calculateTrueLongitudeSun(dayA);
    sunTimes = calculateSunriseSunset(sunLong, latitude);
    sunriseA = dayA + (sunTimes.sunrise - 12.0) / 24.0;
  }
  
  const nextSunriseA = sunriseA + 1.0; 

  const [ry, rm, rd] = jdnToGregorian(sunriseA + 588465.5 + 0.23);
  const varaDate = new Date(ry, rm - 1, rd);
  const vara = varaDate.getDay(); 

  const nakTimings = findElementTimings(getNakshatraIdx, nakshatraName, sunriseA, nextSunriseA, sunTimes.sunrise);

  return {
    sunriseHours: sunTimes.sunrise,
    sunsetHours: sunTimes.sunset,
    dayLengthHours: sunTimes.dayLengthHours,
    nextSunriseHours: sunTimes.sunrise,
    sunriseAhargana: sunriseA,
    nextSunriseAhargana: nextSunriseA,
    tithis: findElementTimings(getTithiIdx, tithiFullName, sunriseA, nextSunriseA, sunTimes.sunrise),
    nakshatras: nakTimings,
    yogas: findElementTimings(getYogaIdx, yogaName, sunriseA, nextSunriseA, sunTimes.sunrise),
    karanas: findElementTimings(getKaranaIdx, karanaName, sunriseA, nextSunriseA, sunTimes.sunrise),
    anandadi28: findAnandadi28Timings(sunriseA, nextSunriseA, sunTimes.sunrise).map(n => {
      const nakIdx0 = n.index - 1;
      const yoga = getAnandadiYoga(vara, nakIdx0);
      const sunNak = getSunNakshatraIdx(sunriseA);
      const { netra, jeeva } = getNetraJeeva(nakIdx0, sunNak);
      const tamil = getTamilYoga(vara, nakIdx0);
      return { ...n, name: yoga.name, index: yoga.index, type: yoga.type, netra, jeeva, tamilYoga: tamil };
    })
  };
}
