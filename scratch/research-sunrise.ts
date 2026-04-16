import { DateTime } from 'luxon';
import { dateTimeToAhargana, aharganaToDateTime } from '../src/lib/surya-siddhanta/time/conversions';
import { calculateTrueLongitudeSun } from '../src/lib/surya-siddhanta/celestial/sun';
import { calculateTrueLongitudeMoon } from '../src/lib/surya-siddhanta/celestial/moon';
import { normalizeAngle } from '../src/lib/surya-siddhanta/core/utils';
import { calculateSunriseSunset } from '../src/lib/surya-siddhanta/geometry/geodesy';
import { KATHMANDU } from '../src/lib/surya-siddhanta/geography/location';
import { ModernPanchangaEngine } from '../src/lib/modern/modern-engine';

async function researchSunriseAndTithi() {
  const dateStr = "2026-03-19";
  const location = KATHMANDU;
  
  // 1. MODERN (JPL)
  const localMidnight = DateTime.fromISO(`${dateStr}T00:00:00`).setZone('Asia/Kathmandu').toJSDate();
  const modernSunrise = ModernPanchangaEngine.findEvent('Sun', localMidnight, location.latitude, location.longitude, true);
  
  if (modernSunrise) {
    const el = ModernPanchangaEngine.getElements(modernSunrise);
    const diff = (el.siderealMoon - el.siderealSun + 360) % 360;
    const tithiIdx = Math.floor(diff / 12);
    console.log("MODERN (JPL):");
    console.log(`  Sunrise: ${DateTime.fromJSDate(modernSunrise).setZone('Asia/Kathmandu').toFormat('HH:mm:ss')}`);
    console.log(`  Tithi at Sunrise: ${tithiIdx + 1} (Fraction: ${el.tithiFraction.toFixed(4)})`);
    console.log(`  Sun Long: ${el.siderealSun.toFixed(2)}, Moon Long: ${el.siderealMoon.toFixed(2)}`);
  }

  // 2. TRADITIONAL (SS)
  const dayA = Math.floor(dateTimeToAhargana(DateTime.fromISO(`${dateStr}T06:15:00`).setZone('Asia/Kathmandu'), KATHMANDU));
  const sunLong = calculateTrueLongitudeSun(dayA);
  const ssTimes = calculateSunriseSunset(sunLong, location.latitude);
  const ssSunriseA = dayA + (ssTimes.sunrise - 12.0) / 24.0;
  
  const lSunSS = calculateTrueLongitudeSun(ssSunriseA);
  const lMoonSS = calculateTrueLongitudeMoon(ssSunriseA);
  const diffSS = normalizeAngle(lMoonSS - lSunSS);
  const tithiIdxSS = Math.floor(diffSS / 12.0);
  
  console.log("\nTRADITIONAL (SS):");
  const ssTimeStr = `${Math.floor(ssTimes.sunrise).toString().padStart(2,'0')}:${Math.floor((ssTimes.sunrise % 1) * 60).toString().padStart(2,'0')}`;
  console.log(`  Sunrise: ${ssTimeStr} (Calculated decimal: ${ssTimes.sunrise.toFixed(4)})`);
  console.log(`  Tithi at Sunrise: ${tithiIdxSS + 1} (Diff: ${diffSS.toFixed(4)}°)`);
  console.log(`  Sun Long: ${lSunSS.toFixed(2)}, Moon Long: ${lMoonSS.toFixed(2)}`);
}

researchSunriseAndTithi();
