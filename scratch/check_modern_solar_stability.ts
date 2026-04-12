import { ModernPanchangaEngine, RASHIS } from '../src/lib/modern/modern-engine';
import { DateTime } from 'luxon';

// Meena Sankranti 2026 Modern
// Transit happens around March 14-15 usually (Lahiri)
// Let's check Mesh Sankranti (Day 1 of Baishakh) 
// In 2026, Mesh Sankranti is around April 14.

async function checkModernSolar() {
    console.log("Checking Modern Solar Stability (Mesh Sankranti 2026)");
    console.log("-----------------------------------------------------");

    const ayan = 'Chitrapaksha (Lahiri)';
    // April 14, 2026
    const baseDate = DateTime.fromObject({ year: 2026, month: 4, day: 14 }, { zone: 'Asia/Kathmandu' });

    for (let hour = -12; hour <= 36; hour++) {
        const dt = baseDate.plus({ hours: hour });
        const jsDate = dt.toJSDate();
        
        const sign = ModernPanchangaEngine.getModernSolarMonthSign(jsDate, ayan);
        const day = ModernPanchangaEngine.getModernSolarMonthDay(jsDate, ayan);
        const sun = ModernPanchangaEngine.getSiderealSun(jsDate, ayan);
        const rashi = Math.floor(sun / 30);

        console.log(`${dt.toFormat('yyyy-MM-dd HH:mm')} | Rashi: ${rashi} | Solar Sign: ${sign} | Solar Day: ${day}`);
    }
}

checkModernSolar();
