
import * as Astronomy from 'astronomy-engine';
import { DateTime } from 'luxon';

async function main() {
    // 2026-04-11 07:25 AM (Kathmandu)
    const target = DateTime.fromObject({ year: 2026, month: 4, day: 11, hour: 7, minute: 25 }, { zone: 'UTC+5:45' }).toJSDate();
    const time = Astronomy.MakeTime(target);
    
    const geoMoon = Astronomy.EclipticGeoMoon(time);
    console.log(`Target Time: 2026-04-11 07:25 AM (KTM)`);
    console.log(`Tropical Moon Longitude: ${geoMoon.lon.toFixed(6)}°`);
    
    // Target Sidereal Longitude for end of Shravana (Nak 21, ends at 293.333°)
    const targetSidereal = (21 + 1) * (360/27); 
    // Wait, Nak 21 is Shravana. Ashvini is 0. 
    // 0: Ashvini, 1: Bharani, ..., 20: U.Ashadha, 21: Shravana.
    // Shravana (21) ends at (21 + 1) * (360/27) = 22 * 13.333 = 293.333.
    const targetAyan = geoMoon.lon - targetSidereal;
    
    console.log(`For Shravana to end at exactly 07:25 AM:`);
    console.log(`Required Ayanamsha: ${targetAyan.toFixed(6)}°`);
    
    // Compare with current Lahiri
    const jd = time.ut + 2451545.0;
    const T = (jd - 2415020.5) / 36525;
    const currentLahiri = 22.460148 + 1.396042 * T + 0.000308 * T * T;
    console.log(`Current Code Ayanamsha: ${currentLahiri.toFixed(6)}°`);
    console.log(`Difference (Correction Needed): ${(targetAyan - currentLahiri).toFixed(6)}°`);
}

main().catch(console.error);
