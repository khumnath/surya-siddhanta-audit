
import * as Astronomy from 'astronomy-engine';

const date = new Date('2026-04-11T06:10:00Z');
const time = Astronomy.MakeTime(date);

console.log(`Date: ${date.toISOString()}`);
console.log(`time.ut: ${time.ut} (This is the raw Julian Date!)`);
console.log(`time.tt: ${time.tt} (Terrestrial Time)`);
console.log(`Our Current Code does: time.ut + 2451545 = ${time.ut + 2451545}`);
console.log(`Ayanamsha Calculation would be: T = (${time.ut + 2451545} - 2415020.5) / 36525`);
console.log(`T = ${(time.ut + 2451545 - 2415020.5) / 36525}`);
