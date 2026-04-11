/**
 * High-Precision Modern Panchanga Timings (Drik)
 * ==============================================
 * 
 * Implements binary-search algorithms to pinpoint transition moments 
 * (End-times) for Tithi, Nakshatra, Yoga, and Karana using modern 
 * astronomical planetary theories.
 */

import { ModernPanchangaEngine } from './modern-engine';
import type { Location } from '../../types/astronomy';
import { getAnandadiYoga, getTamilYoga, getNetraJeeva, getAnandadiNak28Idx } from '../surya-siddhanta/calendar/anandadi-yoga';
import { getWeekdayFromDate } from '../surya-siddhanta/time/astronomy';
import { getSunNakshatraIdx } from '../surya-siddhanta/calendar/calendar';
import { dateTimeToAhargana } from '../surya-siddhanta/time/conversions';
import { KATHMANDU } from '../surya-siddhanta/geography/location';
import { DateTime } from 'luxon';

// ─── Modern Element Index Functions ──────────────────────────────────────────

function getModernTithiIdx(date: Date): number {
  return ModernPanchangaEngine.getElements(date).tithiIdx;
}

function getModernNakshatraIdx(date: Date, ayan: string): number {
  return ModernPanchangaEngine.getElements(date, ayan).nakshatraIdx;
}

function getModernYogaIdx(date: Date, ayan: string): number {
  return ModernPanchangaEngine.getElements(date, ayan).yogaIdx;
}

function getModernKaranaIdx(date: Date): number {
  return ModernPanchangaEngine.getElements(date).karanaIdx;
}

// ─── Name Lookup Tables (Parity with Traditional) ─────────────────────────────

const TITHI_NAMES = [
  "Pratipada", "Dwitiya", "Tritiya", "Chaturthi", "Panchami", "Shashti",
  "Saptami", "Ashtami", "Navami", "Dashami", "Ekadashi", "Dwadashi",
  "Trayodashi", "Chaturdashi", "Purnima",
  "Pratipada", "Dwitiya", "Tritiya", "Chaturthi", "Panchami", "Shashti",
  "Saptami", "Ashtami", "Navami", "Dashami", "Ekadashi", "Dwadashi",
  "Trayodashi", "Chaturdashi", "Amavasya"
];

const NAKSHATRA_NAMES = [
  "Ashvini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra",
  "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni",
  "Hasta", "Chitra", "Svati", "Vishakha", "Anuradha", "Jyeshtha",
  "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishtha",
  "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"
];

const YOGA_NAMES = [
  "Vishkambha", "Priti", "Ayushman", "Saubhagya", "Shobhana", "Atiganda",
  "Sukarman", "Dhriti", "Shula", "Ganda", "Vriddhi", "Dhruva",
  "Vyaghata", "Harshana", "Vajra", "Siddhi", "Vyatipata", "Variyana",
  "Parigha", "Shiva", "Siddha", "Sadhya", "Shubha", "Shukla",
  "Brahma", "Indra", "Vaidhriti"
];

export function tithiFullName(idx: number): string {
  const paksha = idx < 15 ? "Shukla" : "Krishna";
  return `${paksha} ${TITHI_NAMES[idx]}`;
}

export function nakshatraName(idx: number): string { return NAKSHATRA_NAMES[idx % 27]; }
export function yogaName(idx: number): string { return YOGA_NAMES[idx % 27]; }
export function karanaName(idx60: number): string {
  if (idx60 === 0) return "Kimstughna";
  if (idx60 >= 57) return ["Shakuni", "Chatushpada", "Naga"][idx60 - 57];
  const movable = ["Bava", "Balava", "Kaulava", "Taitila", "Gara", "Vanija", "Vishti"];
  return movable[(idx60 - 1) % 7];
}

/**
 * Returns currentized Panchanga elements for a specific moment.
 */
export function getModernPanchangaElements(date: Date, ayanMode: string = 'Chitrapaksha (Lahiri)') {
  const res = ModernPanchangaEngine.getElements(date, ayanMode);
  
  const naks28Idx = getAnandadiNak28Idx(res.siderealMoon);
  const naks28Names = [
    "Ashvini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra",
    "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni",
    "Hasta", "Chitra", "Svati", "Vishakha", "Anuradha", "Jyeshtha",
    "Mula", "Purva Ashadha", "Uttara Ashadha", "Abhijit", "Shravana", "Dhanishtha",
    "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"
  ];

  return {
    tithi: { index: res.tithiIdx + 1, name: tithiFullName(res.tithiIdx), fraction: res.tithiFraction },
    nakshatra: { 
      index: naks28Idx + 1, 
      name: naks28Names[naks28Idx],
      pada: Math.floor(res.nakshatraFraction * 4) + 1,
      fraction: res.nakshatraFraction
    },
    yoga: { index: res.yogaIdx + 1, name: yogaName(res.yogaIdx) },
    karana: { index: res.karanaIdx + 1, name: karanaName(res.karanaIdx) }
  };
}

