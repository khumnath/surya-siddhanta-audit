
import * as Astronomy from 'astronomy-engine';
import { DateTime } from 'luxon';
import { getLahiriAyanamsha } from './src/lib/modern/ayanamsha';

async function main() {
    const ktm_time = DateTime.fromObject({ year: 2026, month: 4, day: 11, hour: 18, minute: 0 }, { zone: 'UTC+5:45' });
    const target = ktm_time.toJSDate();
    const time = Astronomy.MakeTime(target);
    const ayan = getLahiriAyanamsha(target);

    console.log(`\n--- MODERN GEOCENTRIC PLANET POSITIONS AUDIT ---`);
    console.log(`Time: ${ktm_time.toISO()} (Local Kathmandu)`);
    console.log(`Ayanamsha (Lahiri Code): ${ayan.toFixed(6)}°`);
    console.log(`--------------------------------------------------------------------------------`);
    console.log(`PLANET          | TROPICAL       | SIDEREAL (OURS) | REFERENCE      | DIFF`);
    console.log(`--------------------------------------------------------------------------------`);

    const bodies = [
        { name: 'Surya', body: Astronomy.Body.Sun, ref: 357.3886 },
        { name: 'Chandra', body: Astronomy.Body.Moon, ref: 282.1103 },
        { name: 'Mangal', body: Astronomy.Body.Mars, ref: 337.08777 },
        { name: 'Budha', body: Astronomy.Body.Mercury, ref: 330.8736 },
        { name: 'Guru', body: Astronomy.Body.Jupiter, ref: 82.389 },
        { name: 'Shukra', body: Astronomy.Body.Venus, ref: 20.317 },
        { name: 'Shani', body: Astronomy.Body.Saturn, ref: 342.6147 }
    ];

    // observer at center of earth
    const geocentric = new Astronomy.Observer(0, 0, 0);

    for (const b of bodies) {
        let trop;
        if (b.name === 'Surya') {
            trop = Astronomy.SunPosition(time).elon;
        } else if (b.name === 'Chandra') {
            trop = Astronomy.EclipticGeoMoon(time).lon;
        } else {
            // Get Geocentric Ecliptic Longitude for other planets
            const equ = Astronomy.Equator(b.body, time, geocentric, Astronomy.EquatorEpoch.OfDate, Astronomy.Aberration.Corrected);
            const ecl = Astronomy.RotateVector(Astronomy.RotationMatrix_EquatorialToEcliptic(time), new Astronomy.Vector(equ.vec.x, equ.vec.y, equ.vec.z));
            trop = (Math.atan2(ecl.y, ecl.x) * 180 / Math.PI + 360) % 360;
        }
        
        const sidereal = (trop - ayan + 360) % 360;
        const diff = sidereal - b.ref;
        
        console.log(`${b.name.padEnd(15)} | ${trop.toFixed(4).padEnd(14)} | ${sidereal.toFixed(4).padEnd(15)} | ${b.ref.toFixed(4).padEnd(14)} | ${diff.toFixed(4)}`);
    }

    // Nodes (Rahu/Ketu)
    const node = Astronomy.MoonNode(time);
    const rahuSidereal = (node.lon - ayan + 360) % 360;
    const ketuSidereal = (rahuSidereal + 180) % 360;
    
    console.log(`${'Rahu (Mean)'.padEnd(15)} | ${node.lon.toFixed(4).padEnd(14)} | ${rahuSidereal.toFixed(4).padEnd(15)} | 312.6158       | ${ (rahuSidereal - 312.6158).toFixed(4) }`);
    console.log(`${'Ketu (Mean)'.padEnd(15)} | ${((node.lon + 180)%360).toFixed(4).padEnd(14)} | ${ketuSidereal.toFixed(4).padEnd(15)} | 132.6158       | ${ (ketuSidereal - 132.6158).toFixed(4) }`);
    console.log(`--------------------------------------------------------------------------------\n`);
}

main().catch(console.error);
