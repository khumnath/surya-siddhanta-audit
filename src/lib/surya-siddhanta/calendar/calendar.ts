/**
 * Siddhantic Calendar Systems (Kalanirnaya)
 * =========================================
 * 
 * Provides high-level abstractions for traditional time divisions, 
 * seasonal cycles, and the five limbs (Lagnas) of the Panchanga.
 * 
 * [Ch. I, v.13]
 *
 * <details class="siddhantic-proof">
 * <summary>Siddhantic Proof: Madhyama (Mean Motions) v.13</summary>
 *
 * **Sanskrit (Devanagari):**
 *
 * तद्द्वद्वात्रिंशता तिथिभिश्चान्द्रो मासस्तत्र ।... मासेर्द्वादशभिर्वर्षं दिव्यं तदह उच्यते ॥
 *
 * **Translation (Burgess):**
 *
 * Twelve months make a year, which is called a day and night of the gods (Devaratripa).
 *
 * **Modern Technical Commentary:**
 *
 * Establishes the year as the fundamental solar cycle. It also introduces the 'Divine Day' concept where one human solar year corresponds to a single day for the gods, centered on the North/South poles (Meru).
 *
 * </details>
 * Defines the solar and lunar measures used in calendar computation.
 * [Ch. XIV, v.1-2]
 *
 * <details class="siddhantic-proof">
 * <summary>Siddhantic Proof: Manadhya (Systems of Measurement) v.1</summary>
 *
 * **Sanskrit (Devanagari):**
 *
 * ब्राह्मं दिव्यं तथा पित्र्यं प्राजापत्यं च गौरवम्‌। सौरञ्च सावनं चान्द्रमाक्षं मानानि वै नव।।
 *
 * **Translation (Burgess):**
 *
 * The Brahma, the Divya, the Pitrya, the Prajapatya, the Gaurava (Jovian), the Saura (solar), the Savana, the Chandra, and the Nakshatra - these are the nine systems of measurement.
 *
 * </details>
 * Establishes the nine systems of measurement (Mana) used for 
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
 * [Ch. II, v.66]
 *
 * <details class="siddhantic-proof">
 * <summary>Siddhantic Proof: Spashta (True Longitudes) v.66</summary>
 *
 * **Sanskrit (Devanagari):**
 *
 * अर्कानिःसृतसश्चन्द्रः प्रत्यूहानि दिने दिने । यदर्कान्तरितो गच्छेद् द्वादशांशैः स वै तिथिः ॥
 *
 * **Translation (Burgess):**
 *
 * The period in which the Moon increases its distance from the Sun by twelve degrees is called a lunar day (Tithi).
 *
 * **Modern Technical Commentary:**
 *
 * Defines the Tithi, the primary element of the Panchanga. It is a relative angular measurement (Moon Longitude - Sun Longitude) rather than a fixed temporal duration, leading to Tithis vary in length between 19 and 26 hours.
 *
 * </details>
 * A Tithi is defined as the time taken for the longitudinal 
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
 * Returns the "Effective Tithi" of the civil day, accounting for Adoption 
 * and Kshaya rules often used in calendar labeling.
 */
export function getEffectiveTithi(ahargana: number, engine: 'ss' | 'modern' = 'ss'): { index: number; name: string; paksha: string } {
  const sunrise = Math.floor(ahargana);
  const trad = getTithiDetails(sunrise);
  
  if (engine === 'ss') {
    // For Traditional SS, we generally stick to the sunrise tithi unless 
    // it's the NM day and we want to adopt for the dashboard summary.
    return trad;
  }

  // Modern (Drik) Logic:
  // 1. If today is Amavasya at sunrise, but the New Moon occurs today, 
  //    label as Pratipada (Adoption).
  if (trad.index === 30 && getTithiDetails(sunrise + 0.5).index === 1) {
    return { index: 1, name: "Pratipada", paksha: "Shukla" };
  }

  // 2. Kshaya Handling: If Pratipada ended very shortly after sunrise (e.g. 2026-03-20),
  //    and the day is dominated by Dwitiya, label as Dwitiya.
  //    Check if tithi at sunrise + 1 hour is already the next tithi.
  const tithiPulse = getTithiDetails(sunrise + 0.05); // ~1 hour after sunrise
  if (tithiPulse.index !== trad.index && trad.index === 1) {
     return tithiPulse;
  }

  return trad;
}

