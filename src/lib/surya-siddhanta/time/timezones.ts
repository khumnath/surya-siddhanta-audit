/**
 * Timezone Support for Surya-Siddhanta
 * ====================================
 * 
 * Manages the modern temporal offsets required to align local observations 
 * with the traditional prime meridian of the Surya-Siddhanta.
 * 
 * [Ch. I, v.60-62] The principal meridian (Rekha) of the earth passes 
 * through Lanka, Avanti (Ujjain), and Kurukshetra. 
 */

import { DateTime } from 'luxon';
import { getLocationByName } from '../geography/location';

/**
 * Get the UTC offset in hours for a location by name.
 * 
 * This serves as the initial step for the Deshantara (longitude) 
 * correction, adjusting the local time to the reference meridian.
 * 
 * @param locationName Name of the geographic location
 * @returns UTC offset in hours
 */
export function getTimezoneOffset(locationName: string): number {
  const location = getLocationByName(locationName);
  if (location.timezone_offset === undefined) {
    // Default fallback to current system offset if not found
    return DateTime.now().offset / 60.0;
  }
  return location.timezone_offset;
}

/**
 * Get the IANA timezone name for a location.
 * 
 * @param locationName Name of the geographic location
 * @returns IANA timezone string (e.g., 'Asia/Kathmandu')
 */
export function getTimezoneName(locationName: string): string {
  const location = getLocationByName(locationName);
  if (!location.timezone_name) {
    return 'UTC';
  }
  return location.timezone_name;
}

/**
 * Get the UTC offset in hours for a given datetime at a specific location.
 * 
 * @param dt Modern DateTime object
 * @param locationName Name of the geographic location
 * @returns Offset in hours
 */
export function getTimezoneOffsetHours(
  dt: DateTime,
  locationName: string
): number {
  const tzName = getTimezoneName(locationName);
  const zoneDt = dt.setZone(tzName);
  return zoneDt.offset / 60.0;
}

/**
 * Convert a naive datetime to a timezone-aware datetime for a given location.
 * 
 * @param dt Modern DateTime object
 * @param locationName Name of the geographic location
 * @returns Localized DateTime
 */
export function localizeDateTime(dt: DateTime, locationName: string): DateTime {
  const tzName = getTimezoneName(locationName);
  return dt.setZone(tzName);
}

/** [Modern] Standard Indian Time (UTC+5:30) */
export const INDIAN_STANDARD_TIME = 'Asia/Kolkata';

/** [Modern] Nepal Time (UTC+5:45) */
export const NEPAL_TIME = 'Asia/Kathmandu';
