
import { getAnandadiYoga, getTamilYoga, getNetraJeeva } from './src/lib/surya-siddhanta/calendar/anandadi-yoga';
import { NAKSHATRA_NAMES } from './src/lib/surya-siddhanta/calendar/names';

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

console.log("=================================================================================");
console.log("ANANDADI YOGA & PROSPERITY AUDIT - MASTER TEST SUITE");
console.log("=================================================================================");

for (let w = 0; w < 7; w++) {
  console.log(`\n>>> WEEKDAY: ${WEEKDAYS[w].toUpperCase()}`);
  console.log("ID".padEnd(3) + " | " + "Nakshatra".padEnd(16) + " | " + "Anandadi".padEnd(12) + " | " + "Tamil".padEnd(10) + " | " + "Netra".padEnd(6) + " | " + "Jeeva");
  console.log("-".repeat(70));

  for (let n = 0; n < 27; n++) {
    const yoga = getAnandadiYoga(w, n, 27);
    const tamil = getTamilYoga(w, n);
    const { netra, jeeva } = getNetraJeeva(n, 26); // Assume Sun in Revati (26-idx) for testing 
    
    // Formatting line
    const name = NAKSHATRA_NAMES[n];
    const anand = yoga.name;
    const tamSlot = tamil.name;
    
    console.log(
      `${n.toString().padStart(2)} | ` +
      `${name.padEnd(16)} | ` +
      `${anand.padEnd(12)} | ` +
      `${tamSlot.padEnd(10)} | ` +
      `${netra.toString().padEnd(6)} | ` +
      `${jeeva}`
    );
  }
}

console.log("\n=================================================================================");
console.log("CHALLENGE TEST: Saturday April 11, 2026 (Shravana/Dhanishtha)");
console.log("---------------------------------------------------------------------------------");
const sat_shravana = getAnandadiYoga(6, 21, 27);
const sat_dhanishtha = getAnandadiYoga(6, 22, 27);
console.log(`Saturday + Shravana (21):  ${sat_shravana.name} (Expected: Rakshasa)`);
console.log(`Saturday + Dhanishtha (22): ${sat_dhanishtha.name} (Expected: Chara)`);
console.log("=================================================================================");
