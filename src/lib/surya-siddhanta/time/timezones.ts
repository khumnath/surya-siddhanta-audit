/**
 * Siddhantic Timezone and Meridian Support
 * ========================================
 * 
 * Manages the modern temporal offsets required to align local observations 
 * with the traditional prime meridian (Rekha) of the Surya-Siddhanta.
 * 
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
 * The principal meridian (Rekha) of the earth is defined 
 * as passing through Lanka (on the equator), Avanti (Ujjain), and Kurukshetra. 
 * All 'Madhyama' (mean) positions are calculated for this line.
 * [Ch. I, v.63-65] Establishes 'Deshantara'—the longitudinal correction 
 * necessary to find the mean position for any other location (like Kathmandu).
 */

import { DateTime } from 'luxon';
import { getLocationByName } from '../geography/location';

/**
 * Get the UTC offset in hours for a location by name.
 * 
 * This serves as the prerequisite for modern-to-traditional alignment. 
 * To arrive at the correct Siddhantic 'True Position', we first reconcile 
 * the local zone with UTC, then apply the Deshantara shift relative 
 * to the Ujjain Rekha.
 * 
 * @param locationName Name of the geographic location (e.g., 'Kathmandu')
 * @returns UTC offset in hours
 */
export function getTimezoneOffset(locationName: string): number {
  const location = getLocationByName(locationName);
  if (location.timezone_offset === undefined) {
    // Default fallback to current system offset if location is non-standard.
    return DateTime.now().offset / 60.0;
  }
  return location.timezone_offset;
}

/**
 * Get the IANA timezone identifier for a location.
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
 * Get the UTC offset in hours for a specific datetime.
 * 
 * Useful for handling historical dates or potential daylight savings 
 * transitions in modern calendar contexts.
 * 
 * @param dt Modern DateTime object
 * @param locationName Name of the geographic location
 * @returns Precise offset in hours
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
 * Convert a naive datetime to a localized timezone-aware object.
 * 
 * @param dt Modern DateTime object
 * @param locationName Name of the geographic location
 * @returns Localized DateTime snapshot.
 */
export function localizeDateTime(dt: DateTime, locationName: string): DateTime {
  const tzName = getTimezoneName(locationName);
  return dt.setZone(tzName);
}

/** 
 * [Modern] Standard Indian Time (UTC+5:30).
 * Historically approximate to the Ujjain Meridian shift from Greenwich.
 */
export const INDIAN_STANDARD_TIME = 'Asia/Kolkata';

/** 
 * [Modern] Nepal Time (UTC+5:45).
 * Anchored to Gauri-shankar (86° 15' E), requiring a Deshantara shift 
 * relative to Ujjain (75° 47' E).
 */
export const NEPAL_TIME = 'Asia/Kathmandu';
