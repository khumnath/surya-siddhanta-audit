/**
 * Surya-Siddhanta Calendar Systems
 * ================================
 * 
 * Provides high-level abstractions for the traditional time divisions: 
 * Months, Seasons, Ayanas, and specific Panchanga elements.
 */

import { calculateTrueLongitudeSun } from '../celestial/sun';
import { calculateTrueLongitudeMoon } from '../celestial/moon';
import { calculateTrueLongitudePlanet } from '../celestial/planets';
import { Body } from '../celestial/mean_motions';
import { normalizeAngle } from '../core/utils';
import { calculateSunriseSunset as calcSS } from '../geometry/geodesy';

// ============================================================================
// Lunar Limb Utilities
// ============================================================================

/**
 * Calculate detailed Tithi (Lunar Day) information.
 * 
 * [Ch. II, v.66] A Tithi is a 12° increment of distance between the 
 * Moon and Sun.
 * 
 * @param ahargana Current day count
 * @returns Object with tithi index, name, paksha (Shukla/Krishna), and fraction
 */
export function getTithiDetails(ahargana: number): { index: number; name: string; paksha: string; fraction: number } {
  const lSun = calculateTrueLongitudeSun(ahargana);
  const lMoon = calculateTrueLongitudeMoon(ahargana);

  const diff = normalizeAngle(lMoon - lSun);
  const tithiIndexRaw = (diff / 12.0);
  const index = Math.floor(tithiIndexRaw) + 1;
  const fraction = tithiIndexRaw - Math.floor(tithiIndexRaw);
  
  const paksha = index <= 15 ? "Shukla" : "Krishna";
  const names = [
    "Pratipada", "Dwitiya", "Tritiya", "Chaturthi", "Panchami", "Shashti",
    "Saptami", "Ashtami", "Navami", "Dashami", "Ekadashi", "Dwadashi",
    "Trayodashi", "Chaturdashi", "Purnima/Amavasya"
  ];

  let name = names[(index - 1) % 15];
  if (index === 15) name = "Purnima";
  if (index === 30) name = "Amavasya";

  return { index, name, paksha, fraction };
}

/**
 * Detect Adhimasa (Intercalary Month).
 * 
 * [Ch. I, v.40] An intercalary month (Adhika Masa) occurs when a lunar 
 * month passes without the Sun entering a new Rashi (Sankranti).
 * 
 * @param ahargana Day count at the start of the lunar period
 * @returns True if the month is intercalary
 */
export function isAdhimasa(ahargana: number): boolean {
  // If the Sun stays within the same 30° arc for a full synodic cycle
  const synodicCycle = 29.530589;
  const sunLongNow = calculateTrueLongitudeSun(ahargana);
  const sunLongFuture = calculateTrueLongitudeSun(ahargana + synodicCycle);
  
  const rashiNow = Math.floor(sunLongNow / 30.0);
  const rashiFuture = Math.floor(sunLongFuture / 30.0);
  
  return rashiNow === rashiFuture;
}

/**
 * Get the name of the Lunar Month.
 * 
 * Traditional names are linked to the solar Rashi occupied by the Sun 
 * at the moment of the new moon.
 * 
 * @param ahargana Current day count (usually anchored to Amavasya)
 * @returns Normalized lunar month name
 */
export function getLunarMonthName(ahargana: number): string {
  const lSun = calculateTrueLongitudeSun(ahargana);
  const solarMonthIdx = Math.floor(lSun / 30.0);
  
  const lunarMonthNames = [
    "Vaishakha", "Jyeshtha", "Ashadha", "Shravana", "Bhadrapada",
    "Ashvina", "Karttika", "Margashirsha", "Pausha", "Magha", "Phalguna", "Chaitra"
  ];

  const baseName = lunarMonthNames[solarMonthIdx];
  return isAdhimasa(ahargana) ? `Adhika ${baseName}` : baseName;
}

// ============================================================================
// Nakshatra and Yoga Calculations
// ============================================================================

/**
 * Calculate the 27-system Nakshatra (Lunar Mansion).
 * 
 * [Ch. II, v.64] The ecliptic is divided into 27 equal parts of 13° 20'.
 */
export function calculateNakshatra(ahargana: number): { index: number; name: string; pada: number; fraction: number } {
  const lMoon = calculateTrueLongitudeMoon(ahargana);
  const nakshatraSpan = 360.0 / 27.0;

  const nakshatraNames = [
    "Ashvini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra",
    "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni",
    "Hasta", "Chitra", "Svati", "Vishakha", "Anuradha", "Jyeshtha",
    "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishtha",
    "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"
  ];

  const indexRaw = lMoon / nakshatraSpan;
  const index = Math.floor(indexRaw);
  const fraction = indexRaw - index;
  const pada = Math.floor(fraction * 4) + 1;

  return { index: index + 1, name: nakshatraNames[index % 27], pada, fraction };
}

