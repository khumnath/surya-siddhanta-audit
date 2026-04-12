import { DateTime } from 'luxon';
import { UJJAIN } from './src/lib/surya-siddhanta/geography/location';
import { dateTimeToAhargana } from './src/lib/surya-siddhanta/time/conversions';
import { calculateTithi, getAllPlanetRashis } from './src/lib/surya-siddhanta/calendar/calendar';
import { getModernPositions, getModernTithi } from './src/lib/modern/astronomy';

// Test Case: 2026-04-10 12:00:00 (Ujjain/Kolkata)
const testDt = DateTime.fromObject({ year: 2026, month: 4, day: 10, hour: 12, minute: 0, second: 0 }, { zone: 'Asia/Kolkata' });
const ahargana = dateTimeToAhargana(testDt, UJJAIN);

// SS Data
const ssTithi = calculateTithi(ahargana);
const rashis = getAllPlanetRashis(ahargana);
const ssSunLon = (rashis.sun.index - 1) * 30;
const ssMoonLon = (rashis.moon.index - 1) * 30;

// Modern Data (Astronomy Engine)
const modernData = getModernPositions(testDt.toJSDate());
const modernTithi = getModernTithi(testDt.toJSDate());

console.log('--- MODERN vs SURYA SIDDHANTA (TYPESCRIPT) ---');
console.log('Timestamp:', testDt.toString());
console.log('Ahargana: ', ahargana.toFixed(6));

console.log('\nMetric        | Modern (Tropical) | SS (Sidereal) | Delta');
console.log('--------------|-------------------|---------------|-------');
console.log(`Tithi         | ${modernTithi.toFixed(4).padStart(17)} | ${ssTithi.toFixed(4).padStart(13)} | ${(modernTithi - ssTithi).toFixed(4)}`);
console.log(`Sun Longitude | ${modernData.sun.toFixed(4).padStart(17)} | ${ssSunLon.toFixed(4).padStart(13)} | ${(modernData.sun - ssSunLon).toFixed(4)}`);
console.log(`Moon Longitude| ${modernData.moon.toFixed(4).padStart(17)} | ${ssMoonLon.toFixed(4).padStart(13)} | ${(modernData.moon - ssMoonLon).toFixed(4)}`);

console.log('\nNote: SS positions are based on our TypeScript engine port.');
console.log('Expected Drifts: ~24 degrees (Ayanamsa) for longitudes.');
