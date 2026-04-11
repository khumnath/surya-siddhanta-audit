import { DateTime } from 'luxon';
import { UJJAIN } from './src/lib/surya-siddhanta/geography/location';
import { dateTimeToAhargana } from './src/lib/surya-siddhanta/time/conversions';
import { 
  calculateTithi, calculateNakshatra, calculateYoga, 
  calculateKarana, getSolarMonthName, getAyana, getSeason,
  getAllPlanetRashis 
} from './src/lib/surya-siddhanta/calendar/calendar';
import { getAllEraYears } from './src/lib/surya-siddhanta/time/eras';

// Test Case: 2026-04-10 12:00:00 (Ujjain)
const testDt = DateTime.fromObject({ year: 2026, month: 4, day: 10, hour: 12, minute: 0, second: 0 }, { zone: 'Asia/Kolkata' });
const ahargana = dateTimeToAhargana(testDt, UJJAIN);

console.log('--- SURYA SIDDHANTA PARITY REPORT (TYPESCRIPT) ---');
console.log('Timestamp:', testDt.toString());
console.log('Ahargana:', ahargana.toFixed(6));

const tithi = calculateTithi(ahargana);
const nakshatra = calculateNakshatra(ahargana);
const yoga = calculateYoga(ahargana);
const karana = calculateKarana(ahargana);
const solarMonth = getSolarMonthName(ahargana);
const ayana = getAyana(ahargana);
const season = getSeason(ahargana);
const eras = getAllEraYears(ahargana);
const rashis = getAllPlanetRashis(ahargana);

console.log('\n--- PANCHANGA ---');
console.log('Tithi:', tithi.toFixed(4));
console.log('Nakshatra:', nakshatra.name);
console.log('Yoga:', yoga.name);
console.log('Karana:', karana.name);
console.log('Solar Mo:', solarMonth);
console.log('Ayana:', ayana);
console.log('Season:', season);

console.log('\n--- ERAS ---');
for (const [era, year] of Object.entries(eras)) {
    console.log(`${era.padEnd(12)}: ${year}`);
}

console.log('\n--- PLANETS (INDEX) ---');
for (const [body, data] of Object.entries(rashis)) {
    console.log(`${body.padEnd(12)}: ${data.index.toFixed(4)}`);
}
