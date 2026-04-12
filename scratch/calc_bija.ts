
import { Body, calculateMeanLongitude } from '../src/lib/surya-siddhanta/celestial/mean_motions';
import { DAYS_PER_MAHAYUGA, REV_SUN } from '../src/lib/surya-siddhanta/core/constants';

function getMeanSunWithBija(ahargana: number, bija: number) {
  const revs = REV_SUN + bija;
  const meanLong = (Number(revs) * Number(ahargana) * 360.0) / Number(DAYS_PER_MAHAYUGA);
  return meanLong % 360.0;
}

const todayAhargana = 1872676.12; // Apr 12 2026 approx
const originalSun = calculateMeanLongitude(Body.SUN, todayAhargana);

console.log(`Original REVS_SUN: ${REV_SUN}`);
console.log(`Original Mean Sun (Approx today): ${originalSun.toFixed(4)}°`);

const bijas = [11, 28, 0];

for (const bija of bijas) {
  const adjusted = getMeanSunWithBija(todayAhargana, bija);
  const shift = (adjusted - originalSun);
  const normalizedShift = (shift + 360) % 360;
  console.log(`Bija +${bija}: Adjusted Mean Sun: ${adjusted.toFixed(4)}° | Shift: ${normalizedShift.toFixed(4)}°`);
}

// User specified gap is 4.6
const targetGap = 4.6;
const calculatedBija = (targetGap * DAYS_PER_MAHAYUGA) / (todayAhargana * 360);
console.log(`\nCalculated Bija to fix ${targetGap}° gap: +${calculatedBija.toFixed(2)}`);
