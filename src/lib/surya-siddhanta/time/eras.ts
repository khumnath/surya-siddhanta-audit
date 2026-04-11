/**
 * Surya-Siddhanta Era Systems
 * ============================
 * 
 * Implements conversions and year-count logic for the major Indian 
 * calendar eras based on the Surya-Siddhanta epoch.
 * 
 * [Ch. I, v.15-17] Defines the Kali Yuga (432,000 years) as the 
 * foundational period for current historical calculations.
 */

import { KALI_EPOCH_JDN, jdnToGregorian } from './conversions';
import { calculateTrueLongitudeSun } from '../celestial/sun';
import { getSouthSamvatsar, getNorthSamvatsar } from '../calendar/samvatsar';

// ============================================================================
// Era Epoch Definitions (Historical Siddhantic Conventions)
// ============================================================================

/** The Gregorian year corresponding to the start of Kali Yuga. */
export const KALI_YUGA_EPOCH_YEAR = -3101; 

/** Offset between Kali Yuga and Vikram Samvat (3045 years). */
export const VIKRAM_SAMVAT_OFFSET = 3045;

/** Offset between Kali Yuga and Shalivahana Shaka (3179 years). */
export const SHALIVAHANA_SHAKA_OFFSET = 3179;

/** Offset between Kali Yuga and Nepal Sambat (3980 years). */
export const NEPAL_SAMBAT_OFFSET = 3980;

/**
 * Get the Gregorian year from Ahargana.
 * 
 * @param ahargana Current day count
 * @returns Gregorian year
 */
function gregorianYearFromAhargana(ahargana: number): number {
  const jd = KALI_EPOCH_JDN + ahargana;
  const [gYear] = jdnToGregorian(jd);
  return gYear;
}

/**
 * Calculate the SOLAR (Saura) Kali year from Ahargana.
 * 
 * [Ch. I, v.13] The solar year increments precisely when the Sun 
 * enters the first point of the zodiac (Mesha Sankranti, 0° longitude).
 * 
 * @param ahargana Current day count
 * @returns Current solar Kali year
 */
export function kaliSolarYearFromAhargana(ahargana: number): number {
  const gYear = gregorianYearFromAhargana(ahargana);
  const sunLong = calculateTrueLongitudeSun(ahargana);
  
  // Base Kali year from the Gregorian year
  const baseKali = gYear + 3101;
  
  const jd = KALI_EPOCH_JDN + ahargana;
  const [ , gMonth ] = jdnToGregorian(jd);
  
  // Check if we're past Mesha Sankranti (Sun entering 0° Aries)
  if (sunLong >= 330.0) {
    // Sun still in Meena (Pisces) — before Mesha Sankranti
    return baseKali;
  } else if (sunLong < 30.0 && gMonth >= 3) {
    // Sun has entered Mesha — after Mesha Sankranti
    return baseKali + 1;
  } else if (gMonth >= 5) {
    return baseKali + 1;
  } else if (gMonth <= 2) {
    return baseKali;
  } else {
    // Transition month (March/April)
    return sunLong < 330.0 ? baseKali + 1 : baseKali;
  }
}

/**
 * Calculate the LUNAR (Chandra) Kali year from Ahargana.
 * 
 * [Ch. I, v.13] The lunar year traditionally increments at Chaitra 
 * Shukla Pratipada (the first day of the bright half of Chaitra).
 * This occurs when the Sun is in Meena and the lunar month is beginning.
 * 
 * @param ahargana Current day count
 * @returns Current lunar Kali year
 */
export function kaliLunarYearFromAhargana(ahargana: number): number {
  const gYear = gregorianYearFromAhargana(ahargana);
  const sunLong = calculateTrueLongitudeSun(ahargana);
  
  const baseKali = gYear + 3101;
  
  const jd = KALI_EPOCH_JDN + ahargana;
  const [, gMonth] = jdnToGregorian(jd);
  const solarRashi = Math.floor(sunLong / 30.0);
  
  if (gMonth >= 5) {
    return baseKali;
  } else if (gMonth <= 2) {
    return baseKali - 1;
  } else if (solarRashi === 11) {
    return baseKali;
  } else if (solarRashi === 0 && gMonth <= 4) {
    return baseKali;
  } else if (gMonth === 3) {
    return solarRashi >= 11 ? baseKali : baseKali - 1;
  } else {
    return baseKali;
  }
}

