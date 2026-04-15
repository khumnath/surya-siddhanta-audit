
import { findPrecedingYugadiAhargana, formatAharganaDate } from '../src/lib/surya-siddhanta/calendar/transit-finder';
import { dateTimeToAhargana, aharganaToDateTime } from '../src/lib/surya-siddhanta/time/conversions';
import { KATHMANDU } from '../src/lib/surya-siddhanta/geography/location';
import { DateTime } from 'luxon';

const testCases = [
    { name: 'March 18, 2026 (Before Yugadi)', date: '2026-03-18T12:00:00' },
    { name: 'March 19, 2026 06:00 (Yugadi Early)', date: '2026-03-19T06:00:00' },
    { name: 'March 19, 2026 10:00 (Yugadi Post-NM)', date: '2026-03-19T10:00:00' },
    { name: 'March 20, 2026 (Day after Yugadi)', date: '2026-03-20T12:00:00' }
];

console.log('Case | Input Date | Detected Yugadi | Kali Lunar Year');
console.log('-------------------------------------------------------');

testCases.forEach(c => {
    const dt = DateTime.fromISO(c.date).setZone('Asia/Kathmandu');
    const ahargana = dateTimeToAhargana(dt, KATHMANDU);
    const yugadi = findPrecedingYugadiAhargana(ahargana);
    
    // Logic from App.tsx
    const yugadiDt = aharganaToDateTime(yugadi, KATHMANDU);
    const isPastYugadi = yugadiDt.year === dt.year;
    const kaliLunar = isPastYugadi ? dt.year + 3101 : dt.year + 3100;

    console.log(`${c.name} | ${dt.toFormat('MMM d, HH:mm')} | ${formatAharganaDate(yugadi)} | ${kaliLunar}`);
});
