/**
 * Siddhantic Muhurtas and Kaalas (Muhurta-vicara)
 * ===============================================
 * 
 * Implements the mathematical division of the civil day for electional 
 * astrology (Muhurta-shastra). 
 * 
 * [Ch. XIV, v.18] Operates on the 'Savana' day, defined precisely as 
 * the duration from one sunrise to the next.
 * [Ch. I, v.51] Utilizes the 'Speed-Descending' order of planets 
 * (Saturn, Jupiter, Mars, Sun, Venus, Mercury, Moon) to determine the 
 * governance and quality of time segments.
 */

/**
 * Represents a localized time segment (Muhurta/Kaala) with its specific 
 * quality and timing.
 */
export interface MuhurtaTiming {
  name: string;
  startHours: number;
  endHours: number;
  type: 'auspicious' | 'inauspicious' | 'neutral';
  category: 'choghadia' | 'special' | 'abhijit';
}

const CHOGHADIA_NAMES = ["Udveg", "Chara", "Labh", "Amrit", "Kaal", "Shubh", "Rog"];

/**
 * Planetary sequences for the Day Choghadiya, derived from the 
 * weekday ruler (Vara-adhipati) and following the standard 
 * Siddhantic order [Ch. I, v.51].
 */
const DAY_SEQUENCES = [
  [0, 1, 2, 3, 4, 5, 6, 0], // Sun
  [3, 4, 5, 6, 0, 1, 2, 3], // Mon
  [6, 0, 1, 2, 3, 4, 5, 6], // Tue
  [1, 2, 3, 4, 5, 6, 0, 1], // Wed
  [5, 6, 0, 1, 2, 3, 4, 5], // Thu
  [2, 3, 4, 5, 6, 0, 1, 2], // Fri
  [4, 5, 6, 0, 1, 2, 3, 4], // Sat
];

const TYPES: Record<string, 'auspicious' | 'inauspicious' | 'neutral'> = {
  "Amrit": "auspicious",
  "Labh": "auspicious",
  "Shubh": "auspicious",
  "Chara": "neutral",
  "Udveg": "inauspicious",
  "Rog": "inauspicious",
  "Kaal": "inauspicious"
};

/**
 * Calculate the auspicious and inauspicious time segments for the daylight hours.
 * 
 * [Ch. XIV, v.18] The Vardhmana system divides the daylight period 
 * (sunrise to sunset) into eight equal portions for Choghadiyas, and 
 * identifies specific planetary 'Kaalas' (Rahu, Yama) based on the weekday.
 * 
 * @param sunriseHours Sunrise time in decimal hours
 * @param sunsetHours Sunset time in decimal hours
 * @param dayOfWeek Civil weekday (0=Sun, ..., 6=Sat)
 * @returns Array of calculated MuhurtaTiming objects
 */
export function calculateDailyMuhurtas(
  sunriseHours: number,
  sunsetHours: number,
  dayOfWeek: number
): MuhurtaTiming[] {
  const dayDuration = sunsetHours - sunriseHours;
  const partDuration = dayDuration / 8.0;

  const results: MuhurtaTiming[] = [];

  // 1. Choghadiya (Day Segment)
  // Each segment corresponds to one-eighth of the daylight duration. 
  const seq = DAY_SEQUENCES[dayOfWeek];
  for (let i = 0; i < 8; i++) {
    const name = CHOGHADIA_NAMES[seq[i]];
    results.push({
      name: `${name} (Chog)`,
      startHours: sunriseHours + i * partDuration,
      endHours: sunriseHours + (i + 1) * partDuration,
      type: TYPES[name] || 'neutral',
      category: 'choghadia'
    });
  }

  // 2. Special Kaalas (Planetary Periods)
  // [Ch. I, v.51] Based on the planetary hours (Hora), these specific 
  // segments represent times where planetary 'shadows' are dominant.
  const rahuParts = [8, 2, 7, 5, 6, 4, 3];
  const yamaParts = [5, 4, 3, 2, 1, 7, 6];
  const guliParts = [7, 6, 5, 4, 3, 2, 1];

  const getSlot = (part: number) => ({
    start: sunriseHours + (part - 1) * partDuration,
    end: sunriseHours + part * partDuration
  });

  const rahu = getSlot(rahuParts[dayOfWeek]);
  const yama = getSlot(yamaParts[dayOfWeek]);
  const guli = getSlot(guliParts[dayOfWeek]);

  results.push({ name: "Rahu Kaal", startHours: rahu.start, endHours: rahu.end, type: 'inauspicious', category: 'special' });
  results.push({ name: "Yamaganda", startHours: yama.start, endHours: yama.end, type: 'inauspicious', category: 'special' });
  results.push({ name: "Gulika Kaal", startHours: guli.start, endHours: guli.end, type: 'neutral', category: 'special' });

  // 3. Abhijit Muhurta (The Noon Segment)
  // [Ch. VIII, v.18] Abhijit (Alpha Lyrae) is identified as a unique 
  // asterism. The 8th muhurta of the day, centered exactly on local noon, 
  // is dedicated to it and is considered universally victorious.
  const midDay = (sunriseHours + sunsetHours) / 2.0;
  const abhijitDuration = dayDuration / 15.0; // Based on 15 divisions of the day
  results.push({
    name: "Abhijit Muhurta",
    startHours: midDay - abhijitDuration / 2.0,
    endHours: midDay + abhijitDuration / 2.0,
    type: 'auspicious',
    category: 'abhijit'
  });

  return results.sort((a, b) => a.startHours - b.startHours);
}