/**
 * Calculate the Nepal Sambat year from Ahargana.
 * 
 * A lunar calendar starting at Kartik Shukla Pratipada.
 * Epoch: Oct 20, 879 AD.
 * 
 * @param ahargana Current day count
 * @returns Current Nepal Sambat year
 */
export function nepalSambatYearFromAhargana(ahargana: number): number {
  const gYear = gregorianYearFromAhargana(ahargana);
  const sunLong = calculateTrueLongitudeSun(ahargana);
  
  const baseNS = gYear - 879;
  
  const jd = KALI_EPOCH_JDN + ahargana;
  const [, gMonth] = jdnToGregorian(jd);
  const solarRashi = Math.floor(sunLong / 30.0);
  
  if (gMonth >= 12) {
    return baseNS;
  } else if (gMonth <= 9) {
    return baseNS - 1;
  } else if (solarRashi === 6) {
    return baseNS;
  } else if (solarRashi > 6 && gMonth >= 10) {
    return baseNS;
  } else if (gMonth === 10) {
    return solarRashi >= 6 ? baseNS : baseNS - 1;
  } else {
    return baseNS;
  }
}

/** 
 * Convert Kali year to Vikram Samvat (Lunar/Solar variants exist).
 */
export function kaliToVikramSamvat(kaliYear: number): number {
  return kaliYear - VIKRAM_SAMVAT_OFFSET;
}

/** 
 * Convert Kali year to Shalivahana Shaka (Lunar).
 */
export function kaliToShalivahanaShaka(kaliYear: number): number {
  return kaliYear - SHALIVAHANA_SHAKA_OFFSET;
}

/**
 * Get the year in all supported eras at once.
 * 
 * Includes the 60-year Jupiter cycle (Samvatsar) names for both 
 * North and South Indian systems.
 * 
 * @param ahargana Current day count
 * @returns Object containing all calculated era years and Samvatsars
 */
export function getAllEraYears(ahargana: number): Record<string, number | string> {
  const kaliSolar = kaliSolarYearFromAhargana(ahargana);
  const kaliLunar = kaliLunarYearFromAhargana(ahargana);
  const nepalSambat = nepalSambatYearFromAhargana(ahargana);
  
  return {
    kali_yuga: kaliLunar,
    vikram_samvat: kaliToVikramSamvat(kaliSolar),   
    shalivahana_shaka: kaliToShalivahanaShaka(kaliLunar), 
    nepal_sambat: nepalSambat,
    south_samvatsar: getSouthSamvatsar(kaliLunar).name,
    north_samvatsar: getNorthSamvatsar(ahargana).name,
    north_samvatsar_fraction: getNorthSamvatsar(ahargana).fraction
  };
}

/**
 * Unified interface for getting the year in any supported era.
 * 
 * @param ahargana Current day count
 * @param era Name of the era (e.g., 'kali', 'vikram', 'shaka')
 * @returns The calculated year
 */
export function getEraYear(ahargana: number, era: string = 'kali'): number {
  const eras = getAllEraYears(ahargana);
  const eraLower = era.toLowerCase().replace(/ /g, '_');

  switch (eraLower) {
    case 'kali':
    case 'kali_yuga':
      return eras.kali_yuga as number;
    case 'vikram_samvat':
    case 'vikram':
      return eras.vikram_samvat as number;
    case 'shalivahana_shaka':
    case 'shaka':
      return eras.shalivahana_shaka as number;
    case 'nepal_sambat':
    case 'nepal':
      return eras.nepal_sambat as number;

    default:
      throw new Error(`Unknown era: ${era}`);
  }
}

