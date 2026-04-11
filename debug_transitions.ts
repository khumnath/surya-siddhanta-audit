
import { calculateTrueLongitudeMoon } from './src/lib/surya-siddhanta/celestial/moon';
import { calculateSunriseSunset } from './src/lib/surya-siddhanta/geometry/geodesy';
import { calculateTrueLongitudeSun } from './src/lib/surya-siddhanta/celestial/sun';
import { dateTimeToAhargana } from './src/lib/surya-siddhanta/time/conversions';
import { DateTime } from 'luxon';
import { KATHMANDU } from './src/lib/surya-siddhanta/geography/location';

const dt = DateTime.fromObject({ year: 2026, month: 4, day: 11, hour: 12 }, { zone: 'UTC+5:45' });
const ahargana = dateTimeToAhargana(dt, KATHMANDU);
const dayA = Math.floor(ahargana);

const sunLong = calculateTrueLongitudeSun(dayA);
const sunTimes = calculateSunriseSunset(sunLong, KATHMANDU.latitude);
const sunriseA = dayA + (sunTimes.sunrise - 12.0) / 24.0;
const nextSunriseA = sunriseA + 1.0; // Approximation for test

console.log(`Date: ${dt.toISODate()}`);
console.log(`Sunrise (decimal hours): ${sunTimes.sunrise}`);
console.log(`Sunrise Ahargana: ${sunriseA}`);

function getNakIdx(a: number): number {
  const lMoon = calculateTrueLongitudeMoon(a);
  return Math.floor(lMoon / (360.0 / 27.0));
}

console.log("\nSearching for transitions between sunrise and next sunrise...");
const step = 0.005;
let prevIdx = getNakIdx(sunriseA);
console.log(`At Sunrise: NakIdx ${prevIdx} (${prevIdx + 1})`);

for (let t = sunriseA + step; t <= nextSunriseA; t += step) {
  const curIdx = getNakIdx(t);
  if (curIdx !== prevIdx) {
    const hours = sunTimes.sunrise + (t - sunriseA) * 24.0;
    console.log(`At ahargana ${t.toFixed(4)} (~${hours.toFixed(2)} hrs): Transition ${prevIdx} -> ${curIdx}`);
    prevIdx = curIdx;
  }
}
