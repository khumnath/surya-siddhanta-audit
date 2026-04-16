
import { DateTime } from 'luxon';
import { KATHMANDU } from '../src/lib/surya-siddhanta/geography/location';
import { dateTimeToAhargana } from '../src/lib/surya-siddhanta/time/conversions';
import { getLunarMonthName, getTithiDetails } from '../src/lib/surya-siddhanta/calendar/calendar';
import { findSSLunarBoundary } from '../src/lib/surya-siddhanta/calendar/transit-finder';
import { calculateTrueLongitudeSun } from '../src/lib/surya-siddhanta/celestial/sun';

const dates = [
    '2026-03-18',
    '2026-03-19',
    '2026-03-20',
    '2026-04-18',
    '2026-04-19',
    '2026-04-20'
];

console.log("Lunar Month Audit (Amanta):\n");

dates.forEach(dateStr => {
    const dt = DateTime.fromISO(dateStr).setZone('Asia/Kathmandu');
    const ahargana = dateTimeToAhargana(dt, KATHMANDU);
    
    const nm = findSSLunarBoundary(ahargana, 0, -1);
    const sunAtNm = calculateTrueLongitudeSun(nm);
    const month = getLunarMonthName(ahargana, 'amanta');
    const tithi = getTithiDetails(ahargana);

    console.log(`${dateStr}: Month: ${month}, Tithi: ${tithi.name} (${tithi.index})`);
    console.log(`  Preceding NM: ${nm.toFixed(4)}, Sun at NM: ${sunAtNm.toFixed(2)} (${Math.floor(sunAtNm/30)})`);
    console.log("------------------------------------------");
});
