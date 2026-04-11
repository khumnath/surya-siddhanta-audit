/**
 * Core Astronomical Type Definitions
 * =================================
 * 
 * Defines the shared data structures for geography and celestial 
 * coordinates used across both traditional and modern engines.
 */

/**
 * Geographic observer location and temporal offset.
 */
export interface Location {
  name: string;
  latitude: number;
  longitude: number;
  /** GMT/UTC offset in hours (e.g. 5.75 for Kathmandu) */
  timezone_offset: number;
  timezone_name: string;
}

/**
 * Snapshot of planetary sidereal longitudes (0-360°).
 */
export interface ModernCelestialPositions {
  sun: number;
  moon: number;
  mars: number;
  mercury: number;
  jupiter: number;
  venus: number;
  saturn: number;
}
