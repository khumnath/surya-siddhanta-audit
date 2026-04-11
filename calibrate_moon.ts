
import { DateTime } from 'luxon';
import { calculateTrueLongitudeMoon } from './src/lib/surya-siddhanta/celestial/true_motions';
import { getAyanamsha } from './src/lib/modern/ayanamsha';
import { KATHMANDU } from './src/lib/surya-siddhanta/geography/location';
import { dateTimeToAhargana } from './src/lib/surya-siddhanta/time/conversions';

async function test_revs(rev_moon: number) {
    // Override the constant temporarily for testing if we could, 
    // but we'll just re-implement the mean motion logic here.
    const DAYS_PER_MAHAYUGA = 1577917828;
    const date = DateTime.fromObject({ year: 2026, month: 4, day: 11, hour: 6, minute: 6 }, { zone: 'UTC+5:45' });
    const ahargana = dateTimeToAhargana(date, KATHMANDU);
    
    // Mean Longitude = (Ahargana * Revs / DaysPerMahayuga) * 360
    const meanMoon = (ahargana * rev_moon / DAYS_PER_MAHAYUGA) * 360 % 360;
    
    // Simplification: just using mean for approximate nakshatra check
    const nakIdx = Math.floor(meanMoon / (360/27));
    return { meanMoon, nakIdx };
}

async function main() {
    const targets = [57753336, 57753383.5, 57753350, 57753340];
    
    console.log("Testing REV_MOON values for Today (Target Nakshatra: 21 - Shravana)");
    for (const rev of targets) {
        const { meanMoon, nakIdx } = await test_revs(rev);
        console.log(`Rev: ${rev.toString().padEnd(12)} | Mean Moon: ${meanMoon.toFixed(2)}° | Nakshatra: ${nakIdx} (${getNakName(nakIdx)})`);
    }
}

function getNakName(idx: number) {
    const names = [
      "Ashvini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra",
      "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni",
      "Hasta", "Chitra", "Svati", "Vishakha", "Anuradha", "Jyeshtha",
      "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishtha",
      "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"
    ];
    return names[idx % 27];
}

main().catch(console.error);
