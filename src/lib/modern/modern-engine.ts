/**
 * High-Precision Modern Astronomical Engine (Drik)
 * ===============================================
 * 
 * Provides a modern baseline for comparison using high-precision 
 * planetary theories (VSOP87 for planets and ELP2000 for the Moon).
 */

import * as Astro from './astronomy-lib/index';

/**
 * Data structure for planetary positions in both Tropical 
 * and Sidereal frameworks.
 */
export interface PlanetData {
  name: string;
  tropical: number;
  sidereal: number;
  helio: number;
  siderealRashi: { name: string; degree: number };
  tropicalRashi: { name: string; degree: number };
  siderealNakshatra: { name: string; pada: number; degree: number };
  tropicalNakshatra: { name: string; pada: number; degree: number };
  alt: number;
  az: number;
  rise?: string;
  set?: string;
  distance?: number;
}

export const RASHIS = [
  'Mesha', 'Vrishabha', 'Mithuna', 'Karka', 'Simha', 'Kanya',
  'Tula', 'Vrishchika', 'Dhanu', 'Makara', 'Kumbha', 'Meena'
];

export const NAKSHATRAS = [
  "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashirsha", "Ardra", 
  "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni", 
  "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha", 
  "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", 
  "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"
];

export const TITHIS = [
  "Prathama", "Dwitiya", "Tritiya", "Chaturthi", "Panchami", "Shashthi", "Saptami", "Ashtami", "Navami", "Dashami", "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi", "Purnima",
  "Prathama", "Dwitiya", "Tritiya", "Chaturthi", "Panchami", "Shashti", "Saptami", "Ashtami", "Navami", "Dashami", "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi", "Amavasya"
];

export const YOGAS = [
  "Vishkambha", "Priti", "Ayushman", "Saubhagya", "Shobhana", "Atiganda", "Sukarma", "Dhriti", "Shula", "Ganda", "Vriddhi", "Dhruva", "Vyaghata", "Harshana", "Vajra", "Siddhi", "Vyatipata", "Variyan", "Parigha", "Shiva", "Siddha", "Sadhya", "Shubha", "Shukla", "Brahma", "Indra", "Vaidhriti"
];

export const KARANAS = [
  "Bava", "Balava", "Kaulava", "Taitila", "Gara", "Vanija", "Vishti", "Shakuni", "Chatushpada", "Nagava", "Kinstughna"
];

/**
 * Low-level mathematical utilities for coordinate transformations.
 */
export class AstroMath {
  static readonly RAD = Math.PI / 180;
  static readonly DEG = 180 / Math.PI;

  /**
   * Convert Standard Date to AstroTime (relative to J2000.0).
   */
  static makeTime(date: Date): Astro.AstroTime {
    const jd = (date.getTime() / 86400000) + 2440587.5;
    return new Astro.AstroTime(jd - 2451545.0);
  }

  static getJulianDay(date: Date): number {
    return (date.getTime() / 86400000) + 2440587.5;
  }

  /**
   * Identifies Rashi (Sign) and degree within the sign.
   */
  static getRashi(degree: number) {
    const normalized = (degree % 360 + 360) % 360;
    const index = Math.floor(normalized / 30);
    const rashiDegree = normalized % 30;
    return { name: RASHIS[index], degree: rashiDegree };
  }

  /**
   * Identifies Nakshatra (Mansion) and Pada (Quarter).
   */
  static getNakshatra(degree: number) {
    const normalized = (degree % 360 + 360) % 360;
    const nakshatraIndex = Math.floor(normalized / (360 / 27));
    const nakshatraDegree = normalized % (360 / 27);
    const pada = Math.floor(nakshatraDegree / (360 / 108)) + 1;
    return { name: NAKSHATRAS[nakshatraIndex], pada, degree: nakshatraDegree };
  }

  /**
   * Bridge to modern Ayanamsha models.
   */
  static getAyanamsha(time: Astro.AstroTime, method: string): number {
    const map: Record<string, string> = {
      'lahiri': 'Chitrapaksha (Lahiri)',
      'ss_lib': 'Surya Siddhanta (Libratory)',
      'tropical': 'Tropical (None)'
    };
    const mapped = map[method.toLowerCase()] || method;
    return Astro.getAyanamsa(time, mapped as any);
  }

  static getSunPosition(time: Astro.AstroTime) {
    const sun = Astro.SunPosition(time);
    return (sun.elon + 360) % 360;
  }

