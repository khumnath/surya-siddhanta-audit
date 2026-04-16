
import { DateTime } from 'luxon';
import { KATHMANDU } from '../src/lib/surya-siddhanta/geography/location';
import { dateTimeToAhargana } from '../src/lib/surya-siddhanta/time/conversions';
import { getLunarMonthName, getTithiDetails } from '../src/lib/surya-siddhanta/calendar/calendar';
import { findModernLunarBoundary } from '../src/lib/surya-siddhanta/calendar/transit-finder';
import { getModernPanchangaElements } from '../src/lib/modern/panchanga-timings';

const ayanamsha = 'lahiri';

console.log("Yugadi 2026 Exact Transitions (March 19-20)\n");
console.log("| Date Time       | Engine | Tithi Name           | Amanta    | Purniman  |");
console.log("|-----------------|--------|----------------------|-----------|-----------|");

const samplePoints = [
    "2026-03-19T06:00:00", // Pre-NM (Sunrise approx)
    "2026-03-19T12:00:00", // Post-NM
    "2026-03-20T06:00:00", // Next Morning
];

for (const iso of samplePoints) {
    const dt = DateTime.fromISO(iso).setZone('Asia/Kathmandu');
    const ahargana = dateTimeToAhargana(dt, KATHMANDU);
    const jsDate = dt.toJSDate();

    // 1. Modern Data
    const modNM1 = findModernLunarBoundary(jsDate, 0, -1);
    const modNM2 = findModernLunarBoundary(new Date(modNM1.getTime() + 15 * 24 * 3600 * 1000), 0, 1);
    const modEl1 = getModernPanchangaElements(modNM1, ayanamsha);
    const modEl2 = getModernPanchangaElements(modNM2, ayanamsha);
    const modSun1 = (modEl1 as any).siderealSun;
    const modSun2 = (modEl2 as any).siderealSun;
    const isAdhikaMod = Math.floor(modSun1 / 30) === Math.floor(modSun2 / 30);
    const modCurrent = getModernPanchangaElements(jsDate, ayanamsha);
    
    const modAmanta = getLunarMonthName(ahargana, 'amanta', modSun1, modCurrent.tithi.index > 15, isAdhikaMod, modSun2);
    const modPurnimanta = getLunarMonthName(ahargana, 'purnimanta', modSun1, modCurrent.tithi.index > 15, isAdhikaMod, modSun2);

    console.log(`| ${dt.toFormat('MMM dd HH:mm')} | Modern | ${modCurrent.tithi.name.padEnd(20)} | ${modAmanta.padEnd(9)} | ${modPurnimanta.padEnd(9)} |`);

    // 2. Traditional Data
    const tradTithi = getTithiDetails(ahargana);
    const tradAmanta = getLunarMonthName(ahargana, 'amanta');
    const tradPurnimanta = getLunarMonthName(ahargana, 'purnimanta');
    console.log(`| ${"".padEnd(12)} | SS     | ${tradTithi.name.padEnd(20)} | ${tradAmanta.padEnd(9)} | ${tradPurnimanta.padEnd(9)} |`);
    console.log("|-----------------|--------|----------------------|-----------|-----------|");
}
