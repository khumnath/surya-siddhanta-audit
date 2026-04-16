/**
 * Siddhantic Geodesy and Geographic Anchors (Deshantara-vicara)
 * ============================================================
 * 
 * Manages the geographical reference points and longitudinal corrections 
 * necessary for localizing astronomical calculations. In the Surya 
 * Siddhanta, all positions are initially calculated for the Prime Meridian.
 * 
 * [Ch. I, v.60-62]
 *
 * <details class="siddhantic-proof">
 * <summary>Siddhantic Proof: Madhyama (Mean Motions) v.60</summary>
 *
 * **Sanskrit (Devanagari):**
 *
 * तेन देशान्तराभ्यस्ता ग्रहभुक्तिर्विभाजिता ॥
 *
 * **Translation (Burgess):**
 *
 * Multiply the planet's daily motion by the distance in yojanas between the Prime Meridian and the observer's location.
 *
 * **Modern Technical Commentary:**
 *
 * Defines the Deshantara correction (Longitudinal Correction). It adjusts the planetary position calculated for the Prime Meridian to the local observer's longitude based on Earth's circumference.
 *
 * </details>
 * Establishes the 'Madhya-rekha' (Prime Meridian) passing 
 * through Lanka and Avanti (Ujjain), providing the canonical baseline 
 * for astronomical time.
 */

import locationData from '../../../assets/locations.json';
import type { Location } from '../../../types/astronomy';

export { type Location };

/**
 * Registry of known geographic locations for Panchanga localization.
 */
export const LOCATIONS: Record<string, Location> = {};

// Load location data and index by normalized name
locationData.forEach((loc: any) => {
  const normalizedName = loc.name.split('(')[0].trim().toLowerCase();
  LOCATIONS[normalizedName] = {
    name: loc.name,
    latitude: loc.latitude,
    longitude: loc.longitude,
    timezone_offset: loc.timezone_offset,
    timezone_name: loc.timezone_name,
  };
});

/** 
 * [Ch. I, v.62]
 *
 * <details class="siddhantic-proof">
 * <summary>Siddhantic Proof: Madhyama (Mean Motions) v.62</summary>
 *
 * **Sanskrit (Devanagari):**
 *
 * रोहीतकमवन्ती च यथा सन्निहितं सरः ॥
 *
 * **Translation (Burgess):**
 *
 * The line of the Prime Meridian passes through Rohitaka, Avanti (Ujjain), and Kurukshetra.
 *
 * **Modern Technical Commentary:**
 *
 * Geographical definition of the Siddhantic Prime Meridian. Avanti (75° 46' E) is the primary anchor, effectively the 'Greenwich' of ancient Indian astronomy.
 *
 * </details>
 * Ujjain (Avanti) — The Canonical Reference.
 * 
 * Avanti is explicitly named as a point on the line passing from 
 * the 'center of the earth' (Lanka) through the northern pole.
 */
export const UJJAIN: Location = LOCATIONS['ujjain'] || {
  name: "Ujjain (Avanti)",
  latitude: 23.18,
  longitude: 75.76, 
  timezone_offset: 5.5,
  timezone_name: "Asia/Kolkata"
};

/** 
 * Kathmandu — Reference point for Bikram Sambat calibration.
 */
export const KATHMANDU: Location = LOCATIONS['kathmandu'] || {
  name: "Kathmandu",
  latitude: 27.7,
  longitude: 85.32,
  timezone_offset: 5.75,
  timezone_name: "Asia/Kathmandu"
};

/**
 * Retrieves a geographic location from the registry.
 * 
 * @param name The city name to find
 * @returns Found location or defaults to the Ujjain meridian
 */
export function getLocationByName(name: string): Location {
  const nameLower = name.toLowerCase().trim();
  if (!(nameLower in LOCATIONS)) {
    return UJJAIN;
  }
  return LOCATIONS[nameLower];
}

/**
 * Returns the entire registry of available locations.
 */
export function getAllLocations(): Location[] {
  return Object.values(LOCATIONS);
}

/**
 * Calculate the Deshantara correction (Longitudinal adjustment).
 * 
 * [Ch. I, v.60-61]
 *
 * <details class="siddhantic-proof">
 * <summary>Siddhantic Proof: Madhyama (Mean Motions) v.60</summary>
 *
 * **Sanskrit (Devanagari):**
 *
 * तेन देशान्तराभ्यस्ता ग्रहभुक्तिर्विभाजिता ॥
 *
 * **Translation (Burgess):**
 *
 * Multiply the planet's daily motion by the distance in yojanas between the Prime Meridian and the observer's location.
 *
 * **Modern Technical Commentary:**
 *
 * Defines the Deshantara correction (Longitudinal Correction). It adjusts the planetary position calculated for the Prime Meridian to the local observer's longitude based on Earth's circumference.
 *
 * </details>
 * Normalizes mean astronomical positions to the observer's 
 * local longitude. The rule of 'Deshantara' translates the distance 
 * from the Prime Meridian into a time correction for Ahargana.
 * 
 * @param location The observer's target location
 * @returns Time correction in decimal fraction of a day
 */
export function calculateLongitudeCorrection(location: Location): number {
  const longitudeDiff = location.longitude - UJJAIN.longitude;
  
  // Rule: 1 minute of civil time per 0.25 degrees of longitude (4 min/deg)
  const timeCorrectionMinutes = longitudeDiff * 4.0;
  return timeCorrectionMinutes / (24.0 * 60.0);
}
