/**
 * Siddhantic Anandadi Yogas (Anandadi-vicara)
 * ===========================================
 * 
 * Implements the calculation of the 28 Anandadi Yogas, which are defined 
 * by the intersection of the Weekday (Vara) and the Moon's mansion 
 * (Nakshatra) at the moment of sunrise. 
 * 
 * [Ch. II, v.64] Defines the base 27 mathematical Nakshatra segments 
 * (13° 20' each).
 * [Ch. VIII, v.18] Identifies Abhijit as a distinct scriptural asterism, 
 * justifying the 28-station system used for fine-tuned electional 
 * astrology (Muhurta).
 */

import { ANANDADI_YOGA_NAMES } from './names';

/**
 * 28-Nakshatra Boundaries (including Abhijit).
 * 
 * [Ch. VIII, v.18] While most Nakshatras span 13° 20', the electional system 
 * inserts Abhijit between Uttara Ashadha and Shravana. This specific grid 
 * is used to determine the Anandadi Yogas.
 */
export const NAKSHATRA_28_BOUNDARIES = (() => {
  const boundaries: number[] = [];
  let current = 0;
  for (let i = 0; i < 20; i++) {
    current += 13 + 20/60;
    boundaries.push(current);
  }
  // Star 21: Uttara Ashadha (ends at 276° 40')
  current = 276 + 40/60;
  boundaries.push(current);
  // Star 22: Abhijit (inserted as per Ch. VIII, v.18)
  current = 280 + 53/60 + 20/3600;
  boundaries.push(current);
  // Star 23: Shravana (ends at 293° 20')
  current = 293 + 20/60;
  boundaries.push(current);
  // Stars 24-28
  for (let i = 0; i < 5; i++) {
    current += 13 + 20/60;
    boundaries.push(current);
  }
  return boundaries;
})();

/**
 * Identify the 28-system Nakshatra index for a given longitude.
 * 
 * Maps the sidereal Moon position to one of the 28 scriptural mansions.
 * 
 * @param moonLong Local sidereal longitude of the Moon
 * @returns 0-based index (0-27) in the 28-system
 */
export function getAnandadiNak28Idx(moonLong: number): number {
  const norm = ((moonLong % 360) + 360) % 360;
  for (let i = 0; i < NAKSHATRA_28_BOUNDARIES.length; i++) {
    if (norm < NAKSHATRA_28_BOUNDARIES[i]) return i;
  }
  return 0;
}

/**
 * Get the Anandadi Yoga for a given weekday and Nakshatra.
 * 
 * These yogas (Ananda, Kaladanda, etc.) provide a qualitative classification 
 * for the entire civil day based on the starting Nakshatra at sunrise.
 * 
 * @param weekday 0=Sun (Ravivara), ..., 6=Sat (Shanivara)
 * @param nakshatraIdx 0-based index in the 28-system
 * @returns Yoga data including name and auspiciousness type
 */
export function getAnandadiYoga(
  weekday: number, 
  nakshatraIdx: number
): { index: number; name: string; type: 'auspicious' | 'inauspicious' | 'neutral' } {
  
  // Offsets derived from the rule: Sun starts at Ashwini (1), 
  // Mon starts at Mrigashirsha (5), etc., in the 28-system.
  const offsets = [1, 5, 9, 13, 17, 21, 25];
  const startNaks = offsets[weekday] - 1; 
  const yogaIdx = (nakshatraIdx - startNaks + 28) % 28;

  const auspicious = [0, 3, 4, 6, 7, 10, 11, 12, 13, 18, 19, 20, 23, 25, 26, 27];
  const inauspicious = [1, 2, 5, 8, 9, 14, 15, 16, 17, 21, 22, 24];

  let type: 'auspicious' | 'inauspicious' | 'neutral' = 'neutral';
  if (auspicious.includes(yogaIdx)) type = 'auspicious';
  else if (inauspicious.includes(yogaIdx)) type = 'inauspicious';
  
  return {
    index: yogaIdx + 1,
    name: ANANDADI_YOGA_NAMES[yogaIdx % 28],
    type
  };
}

/**
 * Get the Tamil Yoga classification (Amrita etc.).
 * 
 * A regional interpretive layer used in tandem with the Anandadi sequence.
 * 
 * @param weekday 0=Sun, ..., 6=Sat
 * @param nakIdx 0-based index in the 28-system
 * @returns Classification mapping (Amrita/Siddha/Marana)
 */
export function getTamilYoga(weekday: number, nakIdx: number): { name: string; type: 'auspicious' | 'inauspicious' | 'neutral' } {
  const amrita = [
    [3, 7, 12, 16, 20, 24, 26], // Sun
    [2, 7, 11, 15, 20, 24], // Mon
    [8, 14, 18, 26], // Tue
    [3, 8], // Wed
    [4, 10, 13, 17, 25], // Thu
    [1, 12, 16, 20, 24], // Fri
    [2, 7, 11, 15, 19, 23] // Sat
  ];

  const siddha = [
    [11, 21], // Sun
    [1, 6, 10, 14, 18, 22, 25], // Mon
    [0], // Tue
    [9, 12, 16, 24, 25, 26], // Wed
    [0, 3, 7, 11, 14, 21], // Thu
    [0, 3, 21], // Fri
    [14, 20] // Sat
  ];

  const w = weekday % 7;
  let n = nakIdx % 28;

  // Traditional 27-based mapping for Tamil logic.
  if (n === 21) return { name: 'Marana', type: 'inauspicious' }; 
  if (n > 21) n--;

  if (amrita[w] && amrita[w].includes(n)) return { name: 'Amrita', type: 'auspicious' };
  if (siddha[w] && siddha[w].includes(n)) return { name: 'Siddha', type: 'auspicious' };
  
  return { name: 'Marana', type: 'inauspicious' };
}

/**
 * Calculate Netrama (Eyes) and Jeevanama (Life Force).
 * 
 * Fine-grained indicators of the 'vitality' of the day based on the 
 * angular distance (counted in nakshatras) between the Moon and Sun 
 * at sunrise.
 * 
 * @param nakIdx Current Moon Nakshatra (28-system)
 * @param sunNakIdx Current Sun Nakshatra (28-system)
 * @returns Numerical scores for spiritual visibility and metabolic force.
 */
export function getNetraJeeva(nakIdx: number, sunNakIdx: number): { netra: number; jeeva: number } {
  const dist = (nakIdx - sunNakIdx + 28) % 28 + 1;

  let netra = 0;
  let jeeva = 0;

  // Netra (Eyes): 0=Blind, 1=One-eyed, 2=Two-eyed
  if (dist <= 4 || dist >= 26) {
    netra = 0;
  } else if ((dist >= 5 && dist <= 8) || (dist >= 22 && dist <= 25)) {
    netra = 1;
  } else {
    netra = 2;
  }

  // Jeeva (Life): 0=Dead, 0.5=Half, 1=Full
  if (dist === 1 || dist === 2 || dist === 28) {
    jeeva = 0;
  } else if ((dist >= 3 && dist <= 9) || (dist >= 21 && dist <= 27)) {
    jeeva = 0.5;
  } else {
    jeeva = 1;
  }

  return { netra, jeeva };
}