/**
 * Detect Adhimasa (Intercalary Month).
 * 
 * [Ch. I, v.40]
 *
 * <details class="siddhantic-proof">
 * <summary>Siddhantic Proof: Madhyama (Mean Motions) v.40</summary>
 *
 * **Sanskrit (Devanagari):**
 *
 * सूर्यैन्दुभगणेभ्योऽन्ये तिथीनां समुदाहृताः । संशान्तिकालविच्छेदादधिमासाः प्रकीर्तिताः ॥
 *
 * **Translation (Burgess):**
 *
 * The intercalary months originate from the solar/lunar revolution difference.
 *
 * **Modern Technical Commentary:**
 *
 * Explains the Adhika Masa (Leap Month) logic. Since the lunar year (~354 days) is shorter than the solar year (~365 days), an extra month is added roughly every 32.5 months to keep the calendar synchronized with the seasons.
 *
 * </details>
 * An intercalary month (Adhika Masa) occurs when there is 
 * no solar transit (Sankranti) during a single lunar moon-to-moon cycle. 
 * This ensures the lunar year does not drift away from the solar seasons.
 * 
 * @param ahargana Day count at the start of the lunar month
 * @returns True if the month contains no solar ingress
 */
export function isAdhimasa(ahargana: number, lSunAtStart?: number): boolean {
  // Traditional Rule: A lunar month is Adhika if no solar Sankranti occurs
  // between two consecutive New Moons.
  
  // 1. Find the boundaries of the current lunar month (Amanta)
  const nm1 = lSunAtStart !== undefined ? ahargana : findSSLunarBoundary(ahargana, 0, -1);
  const nm2 = findSSLunarBoundary(nm1 + 15, 0, 1); // Next New Moon
  
  // 2. Compare Sun Rashi at both boundaries
  const rashi1 = lSunAtStart !== undefined ? Math.floor(lSunAtStart / 30.0) : Math.floor(calculateTrueLongitudeSun(nm1) / 30.0);
  const rashi2 = Math.floor(calculateTrueLongitudeSun(nm2) / 30.0);
  
  return rashi1 === rashi2;
}

export const LUNAR_MONTH_NAMES = [
  "Chaitra", "Vaishakha", "Jyeshtha", "Ashadha", "Shravana", "Bhadrapada",
  "Ashvina", "Karttika", "Margashirsha", "Pausha", "Magha", "Phalguna"
];

