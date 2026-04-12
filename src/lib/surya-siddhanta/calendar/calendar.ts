/**
 * Siddhantic Calendar Systems (Kalanirnaya)
 * =========================================
 * 
 * Provides high-level abstractions for traditional time divisions, 
 * seasonal cycles, and the five limbs (Lagnas) of the Panchanga.
 * 
 * [Ch. I, v.13] Defines the solar and lunar measures used in calendar computation.
 * [Ch. XIV, v.1-2] Establishes the nine systems of measurement (Mana) used for 
 * astronomical and civil time.
 */

import { calculateTrueLongitudeSun } from '../celestial/sun';
import { calculateTrueLongitudeMoon } from '../celestial/moon';
import { calculateTrueLongitudePlanet } from '../celestial/planets';
import { Body } from '../celestial/mean_motions';
import { findSSLunarBoundary, findSSSunIngress } from './transit-finder';
import { normalizeAngle } from '../core/utils';
import { calculateSunriseSunset as calcSS } from '../geometry/geodesy';

// ============================================================================
// Lunar Limb Utilities (Tithi & Masa)
// ============================================================================

/**
 * Calculate detailed Tithi (Lunar Day) information.
 * 
 * [Ch. II, v.66] A Tithi is defined as the time taken for the longitudinal 
 * distance (Antara) between the Moon and the Sun to increase by 12 degrees. 
 * This represents one 'Day' of the lunar month.
 * 
 * @param ahargana Current day count since epoch
 * @returns Detailed Tithi info including Paksha (Fortnight) and fraction
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
 * [Ch. I, v.40] An intercalary month (Adhika Masa) occurs when there is 
 * no solar transit (Sankranti) during a single lunar moon-to-moon cycle. 
 * This ensures the lunar year does not drift away from the solar seasons.
 * 
 * @param ahargana Day count at the start of the lunar month
 * @returns True if the month contains no solar ingress
 */
export function isAdhimasa(ahargana: number): boolean {
  // Check if the Sun enters a new Rashi (30°) within 29.53 days.
  const synodicCycle = 29.530589;
  const sunLongNow = calculateTrueLongitudeSun(ahargana);
  const sunLongFuture = calculateTrueLongitudeSun(ahargana + synodicCycle);
  
  const rashiNow = Math.floor(sunLongNow / 30.0);
  const rashiFuture = Math.floor(sunLongFuture / 30.0);
  
  return rashiNow === rashiFuture;
}

export const LUNAR_MONTH_NAMES = [
  "Chaitra", "Vaishakha", "Jyeshtha", "Ashadha", "Shravana", "Bhadrapada",
  "Ashvina", "Karttika", "Margashirsha", "Pausha", "Magha", "Phalguna"
];

/**
 * High-precision Lunar Month naming logic (Siddhantic).
 * 
 * [Ch. XIV, v.1-3] Traditional lunar months are named after the solar 
 * transit (Sankranti) that occurs within them. This function derives the 
 * base name by finding the Sun's position at the relevant Amavasya.
 * 
 * @param ahargana Current day count
 * @param system Naming system ('amanta' or 'purnimanta')
 * @param injectedSunLongAtBoundary Optional Sun longitude override for data-bridging
 * @param injectedIsKrishnaPaksha Optional Krishna Paksha override for data-bridging
 */
export function getLunarMonthDetails(
  ahargana: number, 
  system: 'amanta' | 'purnimanta' = 'purnimanta',
  injectedSunLongAtBoundary?: number,
  injectedIsKrishnaPaksha?: boolean
): { name: string; isAdhika: boolean } {
  // 1. Find the preceding New Moon (Amavasya boundary)
  // Even for Purnimanta, the NAME is determined by the Sankranti relative to the Amavasya.
  const precedingNewMoon = injectedSunLongAtBoundary !== undefined ? ahargana : findSSLunarBoundary(ahargana, 0, -1);
  
  // 2. Sun longitude at that New Moon
  const lSunAtNM = injectedSunLongAtBoundary !== undefined ? injectedSunLongAtBoundary : calculateTrueLongitudeSun(precedingNewMoon);
  
  // 3. Current Paksha status
  let isKrishna;
  if (injectedIsKrishnaPaksha !== undefined) {
    isKrishna = injectedIsKrishnaPaksha;
  } else {
    const pakshaIdx = getTithiDetails(ahargana).index;
    isKrishna = pakshaIdx > 15;
  }

  // 4. Base index (Meshadi)
  // Rule: Chaitra is the month where Sun enters Mesha (Idx 0).
  // At the preceding New Moon, the Sun was in Meena (Idx 11).
  const solarRashiAtNM = Math.floor(lSunAtNM / 30.0);
  
  // Month Name = Index of the NEXT Rashi
  let monthIdx = (solarRashiAtNM + 1) % 12;
  
  // 5. Purnimanta Shift
  // In Purnimanta, the month changes at Full Moon (start of Krishna Paksha).
  // The name used for Krishna Paksha is the name of the NEXT Amanta month.
  if (system === 'purnimanta' && isKrishna) {
    monthIdx = (monthIdx + 1) % 12;
  }

  return {
    name: LUNAR_MONTH_NAMES[monthIdx],
    isAdhika: isAdhimasa(ahargana) // Simplified check for now
  };
}

