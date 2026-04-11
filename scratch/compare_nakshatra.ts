import * as Astronomy from 'astronomy-engine';
import { getAyanamsha } from '../src/lib/modern/ayanamsha';
import { computeDayPanchangaTimings } from '../src/lib/surya-siddhanta/calendar/panchanga-timings';
import { computeModernPanchangaTimings } from '../src/lib/modern/panchanga-timings';
import { Location } from '../src/lib/surya-siddhanta/geography/location';




const KTM: Location = {
  name: "Kathmandu",
  latitude: 27.7172,
  longitude: 85.3240,
  timezone_offset: 5.75,
  timezone_name: "NPT"
};

// Date for "today" based on current metadata
const today = new Date('2026-04-11T12:00:00+05:45');
const ahargana = 1872322.0 + 0.5; // Approximate for 2026-04-11

console.log(`Comparison for date: ${today.toISOString()}`);
console.log(`-------------------------------------------`);

// 1. Surya Siddhanta
console.log("SURYA SIDDHANTA:");
const ss = computeDayPanchangaTimings(1872322.1, KTM.latitude); // Adjust ahargana for KTM noon
ss.nakshatras.forEach(n => {
  console.log(`  ${n.name} ends at ${n.endTimeStr}`);
});

// 2. Modern
console.log("\nMODERN (JPL):");
const time = Astronomy.MakeTime(today);
const moon = Astronomy.EclipticGeoMoon(time);
const ayan = getAyanamsha(today, 'lahiri');
const siderealMoon = (moon.lon - ayan + 360) % 360;

console.log(`  Tropical Moon: ${moon.lon.toFixed(4)}`);
console.log(`  Ayanamsha: ${ayan.toFixed(4)}`);
console.log(`  Sidereal Moon: ${siderealMoon.toFixed(4)}`);

const modern = computeModernPanchangaTimings(today, KTM, 'lahiri');
modern.nakshatras.forEach(n => {
  console.log(`  ${n.name} (index ${n.index}) ends at ${n.endTimeStr}`);
});
