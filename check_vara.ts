
import { DateTime } from 'luxon';
import { gregorianToJdn } from './src/lib/surya-siddhanta/time/conversions';

console.log("Check Weekday for Friday, Feb 18, 3102 BCE (Kali Epoch)");
const kaliJdn = gregorianToJdn(-3101, 2, 18, 12, 0, 0, 0); // Note: Luxon uses -3101 for 3102 BCE in some conventions, or just use 588465.5 directly
console.log(`Kali JDN: ${kaliJdn} (Target: 588465.5)`);

console.log("\nCheck Weekday for Today (Sat, April 11, 2026)");
const todayJdn = gregorianToJdn(2026, 4, 11, 12, 0, 0, 5.75);
console.log(`Today JDN: ${todayJdn}`);

const ahargana = todayJdn - 588465.5;
console.log(`Ahargana: ${ahargana}`);
console.log(`Ahargana % 7: ${Math.floor(ahargana) % 7}`);

console.log("\nWeekday Mappings (Target Sat=6):");
for (let offset = 0; offset < 7; offset++) {
  const vara = (Math.floor(ahargana) + offset) % 7;
  console.log(`Offset +${offset} => Vara index ${vara}`);
}