/**
 * Get the name of the Lunar Month.
 * 
 * [Ch. XIV, v.1-3] Traditional lunar months (Meshadi) are named based on 
 * the solar Rashi occupied by the Sun at the preceding New Moon.
 * 
 * @param ahargana Current day count
 * @param system Naming system ('amanta' or 'purnimanta')
 * @param rawSunLongAtNM Optional Sun longitude at the preceding New Moon
 * @param isKrishnaPaksha Optional flag indicating a waning moon paksha
 * @returns The traditional month name (e.g., 'Chaitra')
 */
export function getLunarMonthName(
  ahargana: number, 
  system: 'amanta' | 'purnimanta' = 'purnimanta',
  rawSunLongAtNM?: number, 
  isKrishnaPaksha?: boolean
): string {
  const details = getLunarMonthDetails(ahargana, system, rawSunLongAtNM, isKrishnaPaksha);
  return details.isAdhika ? `Adhika ${details.name}` : details.name;
}

/**
 * Calculates the day of the current solar month (Saura-masa).
 * 
 * [Ch. XIV, v.7-11] The solar day count begins at the moment of ingress (Sankranti).
 * 
 * @param ahargana Current day count
 * @param rawSunLong Optional Sun longitude override
 * @returns Day of the month (1-indexed)
 */
export function getSolarMonthDay(ahargana: number, rawSunLong?: number): number {
  const am = Math.floor(ahargana);
  const effectiveRashiIdx = getSolarMonthSign(ahargana, rawSunLong);
  const targetRashi = (effectiveRashiIdx - 1);
  
  const ingressAhargana = findSSSunIngress(am, targetRashi);
  // Day count using civil boundaries: the day of Sankranti is Day 1.
  return am - Math.floor(ingressAhargana) + 1;
}

// ============================================================================
// Nakshatra and Yoga Calculations
// ============================================================================

/**
 * Calculate the 27-system Nakshatra (Lunar Mansion).
 * 
 * [Ch. II, v.64] The ecliptic is divided into 27 equal stations of 
 * 13° 20' each. The mansion is determined by the Moon's true sidereal position.
 * 
 * @param ahargana Current day count
 * @returns Nakshatra info including the Pada (Quarter) of the mansion
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
 * 
 * [Ch. VIII, v.18] Maps the Moon's longitude to the 28-station stations, 
 * accommodating the scriptural asterism Abhijit between Uttara Ashadha 
 * and Shravana.
 * 
 * @param ahargana Current day count
 * @returns Nakshatra index (1-28) and name
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
 * Calculate the Nitya Yoga (Solar-Lunar Yoga).
 * 
 * [Ch. II, v.65] The Yoga is derived from the sum of the longitudes 
 * of the Sun and Moon. Like Nakshatras, each of the 27 Yogas 
 * spans 13° 20'.
 * 
 * @param ahargana Current day count
 * @returns Current Yoga (1=Vishkumbha, ..., 27=Vaidhriti)
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
 * Calculate the Karana (Half-Tithi).
 * 
 * [Ch. II, v.67-68] A Karana is exactly half of a Tithi (6° arc). 
 * There are 11 distinct names that cycle through the 60 Karanas 
 * of a lunar month in a fixed pattern.
 * 
 * @param ahargana Current day count
 * @returns Current Karana index and name
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
  // Specific sequence rules for fixed (Sthira) and moveable (Chara) Karanas
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
 * 
 * [Ch. I, v.13] Returns the sign occupied by the Sun's true longitude.
 * 
 * @param ahargana Current day count
 * @returns 1-based Rashi index (1=Mesha, ..., 12=Meena)
 */
