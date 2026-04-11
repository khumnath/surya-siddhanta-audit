
import * as Astronomy from 'astronomy-engine';
import { DateTime } from 'luxon';
import { getLahiriAyanamsha } from './src/lib/modern/ayanamsha';

async function main() {
    const date = DateTime.fromObject({ year: 2026, month: 4, day: 11, hour: 6, minute: 10 }, { zone: 'UTC+5:45' }).toJSDate();
    const time = Astronomy.MakeTime(date);
    
    const geoMoon = Astronomy.EclipticGeoMoon(time);
    const sun = Astronomy.SunPosition(time);
    const ayan = getLahiriAyanamsha(date);
    
    console.log(`Testing Modern Engine Values at 2026-04-11 06:10 AM (Sunrise)`);
    console.log(`-----------------------------------------------------------`);
    console.log(`Tropical Moon: ${geoMoon.lon.toFixed(4)}°`);
    console.log(`Ayanamsha:     ${ayan.toFixed(4)}°`);
    const siderealMoon = (geoMoon.lon - ayan + 360) % 360;
    console.log(`Sidereal Moon: ${siderealMoon.toFixed(4)}°`);
    
    const nakRaw = siderealMoon / (360/27);
    const nakIdx = Math.floor(nakRaw);
    const nakName = getNakName(nakIdx);
    
    console.log(`Nakshatra:     ${nakIdx + 1} (${nakName}) | Fraction: ${(nakRaw - nakIdx).toFixed(4)}`);
    console.log(`-----------------------------------------------------------`);
    
    // Check Shravana (21) boundary: 266°40' to 280°00' (Nak 21 starts at 266.666)
    // Actually, Shravana is Nak 22 (1-indexed) in some systems?
    // Ashvini(1), ..., U.Ashadha(21), Shravana(22).
    // Let's check my names table.
}

function getNakName(idx: number) {
    const names = [
      "Ashvini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra",
      "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni",
      "Hasta", "Chitra", "Svati", "Vishakha", "Anuradha", "Jyeshtha",
      "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishtha",
      "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"
    ];
    return names[idx % 27];
}

main().catch(console.error);