/**
 * High-precision Lunar Month naming logic (Siddhantic).
 * 
 * [Ch. XIV, v.1-3]
 *
 * <details class="siddhantic-proof">
 * <summary>Siddhantic Proof: Manadhya (Systems of Measurement) v.1</summary>
 *
 * **Sanskrit (Devanagari):**
 *
 * ब्राह्मं दिव्यं तथा पित्र्यं प्राजापत्यं च गौरवम्‌। सौरञ्च सावनं चान्द्रमाक्षं मानानि वै नव।।
 *
 * **Translation (Burgess):**
 *
 * The Brahma, the Divya, the Pitrya, the Prajapatya, the Gaurava (Jovian), the Saura (solar), the Savana, the Chandra, and the Nakshatra - these are the nine systems of measurement.
 *
 * </details>
 * Traditional lunar months are named after the solar 
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
  injectedPaksha?: boolean,
  injectedSunAtNM1?: number,
  injectedSunAtNM2?: number
): { name: string; isAdhika: boolean } {
  // 1. Determine Tithi and Paksha 
  let isKrishna: boolean;
  const tithi = getTithiDetails(ahargana);
  if (injectedPaksha !== undefined) {
    isKrishna = injectedPaksha;
  } else {
    isKrishna = tithi.index > 15;
    
    // Amavasya Day Month Adoption (Kshaya or standard NM day)
    if (tithi.index === 30) {
      isKrishna = false; // Treat as the start of the new Shukla month
    }
  }

  // 2. Identify the "Target Amanta Month" for naming
  // - For Amanta system: always the current lunation.
  // - For Purnimanta system:
  //    * Shukla paksha takes the current Amanta name.
  //    * Krishna paksha takes the NEXT Amanta month's name.
  //    * This ensures Purnimanta is monotonic (e.g. Phalguna Krishna -> Phalguna Shukla).
  let namingAhargana = ahargana;
  if (system === 'purnimanta' && isKrishna) {
    // Look ahead to the next lunation (approx 15 days from now)
    namingAhargana = ahargana + 15;
  } else if (tithi.index === 30) {
    // If today is Amavasya, we are already adopting the new month
    namingAhargana = ahargana + 1;
  }

  // 3. Find boundaries of the relevant Amanta Month
  const nm1 = findSSLunarBoundary(namingAhargana, 0, -1);
  const nm2 = findSSLunarBoundary(namingAhargana, 0, 1);
  
  const sunNM1 = injectedSunAtNM1 !== undefined ? injectedSunAtNM1 : calculateTrueLongitudeSun(nm1);
  const sunNM2 = injectedSunAtNM2 !== undefined ? injectedSunAtNM2 : calculateTrueLongitudeSun(nm2);

  // 4. Determine Month Name from Solar Ingress (Sankranti)
  // Standard Rule: Month name at NM1 is based on the rashi the Sun will ENTER.
  // If Sun enters rashi R during (NM1, NM2), month name is R.
  // If no ingress, it is an Adhika month.

  const r1 = Math.floor(sunNM1 / 30.0) % 12;
  const r2 = Math.floor(sunNM2 / 30.0) % 12;

  let isAdhika = (r1 === r2);
  let masaNum = (isAdhika) ? (r1 + 1) % 12 : r2;

  // 5. Convert to month name (0=Vaishakha, ..., 10=Phalguna, 11=Chaitra)
  // Mapping: Mesha ingress (0) -> Chaitra (11)
  //          Vrishabha ingress (1) -> Vaishakha (0)
  const monthIdx = (masaNum + 11) % 12; 

  return {
    name: (isAdhika ? 'Adhika ' : '') + LUNAR_MONTH_NAMES[monthIdx],
    isAdhika
  };
}

/**
 * Get the name of the Lunar Month.
 * 
 * [Ch. XIV, v.1-3]
 *
 * <details class="siddhantic-proof">
 * <summary>Siddhantic Proof: Manadhya (Systems of Measurement) v.1</summary>
 *
 * **Sanskrit (Devanagari):**
 *
 * ब्राह्मं दिव्यं तथा पित्र्यं प्राजापत्यं च गौरवम्‌। सौरञ्च सावनं चान्द्रमाक्षं मानानि वै नव।।
 *
 * **Translation (Burgess):**
 *
 * The Brahma, the Divya, the Pitrya, the Prajapatya, the Gaurava (Jovian), the Saura (solar), the Savana, the Chandra, and the Nakshatra - these are the nine systems of measurement.
 *
 * </details>
 * Traditional lunar months (Meshadi) are named based on 
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
  injectedPaksha?: boolean,
  injectedSunAtNM1?: number,
  injectedSunAtNM2?: number
): string {
  const details = getLunarMonthDetails(ahargana, system, injectedPaksha, injectedSunAtNM1, injectedSunAtNM2);
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
 * [Ch. II, v.64]
 *
 * <details class="siddhantic-proof">
 * <summary>Siddhantic Proof: Spashta (True Longitudes) v.64</summary>
 *
 * **Sanskrit (Devanagari):**
 *
 * चन्द्रार्कयोः संबन्धिनो भागाः सप्तविंशतिः । नक्षत्राणि तानि कथ्यन्ते द्वादशांशैश्च तत्समाः ॥
 *
 * **Translation (Burgess):**
 *
 * The ecliptic is divided into twenty-seven equal parts, each called a Nakshatra (13° 20').
 *
 * </details>
 * The ecliptic is divided into 27 equal stations of 
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
 * [Ch. VIII, v.18]
 *
 * <details class="siddhantic-proof">
 * <summary>Siddhantic Proof: Bha-graha-yuti (Stellar Conjunctions) v.18</summary>
 *
 * **Sanskrit (Devanagari):**
 *
 * अभिजिद्‌ ब्रह्महृदयं स्वातिवैष्णववासवाः। अहिर्बुघन्यमुदक्स्थत्वान्न वुप्यन्तेऽर्करश्मभिः।
 *
 * **Translation (Burgess):**
 *
 * Abhijit, Brahma-hridaya, Svati, Shravana, Dhanishtha, and Uttara-Bhadrapada... are never hidden by the sun's rays.
 *
 * **Modern Technical Commentary:**
 *
 * Identifies **Abhijit** (Vega) as a primary scriptural asterism. While the ecliptic is mathematically divided into 27 equal segments for planetary motion, Abhijit is recognized here as a fixed stellar entity, forming the '28th Nakshatra' used in electional astrology (Muhurta).
 *
 * </details>
 * Maps the Moon's longitude to the 28-station stations, 
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
 * [Ch. II, v.65]
 *
 * <details class="siddhantic-proof">
 * <summary>Siddhantic Proof: Spashta (True Longitudes) v.65</summary>
 *
 * **Sanskrit (Devanagari):**
 *
 * रवीन्दुयोगविप्ताश्च योगा भभोगभाजिताः।
 *
 * **Translation (Burgess):**
 *
 * The sum of the longitudes of the Sun and Moon, divided by the span of a Nakshatra (800'), are the Yogas (Vishkambha, etc.).
 *
 * </details>
 * The Yoga is derived from the sum of the longitudes 
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
 * [Ch. II, v.67-68]
 *
 * <details class="siddhantic-proof">
 * <summary>Siddhantic Proof: Spashta (True Longitudes) v.67</summary>
 *
 * **Sanskrit (Devanagari):**
 *
 * ध्रुवाणि शकुनिर्नागं तृतीयं तु चतुष्पदम्‌।
 *
 * **Translation (Burgess):**
 *
 * The fixed (dhruva) Karanas are Shakuni, Naga, and the third is Chatushpada.
 *
 * </details>
 * A Karana is exactly half of a Tithi (6° arc). 
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
 * [Ch. I, v.13]
 *
 * <details class="siddhantic-proof">
 * <summary>Siddhantic Proof: Madhyama (Mean Motions) v.13</summary>
 *
 * **Sanskrit (Devanagari):**
 *
 * तद्द्वद्वात्रिंशता तिथिभिश्चान्द्रो मासस्तत्र ।... मासेर्द्वादशभिर्वर्षं दिव्यं तदह उच्यते ॥
 *
 * **Translation (Burgess):**
 *
 * Twelve months make a year, which is called a day and night of the gods (Devaratripa).
 *
 * **Modern Technical Commentary:**
 *
 * Establishes the year as the fundamental solar cycle. It also introduces the 'Divine Day' concept where one human solar year corresponds to a single day for the gods, centered on the North/South poles (Meru).
 *
 * </details>
 * Returns the sign occupied by the Sun's true longitude.
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
 * [Ch. XIV, v.9]
 *
 * <details class="siddhantic-proof">
 * <summary>Siddhantic Proof: Manadhya (Systems of Measurement) v.9</summary>
 *
 * **Sanskrit (Devanagari):**
 *
 * भानोर्मकरसस्ड्क्रान्तेः षण्मासा उत्तरायणम्‌। कक्कदिस्तु तथाैव स्यात्‌ षण्मासा दक्षिणायनम्‌।।
 *
 * **Translation (Burgess):**
 *
 * From the Sun's entrance into Capricorn (Makara) for six months is the northward progress (Uttarayana); similarly from Cancer (Karka) is the southward progress (Dakshinayana).
 *
 * </details>
 * Determines the Sun's progress relative to solstices. 
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
 * [Ch. XIV, v.10]
 *
 * <details class="siddhantic-proof">
 * <summary>Siddhantic Proof: Manadhya (Systems of Measurement) v.10</summary>
 *
 * **Sanskrit (Devanagari):**
 *
 * द्विराशिनाथा ऋतवस्ततोऽपि शिशिरादयः। मेषादयो द्वादशैते मासास्तैरेव वत्सरः।।
 *
 * **Translation (Burgess):**
 *
 * The seasons (Ritus) like Shishira etc. each last for two signs; the twelve signs starting from Aries (Mesha) are the months, which together make the year.
 *
 * </details>
 * The solar year is divided into six seasons (Ritus), 
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
  return seasons[Math.floor((solarMonth % 12) / 2)];
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
