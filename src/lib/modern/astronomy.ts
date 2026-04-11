/**
 * High-Level Modern Astronomical API (Drik)
 * ========================================
 * 
 * Provides the public interface for high-precision planetary 
 * and house calculations, standardized to the Sidereal framework.
 */

import { AstroMath } from './modern-engine';
import type { ModernCelestialPositions } from '../../types/astronomy';
import type { Location } from '../surya-siddhanta/geography/location';

export { type ModernCelestialPositions, type ModernLagnaInfo };

/**
 * Result structure for the Modern Ascendant calculation.
 */
interface ModernLagnaInfo {
  rashiIndex: number;
  rashiName: string;
  degreeInRashi: number;
  absoluteDegree: number;
}

/**
 * Retrieves modern planetary positions standardized to Sidereal longitudes.
 * 
 * High-precision Tropical coordinates are retrieved from the underlying 
 * models and shifted by the selected Ayanamsha to enable direct 
 * comparison with traditional Sidereal results.
 * 
 * @param date Current timestamp
 * @param method Choice of Ayanamsha (e.g. 'lahiri')
 */
export function getModernPositions(date: Date, method: string = 'Chitrapaksha (Lahiri)'): ModernCelestialPositions {
  const time = AstroMath.makeTime(date);
  const ayan = AstroMath.getAyanamsha(time, method);
  
  const getSid = (name: string) => {
    let long = 0;
    if (name === 'Sun') long = AstroMath.getSunPosition(time);
    else if (name === 'Moon') long = AstroMath.getMoonPosition(time).long;
    else long = AstroMath.getPlanetPosition(name, time).long;
    
    return (long - ayan + 360) % 360;
  };

  return {
    sun: getSid('Sun'),
    moon: getSid('Moon'),
    mars: getSid('Mars'),
    mercury: getSid('Mercury'),
    jupiter: getSid('Jupiter'),
    venus: getSid('Venus'),
    saturn: getSid('Saturn'),
  };
}

/**
 * Calculates current Tithi using high-precision planetary models.
 */
export function getModernTithi(date: Date): number {
  const time = AstroMath.makeTime(date);
  const sunP = AstroMath.getSunPosition(time);
  const moonP = AstroMath.getMoonPosition(time).long;
  
  let diff = (moonP - sunP + 360.0) % 360.0;
  return (diff / 12.0) + 1.0;
}

/**
 * Calculates the modern Sidereal Lagna (Ascendant).
 * 
 * @param date Current timestamp
 * @param location Observer's geographic location
 * @param method Choice of Ayanamsha for Sidereal conversion
 */
export function getModernLagna(date: Date, location: Location, method: string = 'Chitrapaksha (Lahiri)'): ModernLagnaInfo {
  const time = AstroMath.makeTime(date);
  const ayan = AstroMath.getAyanamsha(time, method);
  const res = AstroMath.getLagna(date, location.latitude, location.longitude, ayan);

  const rashiNames = [
    "Mesha (Aries)", "Vrishabha (Taurus)", "Mithuna (Gemini)",
    "Karka (Cancer)", "Simha (Leo)", "Kanya (Virgo)",
    "Tula (Libra)", "Vrishchika (Scorpio)", "Dhanus (Sagittarius)",
    "Makara (Capricorn)", "Kumbha (Aquarius)", "Meena (Pisces)"
  ];
  
  const rashiIdx = Math.floor(res.sidereal / 30.0);

  return {
    rashiIndex: rashiIdx + 1,
    rashiName: rashiNames[rashiIdx],
    degreeInRashi: res.sidereal % 30.0,
    absoluteDegree: res.sidereal
  };
}
