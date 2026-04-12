
import { DateTime } from 'luxon';
import { computeDayPanchangaTimings } from './src/lib/surya-siddhanta/calendar/panchanga-timings';
import { computeModernPanchangaTimings } from './src/lib/modern/panchanga-timings';
import { dateTimeToAhargana } from './src/lib/surya-siddhanta/time/conversions';
import { KATHMANDU } from './src/lib/surya-siddhanta/geography/location';
import { getWeekdayFromDate } from './src/lib/surya-siddhanta/time/astronomy';

async function main() {
    const date = DateTime.fromObject({ year: 2026, month: 4, day: 11, hour: 12 }, { zone: 'UTC+5:45' });
    const ahargana = dateTimeToAhargana(date, KATHMANDU);
    const lat = KATHMANDU.latitude;

    console.log(`\n--- VERIFYING PARITY FOR: ${date.toFormat('yyyy-MM-dd HH:mm')} ---`);
    console.log(`Location: Kathmandu (27.7°N, 85.3°E)`);
    
    // SS Engine
    const ss = computeDayPanchangaTimings(ahargana, lat);
    
    // Modern Engine
    const modern = computeModernPanchangaTimings(date.toJSDate(), KATHMANDU, 'lahiri');

    console.log(`\nANANDADI YOGA (27-SYSTEM) AUDIT:`);
    console.log(`---------------------------------------------------------------------------------------------------`);
    console.log(`TIMING          | SIDDHANTA ENGINE      | MODERN ENGINE         | STATUS`);
    console.log(`---------------------------------------------------------------------------------------------------`);
    
    const count = Math.max(ss.anandadi27.length, modern.anandadi27.length);
    for (let i = 0; i < count; i++) {
        const s = ss.anandadi27[i];
        const m = modern.anandadi27[i];
        
        const ssTime = s ? (s.endAhargana ? `Upto ${s.endTimeStr}` : 'Remaining    ') : '---'.padEnd(15);
        
        const ssVal = s ? s.name.padEnd(20) : 'N/A'.padEnd(20);
        const modVal = m ? m.name.padEnd(20) : 'N/A'.padEnd(20);
        
        const match = (s && m && s.name === m.name);
        const status = match ? '✅ PARITY' : (s && m ? '⚠️ DRIFT' : '---');
        
        console.log(`${ssTime.padEnd(15)} | ${ssVal} | ${modVal} | ${status}`);
    }
    console.log(`---------------------------------------------------------------------------------------------------`);

    console.log(`\nWEEKDAY CHECK (Sunrise-to-Sunrise Rule):`);
    const ssVara = getWeekdayFromDate(new Date(2026, 3, 11)); // April 11
    console.log(`Vedic Weekday Index: ${ssVara} (6=Saturday)`);
    
    console.log(`\nDAILY TRANSITIONS AUDIT (NAKSHATRA):`);
    console.log(`SS Nakshatra:  ${ss.nakshatras[0].name} ends at ${ss.nakshatras[0].endTimeStr}`);
    console.log(`Mod Nakshatra: ${modern.nakshatras[0].name} ends at ${modern.nakshatras[0].endTimeStr}`);
    console.log(`----------------------------------\n`);
}

main().catch(console.error);