/**
 * Calculate the 28-system Nakshatra (including Abhijit).
 */
export function calculateNakshatra28(ahargana: number): { index: number; name: string } {
  const lMoon = calculateTrueLongitudeMoon(ahargana);
  const norm = ((lMoon % 360) + 360) % 360;
  
  const names = [
    "Ashvini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra",
    "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni",
    "Hasta", "Chitra", "Svati", "Vishakha", "Anuradha", "Jyeshtha",
    "Mula", "Purva Ashadha", "Uttara Ashadha", "Abhijit", "Shravana", "Dhanishtha",
    "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"
  ];

  // Logic matches NAKSHATRA_28_BOUNDARIES unequal divisions
  const boundaries = [
    13.333, 26.666, 40.0, 53.333, 66.666, 80.0, 93.333, 106.666, 120.0, 
    133.333, 146.666, 160.0, 173.333, 186.666, 200.0, 213.333, 226.666, 
    240.0, 253.333, 266.666, 276.666, 280.888, 293.333, 306.666, 320.0, 
    333.333, 346.666, 360.0
  ];

  for (let i = 0; i < boundaries.length; i++) {
    if (norm < boundaries[i]) return { index: i + 1, name: names[i] };
  }
  return { index: 1, name: names[0] };
}

/**
 * Calculate the Yoga.
 * 
 * [Ch. II, v.65] Derived from the sum of solar and lunar longitudes.
 */
export function calculateYoga(ahargana: number): { index: number; name: string } {
  const lSun = calculateTrueLongitudeSun(ahargana);
  const lMoon = calculateTrueLongitudeMoon(ahargana);

  const total = normalizeAngle(lSun + lMoon);
  const yogaSpan = 360.0 / 27.0;

  const yogaNames = [
    "Vishkambha", "Priti", "Ayushman", "Saubhagya", "Shobhana", "Atiganda",
    "Sukarman", "Dhriti", "Shula", "Ganda", "Vriddhi", "Dhruva",
    "Vyaghata", "Harshana", "Vajra", "Siddhi", "Vyatipata", "Variyana",
    "Parigha", "Shiva", "Siddha", "Sadhya", "Shubha", "Shukla",
    "Brahma", "Indra", "Vaidhriti"
  ];

  const index = Math.floor(total / yogaSpan);
  return { index: index + 1, name: yogaNames[index % 27] };
}

/**
 * Calculate the Karana.
 */
export function calculateKarana(ahargana: number): { index: number; name: string } {
  const lSun = calculateTrueLongitudeSun(ahargana);
  const lMoon = calculateTrueLongitudeMoon(ahargana);

  const diff = normalizeAngle(lMoon - lSun);
  const karanaOf60 = Math.floor(diff / 6.0) % 60;

  const karanaNames = [
    "Kimstughna", "Bava", "Balava", "Kaulava", "Taitila", "Gara",
    "Vanija", "Vishti", "Shakuni", "Chatushpada", "Naga"
  ];

  let karanaName: string;
  if (karanaOf60 === 0) {
    karanaName = karanaNames[0]; 
  } else if (karanaOf60 >= 57) {
    karanaName = karanaNames[karanaOf60 - 57 + 8]; 
  } else {
    karanaName = karanaNames[((karanaOf60 - 1) % 7) + 1]; 
  }

  return { index: karanaOf60 + 1, name: karanaName };
}

// ============================================================================
// Solar Cycle (Saura Masa, Ayana, Ritu)
// ============================================================================

/**
 * Get the Solar Month Sign (Rashi index).
 */
export function getSolarMonthSign(ahargana: number): number {
  const lSun = calculateTrueLongitudeSun(ahargana);
  return Math.floor(lSun / 30.0) + 1;
}

/**
 * Get the name of the Solar Month (Rashi).
 * 
 * [Ch. I, v.13] A solar month (Saura Masa) is the time 
 * spent by the Sun in one zodiac sign.
 */
export function getSolarMonthName(ahargana: number): string {
  const solarMonthIdx = getSolarMonthSign(ahargana);
  const rashiNames = [
    "Mesha (Aries)", "Vrishabha (Taurus)", "Mithuna (Gemini)",
    "Karkataka (Cancer)", "Simha (Leo)", "Kanya (Virgo)",
    "Tula (Libra)", "Vrishchika (Scorpio)", "Dhanu (Sagittarius)",
    "Makara (Capricorn)", "Kumbha (Aquarius)", "Meena (Pisces)"
  ];
  return rashiNames[(solarMonthIdx - 1) % 12];
}