/**
 * 25-iteration binary search to pinpoint transition moments.
 * Provides microsecond-level precision for astronomical events.
 */
function binarySearchModern(
  indexFn: (d: Date) => number,
  d1: Date,
  d2: Date,
  iterations: number = 25
): Date {
  let lo = d1.getTime(), hi = d2.getTime();
  const targetIdx = indexFn(d2);
  for (let i = 0; i < iterations; i++) {
    const mid = (lo + hi) / 2;
    if (indexFn(new Date(mid)) === targetIdx) hi = mid; else lo = mid;
  }
  return new Date((lo + hi) / 2);
}

// ─── Timing Computation ─────────────────────────────────────────────────────

export interface ModernElementTiming {
  name: string;
  index: number;
  pada?: number;
  endTime: Date | null;
  endTimeStr: string;
  endAhargana?: number; 
}

/**
 * Formats time relative to Sunrise for continuous display (e.g. 25:30).
 */
function formatContinuousTime(date: Date, sunriseDate: Date, sunriseHour: number): string {
  const diffHours = (date.getTime() - sunriseDate.getTime()) / 3600000;
  const continuousHour = sunriseHour + diffHours;
  const hours = Math.floor(continuousHour);
  const minutes = Math.floor((continuousHour - hours) * 60);
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

/**
 * Scans a 24-hour period to detect and refine limb transitions.
 * Uses a 7-minute linear step followed by a binary search refinement.
 */
function findModernTimings(
  indexFn: (d: Date) => number,
  nameFn: (idx: number) => string,
  sunriseDate: Date,
  nextSunriseDate: Date,
  sunriseHour: number,
): ModernElementTiming[] {
  const results: ModernElementTiming[] = [];
  const stepMs = 7 * 60 * 1000;
  const endMs = nextSunriseDate.getTime();
  
  let prevIdx = indexFn(sunriseDate);
  let t = sunriseDate.getTime() + stepMs;
  
  while (t <= endMs + stepMs * 0.1) {
    const clampedT = Math.min(t, endMs);
    const curIdx = indexFn(new Date(clampedT));
    if (curIdx !== prevIdx) {
      const transDate = binarySearchModern(indexFn, new Date(t - stepMs), new Date(clampedT));
      results.push({
        name: nameFn(prevIdx),
        index: prevIdx + 1,
        endTime: transDate,
        endTimeStr: formatContinuousTime(transDate, sunriseDate, sunriseHour),
        endAhargana: (transDate.getTime() / 86400000) + 2440587.5 - 2451545.0
      });
      prevIdx = curIdx;
    }
    t += stepMs;
  }
  results.push({ name: nameFn(prevIdx), index: prevIdx + 1, endTime: null, endTimeStr: '→', endAhargana: 0 });
  return results;
}

/**
 * Specialized search for 28-system Nakshatra transitions.
 */
function findModernAnandadi28Timings(
  sunriseDate: Date,
  nextSunriseDate: Date,
  sunriseHour: number,
  ayaan: string
): ModernElementTiming[] {
  const indexFn = (d: Date) => {
    const res = ModernPanchangaEngine.getElements(d, ayaan);
    return getAnandadiNak28Idx(res.siderealMoon);
  };
  
  const results: ModernElementTiming[] = [];
  const stepMs = 7 * 60 * 1000;
  const endMs = nextSunriseDate.getTime();
  
  let prevIdx = indexFn(sunriseDate);
  let t = sunriseDate.getTime() + stepMs;
  
  while (t <= endMs + stepMs * 0.1) {
    const clampedT = Math.min(t, endMs);
    const curIdx = indexFn(new Date(clampedT));
    if (curIdx !== prevIdx) {
      const transDate = binarySearchModern(indexFn, new Date(t - stepMs), new Date(clampedT));
      results.push({
        name: (prevIdx + 1).toString(),
        index: prevIdx,
        endTime: transDate,
        endTimeStr: formatContinuousTime(transDate, sunriseDate, sunriseHour),
        endAhargana: (transDate.getTime() / 86400000) + 2440587.5 - 2451545.0
      });
      prevIdx = curIdx;
    }
    t += stepMs;
  }
  results.push({ name: (prevIdx + 1).toString(), index: prevIdx, endTime: null, endTimeStr: '→', endAhargana: 0 });
  return results;
}

export interface ModernDayPanchangaTimings {
  sunriseTime: Date;
  sunsetTime: Date;
  nextSunriseTime: Date;
  sunriseHours: number;
  sunsetHours: number;
  dayLengthHours: number;
  nextSunriseHours: number;
  tithis: ModernElementTiming[];
  nakshatras: ModernElementTiming[];
  yogas: ModernElementTiming[];
  karanas: ModernElementTiming[];
  anandadi28: (ModernElementTiming & { type: 'auspicious' | 'inauspicious' | 'neutral'; netra?: number; jeeva?: number; tamilYoga?: { name: string; type: string } })[];
}

/**
 * Main Aggregator for Modern Panchanga Timings.
 * 
 * Computes the full 24-hour cycle of transitions relative to local sunrise.
 * 
 * @param date Target date
 * @param location Geographic location
 * @param ayanMode Choice of Ayanamsha (default: Lahiri)
 */
export function computeModernPanchangaTimings(
  date: Date,
  location: Location,
  ayanMode: string = 'Chitrapaksha (Lahiri)'
): ModernDayPanchangaTimings {
  const dt = DateTime.fromJSDate(date).setZone('Asia/Kathmandu').startOf('day');
  const localMidnight = dt.toJSDate();
  
  const sunriseDate = ModernPanchangaEngine.findEvent('Sun', localMidnight, location.latitude, location.longitude, true) || localMidnight;
  const sunsetDate = ModernPanchangaEngine.findEvent('Sun', sunriseDate, location.latitude, location.longitude, false) || new Date(sunriseDate.getTime() + 12 * 3600000);
  
  const tomorrow = new Date(localMidnight.getTime() + 24 * 3600000);
  const nextSunriseDate = ModernPanchangaEngine.findEvent('Sun', tomorrow, location.latitude, location.longitude, true) || new Date(sunriseDate.getTime() + 24 * 3600000);
  
  const vara = getWeekdayFromDate(sunriseDate);
  const aharganaAtSunrise = dateTimeToAhargana(DateTime.fromJSDate(sunriseDate), KATHMANDU);
  
  const getDecimalHours = (d: Date) => {
    const ldt = DateTime.fromJSDate(d).setZone('Asia/Kathmandu');
    return ldt.hour + ldt.minute / 60 + ldt.second / 3600;
  };

  const sunriseHour = getDecimalHours(sunriseDate);
  const sunsetHour = getDecimalHours(sunsetDate);
  const nextSunriseHour = getDecimalHours(nextSunriseDate);
  const dayLengthHours = (sunsetDate.getTime() - sunriseDate.getTime()) / 3600000;

  return {
    sunriseTime: sunriseDate,
    sunsetTime: sunsetDate,
    nextSunriseTime: nextSunriseDate,
    sunriseHours: sunriseHour,
    sunsetHours: sunsetHour,
    dayLengthHours,
    nextSunriseHours: nextSunriseHour,
    tithis: findModernTimings(getModernTithiIdx, tithiFullName, sunriseDate, nextSunriseDate, sunriseHour),
    nakshatras: findModernTimings((d) => getModernNakshatraIdx(d, ayanMode), nakshatraName, sunriseDate, nextSunriseDate, sunriseHour),
    yogas: findModernTimings((d) => getModernYogaIdx(d, ayanMode), yogaName, sunriseDate, nextSunriseDate, sunriseHour),
    karanas: findModernTimings(getModernKaranaIdx, karanaName, sunriseDate, nextSunriseDate, sunriseHour),
    anandadi28: findModernAnandadi28Timings(sunriseDate, nextSunriseDate, sunriseHour, ayanMode).map(n => {
      const yoga = getAnandadiYoga(vara, n.index);
      const sunNak = getSunNakshatraIdx(aharganaAtSunrise); 
      const { netra, jeeva } = getNetraJeeva(n.index, sunNak);
      const tamil = getTamilYoga(vara, n.index);
      return { ...n, name: yoga.name, index: yoga.index, type: yoga.type, netra, jeeva, tamilYoga: tamil };
    })
  };
}




