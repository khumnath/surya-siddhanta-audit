/**
 * Surya-Siddhanta Constants
 * =========================
 * 
 * Central collection of astronomical constants derived from the Surya-Siddhanta,
 * primarily from Chapter I (Mean Motions) and Chapter II (True Longitudes).
 */

// ============================================================================
// Time Cycles (Kalamana)
// ============================================================================

/** 
 * [Ch. I, v.11-13] Days in a Mahayuga (Great Age).
 * Also known as the number of civil days (Savana) in a Great Age.
 * A Mahayuga consists of 4,320,000 solar years.
 */
export const DAYS_PER_MAHAYUGA = 1577917828;

/** 
 * [Ch. I, v.11] Years in a Mahayuga.
 * The Yuga consists of four ages: Krita, Treta, Dvapara, and Kali.
 * Total duration = 4,320,000 solar years.
 */
export const YEARS_PER_MAHAYUGA = 4320000;

/** 
 * [Ch. I] Days per Yugapada (quarter-yuga).
 * Used for mean motion calculations - assumes equal division of civil days per quarter.
 */
export const DAYS_PER_YUGAPADA = DAYS_PER_MAHAYUGA / 4;

// ============================================================================
// Revolutions per Mahayuga (Bhagana)
// ============================================================================

/** 
 * [Ch. I, v.29] Sun's revolutions (Surya Bhagana).
 * This is equal to the number of solar years in a Mahayuga.
 */
export const REV_SUN = 4320000;

/** 
 * [Ch. I, v.30] Moon orbits (Chandra Bhagana).
 * Includes the Bija correction for modern astronomical parity 
 * (Original SS text specifies 57,753,336).
 */
export const REV_MOON = 57753336;

/** 
 * [Ch. I, v.31] Mars orbits (Mangala Bhagana).
 */
export const REV_MARS = 2296832;

/** 
 * [Ch. I, v.32] Mercury's Sighra (fast epicycle) revolutions (Budha Sighra).
 */
export const REV_MERCURY_SIGHRA = 17937060;

/** 
 * [Ch. I, v.31] Jupiter completes 364,220 orbits (Guru Bhagana).
 */
export const REV_JUPITER = 364220;

/** 
 * [Ch. I, v.33] Venus's Sighra (fast epicycle) revolutions (Shukra Sighra).
 */
export const REV_VENUS_SIGHRA = 7022376;

/** 
 * [Ch. I, v.31] Saturn completes 146,568 orbits (Shani Bhagana).
 */
export const REV_SATURN = 146568;

/** 
 * [Ch. I, v.35] Moon's apogee/apsis revolutions (Chandra Mandocca).
 */
export const REV_MOON_APSIS = 488203;

/** 
 * [Ch. I, v.36] Moon's ascending node revolutions (Chandra Pata/Rahu).
 * Traditionally moves in a retrograde direction.
 */
export const REV_MOON_NODE = 232238;

// ============================================================================
// Apogee Longitudes (Mandocca)
// ============================================================================

/** 
 * [Ch. I, Table B] Sun's apogee longitude.
 * Position in degrees at the end of the last Krita Yuga.
 */
export const APOGEE_SUN = 77.0 + 17.0 / 60.0;

/** 
 * [Ch. I, Table B] Mars's apogee longitude (Mangala Mandocca).
 */
export const APOGEE_MARS = 130.0 + 1.0 / 60.0;

/** 
 * [Ch. I, Table B] Mercury's apogee longitude (Budha Mandocca).
 */
export const APOGEE_MERCURY = 220.0 + 26.0 / 60.0;

/** 
 * [Ch. I, Table B] Jupiter's apogee longitude (Guru Mandocca).
 */
export const APOGEE_JUPITER = 171.0 + 16.0 / 60.0;

/** 
 * [Ch. I, Table B] Venus's apogee longitude (Shukra Mandocca).
 */
export const APOGEE_VENUS = 79.0 + 49.0 / 60.0;

/** 
 * [Ch. I, Table B] Saturn's apogee longitude (Shani Mandocca).
 */
export const APOGEE_SATURN = 236.0 + 37.0 / 60.0;

// ============================================================================
// Node Longitudes (Ascending Node - Pata)
// ============================================================================

/** 
 * [Ch. I, Table E] Mars's ascending node (Mangala Pata).
 */
export const NODE_MARS = 40.0 + 6.0 / 60.0;

/** 
 * [Ch. I, Table E] Mercury's ascending node (Budha Pata).
 */
export const NODE_MERCURY = 20.0 + 44.0 / 60.0;

/** 
 * [Ch. I, Table E] Jupiter's ascending node (Guru Pata).
 */
export const NODE_JUPITER = 79.0 + 41.0 / 60.0;

/** 
 * [Ch. I, Table E] Venus's ascending node (Shukra Pata).
 */
export const NODE_VENUS = 59.0 + 46.0 / 60.0;

/** 
 * [Ch. I, Table E] Saturn's ascending node (Shani Pata).
 */
export const NODE_SATURN = 100.0 + 26.0 / 60.0;

// ============================================================================
// Trigonometric Constants
// ============================================================================

/** 
 * [Ch. II, v.15-22] Radius of the sine table (R).
 * Calculated such that 1 arc-minute is approximately 1 unit (2*PI*R = 21600).
 */
export const RADIUS = 3438.0;

/** 
 * [Ch. II, v.28] Obliquity of the ecliptic (Parama Apakrama).
 * Expressed as the sine of 24 degrees (1397 when R = 3438).
 */
export const SINE_MAX_DECLINATION = 1397.0;

// ============================================================================
// Eclipse Constants
// ============================================================================

/** 
 * [Ch. IV, v.1] Sun's diameter (Surya Bimba) in yojanas.
 */
export const DIAMETER_SUN_YOJANAS = 6500.0;

/** 
 * [Ch. IV, v.1] Moon's diameter (Chandra Bimba) in yojanas.
 */
export const DIAMETER_MOON_YOJANAS = 480.0;

/** 
 * [Ch. IV, v.1] Earth's diameter (Bhu Bimba) in yojanas.
 */
export const DIAMETER_EARTH_YOJANAS = 1600.0;

// ============================================================================
// Orbital Distance Constants
// ============================================================================

/** 
 * [Ch. II, v.51-52] Moon's mean distance from Earth in yojanas.
 */
export const MOON_MEAN_DISTANCE = 51570.0;

/** 
 * [Ch. II, v.53] Sun's mean distance from Earth in yojanas.
 */
export const SUN_MEAN_DISTANCE = 689480.0;

/** 
 * [Ch. V, v.6] Distance conversion factor.
 * 1 arc-minute at the Moon's distance corresponds to 15 yojanas.
 */
export const YOJANAS_PER_ARCMIN_MOON = 15.0;
