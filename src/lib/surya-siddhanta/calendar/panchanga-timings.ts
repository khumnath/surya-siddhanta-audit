/**
 * Panchanga Element Timings
 * =========================
 * 
 * Computes the exact transition times for the five limbs (Panchanga) 
 * of the traditional calendar: Tithi, Nakshatra, Yoga, Karana, and Vara.
 * 
 * All calculations are performed within a sunrise-to-sunrise window, 
 * adhering to the Savana-dina (civil day) principle.
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
// Panchanga Limb Calculation Logic (0-based indices)
// ============================================================================

/**
 * Calculate the Tithi index.
 * 
 * [Ch. II, v.66] A Tithi is the period in which the Moon increases its 
 * distance from the Sun by 12 degrees.
 * 
 * @param ahargana Current day count
 * @returns Tithi index (0-29)
 */
function getTithiIdx(ahargana: number): number {
  const lSun = calculateTrueLongitudeSun(ahargana);
  const lMoon = calculateTrueLongitudeMoon(ahargana);
  return Math.floor(normalizeAngle(lMoon - lSun) / 12.0);
}

/**
 * Calculate the Nakshatra index.
 * 
 * [Ch. II, v.64] The ecliptic is divided into 27 equal parts 
 * (each 13° 20') called Nakshatras.
 * 
 * @param ahargana Current day count
 * @returns Nakshatra index (0-26)
 */
function getNakshatraIdx(ahargana: number): number {
  const lMoon = calculateTrueLongitudeMoon(ahargana);
  return Math.floor(lMoon / (360.0 / 27.0));
}

/**
 * Calculate the Yoga index.
 * 
 * [Ch. II, v.65] A Yoga is defined by the sum of the longitudes 
 * of the Sun and Moon, divided into 27 equal parts.
 * 
 * @param ahargana Current day count
 * @returns Yoga index (0-26)
 */
function getYogaIdx(ahargana: number): number {
  const lSun = calculateTrueLongitudeSun(ahargana);
  const lMoon = calculateTrueLongitudeMoon(ahargana);
  return Math.floor(normalizeAngle(lSun + lMoon) / (360.0 / 27.0));
}

/**
 * Calculate the Karana index.
 * 
 * [Ch. II, v.67-69] A Karana is half a Tithi (6° distance).
 * There are 11 unique Karanas: 4 fixed and 7 moving.
 * 
 * @param ahargana Current day count
 * @returns Karana index (0-59) for the lunar month
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
 * Get the full Tithi name including Paksha (Shukla/Krishna).
 */
function tithiFullName(idx: number): string {
  const paksha = idx < 15 ? "Shukla" : "Krishna";
  return `${paksha} ${TITHI_NAMES[idx]}`;
}

/** Get the traditional Nakshatra name. */
function nakshatraName(idx: number): string {
  return NAKSHATRA_NAMES[idx % 27];
}

/** Get the traditional Yoga name. */
function yogaName(idx: number): string {
  return YOGA_NAMES[idx % 27];
}

/** Get the specific Karana name (including fixed/moving logic). */
function karanaName(idx60: number): string {
  // idx 0: Kimstughna (fixed, 1st half of Shukla Pratipada)
  if (idx60 === 0) return "Kimstughna";
  // idx 57-59: Fixed Karanas at the end of the Krishna paksha
  if (idx60 >= 57) return ["Shakuni", "Chatushpada", "Naga"][idx60 - 57];
  // 7 moving karanas cycle 8 times
  const MOVING = ["Bava", "Balava", "Kaulava", "Taitila", "Gara", "Vanija", "Vishti"];
  return MOVING[(idx60 - 1) % 7];
}

// ============================================================================
// Core Computation Engine
// ============================================================================

/**
 * Perform a binary search to find the exact moment an element transition occurs.
 * 
 * Useful for finding the 'Anta-kala' (end-time) of a Tithi or Nakshatra.
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
  index: number;      // 1-based element number
  pada?: number;
  endAhargana: number | null; // null if extends past next sunrise
  endTimeStr: string;  // HH:MM or "→"
}

/** 
 * Format decimal hours into a 30-hour clock string (Sunrise to next morning). 
 */
function formatHours(decimalHours: number): string {
  const hours = Math.floor(decimalHours);
  const minutes = Math.floor((decimalHours - hours) * 60);
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

/**
 * Find all discrete elements of a certain type within the 24-hour day.
 */
function findElementTimings(
  indexFn: (a: number) => number,
  nameFn: (idx: number) => string,
  sunriseA: number,
  nextSunriseA: number,
  sunriseHours: number,
): ElementTiming[] {
  const results: ElementTiming[] = [];
  const step = 0.005; // ~7.2 minutes
  
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
 * Find specialized 28-system Nakshatra/Yoga timings.
 */
function findAnandadi28Timings(
  sunriseA: number,
  nextSunriseA: number,
  sunriseHours: number
): ElementTiming[] {
  const AYAN_CORRECTION = 24.13; 
  const getIdx = (a: number) => {
    const lMoon = calculateTrueLongitudeMoon(a);
    return getAnandadiNak28Idx(lMoon - AYAN_CORRECTION);
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
 * Compute all Panchanga element timings for the sunrise-to-sunrise civil day.
 * 
 * Reconciles modern DateTime inputs with traditional Surya-Siddhanta 
 * geometric limb logic (*Savana-dina*).
 * 
 * @param ahargana Current day count (decimal)
 * @param latitude Geographic latitude of observation
 * @returns Comprehensive Panchanga timing object
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