  static getMoonPosition(time: Astro.AstroTime) {
    const vec = Astro.GeoVector(Astro.Body.Moon, time, true);
    const ecl = Astro.Ecliptic(vec);
    const distanceKm = vec.Length() * Astro.KM_PER_AU;
    const HP = Math.asin(6378.14 / distanceKm) * (180 / Math.PI);

    return {
      long: (ecl.elon + 360) % 360,
      lat: ecl.elat,
      hp: HP
    };
  }

  static getPlanetPosition(name: string, time: Astro.AstroTime): { long: number, lat: number, dist: number } {
    const data: Record<string, Astro.Body> = {
      Mercury: Astro.Body.Mercury,
      Venus: Astro.Body.Venus,
      Mars: Astro.Body.Mars,
      Jupiter: Astro.Body.Jupiter,
      Saturn: Astro.Body.Saturn
    };

    const body = data[name];
    if (!body) return { long: 0, lat: 0, dist: 1 };

    const geoVec = Astro.GeoVector(body, time, true);
    const geoEcl = Astro.Ecliptic(geoVec);

    return {
      long: geoEcl.elon,
      lat: geoEcl.elat,
      dist: geoVec.Length()
    };
  }

  /**
   * Calculates the Lagna (Ascendant) using modern spherical trigonometry.
   * 
   * @param date Observer's date/time
   * @param lat Latitude
   * @param lon Longitude
   * @param ayanamsha Sidereal offset
   */
  static getLagna(date: Date, lat: number, lon: number, ayanamsha: number) {
    const jd = this.getJulianDay(date);
    const gmst = this.getGMST(jd);
    const lst = (gmst + lon + 360) % 360;
    const t = (jd - 2451545.0) / 36525.0;
    const eps = 23.4392911 - (46.8150 * t) / 3600;
    
    const lstRad = lst * this.RAD;
    const epsRad = eps * this.RAD;
    const phiRad = lat * this.RAD;
    
    const x = Math.cos(lstRad);
    const y = -Math.sin(lstRad) * Math.cos(epsRad) - Math.tan(phiRad) * Math.sin(epsRad);
    let ascendant = Math.atan2(x, y) * this.DEG;
    ascendant = (ascendant + 360) % 360;
    
    const siderealLagna = (ascendant - ayanamsha + 360) % 360;
    return {
      tropical: ascendant,
      sidereal: siderealLagna,
      siderealRashi: this.getRashi(siderealLagna)
    };
  }

  static getGMST(jd: number): number {
    let gmst = 280.46061837 + 360.98564736629 * (jd - 2451545.0);
    return (gmst % 360 + 360) % 360;
  }
}

/**
 * High-precision Drik Panchanga Engine.
 * 
 * Aggregates results from high-precision planetary models to 
 * generate traditional Panchanga elements.
 */
export class ModernPanchangaEngine {
  /**
   * Get the five limbs based on modern astronomical data.
   * 
   * @param date Current timestamp
   * @param ayanMethod Choice of Ayanamsha (Lahiri, Traditional, etc.)
   */
  static getElements(date: Date, ayanMethod: string = 'Chitrapaksha (Lahiri)') {
    const time = AstroMath.makeTime(date);
    const sunP = AstroMath.getSunPosition(time);
    const moon = AstroMath.getMoonPosition(time);
    const ayan = AstroMath.getAyanamsha(time, ayanMethod);

    // Tropical to Sidereal conversion
    const sidMoon = (moon.long - ayan + 360) % 360;
    const sidSun = (sunP - ayan + 360) % 360;
    const diff = (sidMoon - sidSun + 360) % 360;

    return {
      tithiIdx: Math.floor(diff / 12),
      tithiFraction: (diff / 12) % 1,
      nakshatraIdx: Math.floor(sidMoon / (360 / 27)),
      nakshatraFraction: (sidMoon / (360 / 27)) % 1,
      yogaIdx: Math.floor(((sidMoon + sidSun) % 360) / (360 / 27)),
      karanaIdx: Math.floor(diff / 6) % 60,
      siderealMoon: sidMoon,
      siderealSun: sidSun,
      ayan
    };
  }

  /**
   * Search for solar/lunar rising or setting events.
   */
  static findEvent(bodyName: string, date: Date, lat: number, lon: number, rising: boolean): Date | null {
    const bodyMap: Record<string, Astro.Body> = {
      Sun: Astro.Body.Sun,
      Moon: Astro.Body.Moon
    };
    const body = bodyMap[bodyName];
    if (!body) return null;

    const observer = new Astro.Observer(lat, lon, 0);
    const time = AstroMath.makeTime(date);
    try {
      const evt = Astro.SearchRiseSet(body, observer, rising ? +1 : -1, time, 1.0);
      return evt ? evt.date : null;
    } catch (e) {
      return null;
    }
  }
}
