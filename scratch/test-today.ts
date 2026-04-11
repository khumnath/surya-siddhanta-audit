import { computeModernPanchangaTimings } from './src/lib/modern/panchanga-timings';
import { DateTime } from 'luxon';

const location = { latitude: 19.076, longitude: 72.877 }; // Mumbai
const date = new Date('2026-04-11T06:20:00');
const timings = computeModernPanchangaTimings(date, location);

console.log("Modern Sunrise:", timings.sunriseTime.toISOString());
console.log("Nakshatra at Sunrise:", timings.nakshatras[0].name);
console.log("Yoga at Sunrise:", timings.anandadiYoga.name);
