/**
 * Surya-Siddhanta Geographic Location Support
 * ===========================================
 * 
 * Manages the geographical coordinates and longitude corrections 
 * necessary for localizing astronomical events.
 */

import locationData from '../../../assets/locations.json';
import type { Location } from '../../../types/astronomy';

export { type Location };

/**
 * Registry of all predefined locations.
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
 * [Ch. I, v.62] Ujjain (Avanti) is the traditional reference Prime Meridian (Madhya-rekha).
 * It is located on the line passing through Lanka to the North Pole.
 */
export const UJJAIN: Location = LOCATIONS['ujjain'] || {
  name: "Ujjain (Avanti)",
  latitude: 23.18,
  longitude: 75.76, 
  timezone_offset: 5.5,
  timezone_name: "Asia/Kolkata"
};

/** 
 * Kathmandu — Primary location for Bikram Sambat calendar calibration (85.32 E).
 */
export const KATHMANDU: Location = LOCATIONS['kathmandu'] || {
  name: "Kathmandu",
  latitude: 27.7,
  longitude: 85.32,
  timezone_offset: 5.75,
  timezone_name: "Asia/Kathmandu"
};

/**
 * Get a predefined location by name.
 * 
 * @param name The city name to search for
 * @returns Found location or defaults to Ujjain
 */
export function getLocationByName(name: string): Location {
  const nameLower = name.toLowerCase().trim();
  if (!(nameLower in LOCATIONS)) {
    return UJJAIN;
  }
  return LOCATIONS[nameLower];
}

/**
 * Get all available locations.
 */
export function getAllLocations(): Location[] {
  return Object.values(LOCATIONS);
}

/**
 * Calculate the Deshantara correction (Longitude adjustment).
 * 
 * [Ch. I, v.60-61] Adjusts the time of a celestial event based on the 
 * distance between the observer and the Ujjain Prime Meridian.
 * 
 * Rule: 4 minutes of time per 1 degree of longitude difference.
 * 
 * @param location The observer's location
 * @returns Time correction in fraction of a day
 */
export function calculateLongitudeCorrection(location: Location): number {
  const longitudeDiff = location.longitude - UJJAIN.longitude;
  const timeCorrectionMinutes = longitudeDiff * 4.0;
  return timeCorrectionMinutes / (24.0 * 60.0);
}