export function getSolarMonthSign(ahargana: number, rawSunLong?: number): number {
  const am = Math.floor(ahargana);
  // Look ahead: if Sun transits into a new rashi today (before next midnight), 
  // then today is Day 1 of that new month.
  const s1 = (rawSunLong !== undefined && Math.abs(ahargana - am) < 0.001) ? rawSunLong : calculateTrueLongitudeSun(am + 1);
  const monthIdx = Math.floor(s1 / 30.0) + 1;
  return ((monthIdx - 1 + 12) % 12) + 1;
}

export const SOLAR_RASHI_NAMES = [
  "Mesha", "Vrishabha", "Mithuna", "Karka", "Simha", "Kanya",
  "Tula", "Vrishchika", "Dhanu", "Makara", "Kumbha", "Meena"
];

export const BIKRAM_MONTH_NAMES = [
  "Baishakh", "Jestha", "Ashadh", "Shrawan", "Bhadra", "Ashwin",
  "Kartik", "Mangsir", "Poush", "Magh", "Falgun", "Chaitra"
];

/**
 * Get the name of the Solar Month (Rashi).
 * 
 * @param ahargana Current day count
 * @returns Combined Rashi name (e.g., 'Mesha')
 */
export function getSolarMonthName(ahargana: number, rawSunLong?: number): string {
  const solarMonthIdx = getSolarMonthSign(ahargana, rawSunLong);
  return SOLAR_RASHI_NAMES[(solarMonthIdx - 1) % 12];
}

/**
 * Get the Bikram Sambat (Solar) month name.
 */
export function getBikramMonthName(ahargana: number, rawSunLong?: number): string {
  const solarMonthIdx = getSolarMonthSign(ahargana, rawSunLong);
  return BIKRAM_MONTH_NAMES[(solarMonthIdx - 1) % 12];
}

/**
 * Get the current Ayana (Solar Progress).
 * 
 * [Ch. XIV, v.9] Determines the Sun's progress relative to solstices. 
 * Uttarayana (Northward) begins at Makara Sankranti (Capricorn); 
 * Dakshinayana (Southward) at Karka Sankranti (Cancer).
 * 
 * @param ahargana Current day count
 * @returns Ayana name
 */
export function getAyana(ahargana: number, rawSunLong?: number): string {
  const sunLong = rawSunLong !== undefined ? rawSunLong : calculateTrueLongitudeSun(ahargana);
  if (sunLong >= 270.0 || sunLong < 90.0) {
    return "Uttarayana (Northward)";
  } else {
    return "Dakshinayana (Southward)";
  }
}

/**
 * Get the current Ritu (Season).
 * 
 * [Ch. XIV, v.10] The solar year is divided into six seasons (Ritus), 
 * following a bimestrial cycle through the zodiac.
 * 
 * @param ahargana Current day count
 * @returns Name of the current Vedic season (e.g., 'Vasanta')
 */
export function getSeason(ahargana: number, rawSunLong?: number): string {
  const solarMonth = getSolarMonthSign(ahargana, rawSunLong);
  const seasons = [
    "Vasanta (Spring)", "Grishma (Summer)", "Varsha (Rains)",
    "Sarad (Autumn)", "Hemanta (Winter)", "Sisira (Winter/Cool)"
  ];
  return seasons[Math.floor((solarMonth - 1) / 2)];
}

/**
 * Calculate topocentric Sunrise and Sunset.
 * 
 * [Ch. II, v.60-63] Calculates the horizon transitions based on 
 * topocentric altitude and the Sun's position.
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
// Planetary Positions (Spashta-graha)
// ============================================================================

/**
 * Detailed Rashi position including degrees and minutes.
 */
export interface RashiPosition {
  index: number;
  name: string;
  degrees: number;
  minutes: number;
  totalLongitude: number;
}

/**
 * Convert raw longitude to a readable Rashi position.
 * 
 * [Ch. II, v.1-2] Maps the 360-degree ecliptic to the 12 signs.
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
 * Get Rashi positions for the Sun, Moon, and star planets.
 * 
 * [Ch. II, v.14-53] Incorporates Manda and Sighra corrections to find 
 * the 'True' (Spashta) positions of all major bodies.
 * 
 * @param ahargana Current civil day count
 * @returns Map of body names to their detailed Rashi data
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