/**
 * Get the Bikram Sambat (Solar) month name.
 * 
 * The BS year (Saura-Varsha) begins at Mesha Sankranti.
 */
export function getBikramMonthName(ahargana: number): string {
  const solarMonthIdx = getSolarMonthSign(ahargana);
  const bsMonths = [
    "Baisakh", "Jestha", "Ashadh", "Shrawan",
    "Bhadra", "Ashwin", "Kartik", "Mangsir",
    "Poush", "Magh", "Falgun", "Chaitra"
  ];
  return bsMonths[(solarMonthIdx - 1) % 12];
}

/**
 * Get the current Ayana (Progress).
 * 
 * [Ch. XIV, v.9] The sun's progress northward (Uttarayana) from 
 * the winter solstice and southward (Dakshinayana) from the summer solstice.
 */
export function getAyana(ahargana: number): string {
  const sunLong = calculateTrueLongitudeSun(ahargana);
  if (sunLong >= 270.0 || sunLong < 90.0) {
    return "Uttarayana (Northward)";
  } else {
    return "Dakshinayana (Southward)";
  }
}

/**
 * Get the Season (Ritu).
 * 
 * [Ch. XIV, v.10] The solar year is divided into six seasons, each 
 * consisting of two solar months.
 */
export function getSeason(ahargana: number): string {
  const solarMonth = getSolarMonthSign(ahargana);
  const seasons = [
    "Vasanta (Spring)", "Grishma (Summer)", "Varsha (Rains)",
    "Sarad (Autumn)", "Hemanta (Winter)", "Sisira (Winter/Cool)"
  ];
  return seasons[Math.floor((solarMonth - 1) / 2)];
}

/**
 * Calculate local Sunrise and Sunset.
 */
export function getSunriseSunset(ahargana: number, latitude: number) {
  const sunLong = calculateTrueLongitudeSun(ahargana);
  return calcSS(sunLong, latitude);
}

/**
 * Get the Sun's current Nakshatra index (0-26).
 */
export function getSunNakshatraIdx(ahargana: number): number {
  const sunLong = calculateTrueLongitudeSun(ahargana);
  return Math.floor(sunLong / (360.0 / 27.0));
}

// ============================================================================
// Planetary Positions
// ============================================================================

export interface RashiPosition {
  index: number;
  name: string;
  degrees: number;
  minutes: number;
  totalLongitude: number;
}

/**
 * Convert raw ecliptic longitude to a readable Rashi position.
 */
export function longitudeToRashiDetailed(longitude: number): RashiPosition {
  const normalized = normalizeAngle(longitude);
  const rashiNames = [
    "Mesha", "Vrishabha", "Mithuna", "Karka", "Simha", "Kanya",
    "Tula", "Vrishchika", "Dhanus", "Makara", "Kumbha", "Meena"
  ];
  
  const rashiIndex = Math.floor(normalized / 30.0);
  const degInside = normalized % 30.0;
  const degrees = Math.floor(degInside);
  const minutes = Math.floor((degInside - degrees) * 60.0);

  return {
    index: rashiIndex + 1,
    name: rashiNames[rashiIndex],
    degrees,
    minutes,
    totalLongitude: normalized
  };
}

/**
 * Get Rashi positions for the Sun, Moon, and the five star planets 
 * (Grahas) at the current moment.
 * 
 * Includes the Manda and Sighra corrections (True positions).
 */
export function getAllPlanetRashis(ahargana: number): Record<string, RashiPosition> {
  return {
    sun: longitudeToRashiDetailed(calculateTrueLongitudeSun(ahargana)),
    moon: longitudeToRashiDetailed(calculateTrueLongitudeMoon(ahargana)),
    mars: longitudeToRashiDetailed(calculateTrueLongitudePlanet(Body.MARS, ahargana)),
    mercury: longitudeToRashiDetailed(calculateTrueLongitudePlanet(Body.MERCURY, ahargana)),
    jupiter: longitudeToRashiDetailed(calculateTrueLongitudePlanet(Body.JUPITER, ahargana)),
    venus: longitudeToRashiDetailed(calculateTrueLongitudePlanet(Body.VENUS, ahargana)),
    saturn: longitudeToRashiDetailed(calculateTrueLongitudePlanet(Body.SATURN, ahargana)),
  };
}
