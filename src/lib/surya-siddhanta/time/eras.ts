/**
 * Siddhantic Era Systems (Kala-mana)
 * ==================================
 * 
 * Implements conversions and year-count logic for the major Indian 
 * calendar eras (Kali, Vikram, Shaka, Nepal) based on the Surya-Siddhanta epoch.
 * 
 * [Ch. I, v.15-17] Defines the foundational chronometry of the Four Ages (Yugas). 
 * The Kali Yuga (432,000 years) is established as 1/10th of a Mahayuga.
 * [Ch. I, v.21] Provides the basis for the current Kali epoch, which is the 
 * zero-point for all astronomical calculations in the Siddhanta.
 */

import { KALI_EPOCH_JDN, jdnToGregorian } from './conversions';
import { calculateTrueLongitudeSun } from '../celestial/sun';
import { getSouthSamvatsar, getNorthSamvatsar } from '../calendar/samvatsar';
import { findPrecedingYugadiAhargana, findPrecedingNepalSambatAhargana } from '../calendar/transit-finder';

// ============================================================================
// Era Epoch Definitions (Historical Siddhantic Conventions)
// ============================================================================

/** 
 * The Gregorian year corresponding to the start of Kali Yuga. 
 * Traditional Epoch: February 18, 3102 BCE (JD 588465.5).
 */
export const KALI_YUGA_EPOCH_YEAR = -3101; 

/** Offset between Kali Yuga and Vikram Samvat (3044 years). */
export const VIKRAM_SAMVAT_OFFSET = 3044;

/** Offset between Kali Yuga and Shalivahana Shaka (3179 years). */
export const SHALIVAHANA_SHAKA_OFFSET = 3179;

/** Offset between Kali Yuga and Nepal Sambat (3980 years). */
export const NEPAL_SAMBAT_OFFSET = 3980;

/**
 * Get the Gregorian year from Ahargana.
 * 
 * @param ahargana Current day count (days since Kali Epoch)
 * @returns Gregorian proleptic year
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
 * enters the first point of the zodiac (Mesha Sankranti, 0° sidereal longitude).
 * 
 * @param ahargana Current day count
 * @returns Current solar Kali year (e.g., 5127)
 */
export function kaliSolarYearFromAhargana(ahargana: number): number {
  const gYear = gregorianYearFromAhargana(ahargana);
  const sunLong = calculateTrueLongitudeSun(ahargana);
  
  // Mesha Sankranti normally occurs in mid-April.
  // We determine the year based on whether the transit has occurred.
  const baseKali = gYear + 3100;
  
  const jd = KALI_EPOCH_JDN + ahargana;
  const [ , gMonth ] = jdnToGregorian(jd);
  
  // High-level filter logic to avoid heavy transit finding for obvious dates.
  if (gMonth < 4) {
    return baseKali;
  } else if (gMonth > 4) {
    return baseKali + 1;
  } else {
    // April (Transition Month): Check if Sun is already in Mesha or past.
    return (sunLong < 30) ? baseKali + 1 : baseKali;
  }
}

/**
 * Calculate the LUNAR (Chandra) Kali year from Ahargana.
 * 
 * [Ch. I, v.13] The lunar year formally increments at Chaitra 
 * Shukla Pratipada (Yugadi). This point marks the start of the 
 * ritual year and varies relative to the solar year.
 * 
 * @param ahargana Current day count
 * @returns Current lunar Kali year
 */
export function kaliLunarYearFromAhargana(ahargana: number): number {
  const gYear = gregorianYearFromAhargana(ahargana);
  const baseKali = gYear + 3100;
  
  const jd = KALI_EPOCH_JDN + ahargana;
  const [, gMonth] = jdnToGregorian(jd);
  
  // Lunar year starts at Yugadi (typically late March or April).
  if (gMonth < 3) {
    return baseKali;
  } else if (gMonth > 4) {
    return baseKali + 1;
  } else {
    // March/April: Resolve against the exact Chaitra boundary.
    const yugadiAhar = findPrecedingYugadiAhargana(ahargana);
    const yugadiYear = gregorianYearFromAhargana(yugadiAhar);
    
    // If the Yugadi boundary for the current cycle happened in this 
    // Gregorian year, the Lunar year count has successfully incremented.
    return (yugadiYear === gYear) ? baseKali + 1 : baseKali;
  }
}

/**
 * Calculate the Nepal Sambat year from Ahargana.
 * 
 * A specialized lunar era starting at Kartik Shukla Pratipada.
 * Epoch (Year 0): October 20, 879 AD.
 * 
 * @param ahargana Current day count
 * @returns Current Nepal Sambat year (e.g., 1146)
 */
export function nepalSambatYearFromAhargana(ahargana: number): number {
  const gYear = gregorianYearFromAhargana(ahargana);
  const baseNS = gYear - 879;
  
  const nsBoundary = findPrecedingNepalSambatAhargana(ahargana);
  const nsBoundaryYear = gregorianYearFromAhargana(nsBoundary);
  
  return (nsBoundaryYear === gYear) ? baseNS : baseNS - 1;
}

/** 
 * Convert Kali lunar year to Vikram Samvat.
 * Offset: Kali 3044 = VS 0.
 */
export function kaliToVikramSamvat(kaliYear: number): number {
  return kaliYear - VIKRAM_SAMVAT_OFFSET;
}

/** 
 * Convert Kali lunar year to Shalivahana Shaka.
 * Offset: Kali 3179 = Shaka 0.
 */
export function kaliToShalivahanaShaka(kaliYear: number): number {
  return kaliYear - SHALIVAHANA_SHAKA_OFFSET;
}

/**
 * Reconciles and returns the year in all major Indian eras at once.
 * 
 * Provides both solar and lunar variants for Vikram Samvat (VS) and 
 * the traditional Nepali Bikram Sambat (BS) system.
 * 
 * @param ahargana Current day count
 * @returns Object containing era years and active Jovian Samvatsars.
 */
export function getAllEraYears(ahargana: number): Record<string, number | string> {
  const kaliSolar = kaliSolarYearFromAhargana(ahargana);
  const kaliLunar = kaliLunarYearFromAhargana(ahargana);
  const nepalSambat = nepalSambatYearFromAhargana(ahargana);
  
  const shaka = kaliToShalivahanaShaka(kaliLunar);

  return {
    kali_yuga: kaliLunar,
    vikram_samvat_lunar: kaliToVikramSamvat(kaliLunar),
    bikram_sambat_solar: kaliToVikramSamvat(kaliSolar),
    shalivahana_shaka: shaka, 
    nepal_sambat: nepalSambat,
    south_samvatsar: getSouthSamvatsar(shaka).name,
    north_samvatsar: getNorthSamvatsar(ahargana).name,
    north_samvatsar_fraction: getNorthSamvatsar(ahargana).fraction
  };
}

/**
 * Multi-era year resolver.
 * 
 * @param ahargana Current day count
 * @param era Identifier for the target era (kali, vikram, shaka, nepal)
 * @returns The requested era year
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
      return eras.vikram_samvat_lunar as number;
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

