
import { ModernPanchangaEngine } from '../src/lib/modern/modern-engine';
import { DateTime } from 'luxon';

function findTithiBoundary(date: Date, targetTithi: number) {
    let low = date.getTime() - 86400000;
    let high = date.getTime() + 86400000;
    
    for (let i = 0; i < 30; i++) {
        const mid = (low + high) / 2;
        const el = ModernPanchangaEngine.getElements(new Date(mid));
        if (el.tithiIdx < targetTithi && !(targetTithi === 0 && el.tithiIdx === 29)) {
            low = mid;
        } else if (targetTithi === 0 && el.tithiIdx === 29) {
            low = mid;
        } else {
            high = mid;
        }
    }
    return new Date(high);
}

const start = DateTime.fromISO('2026-03-18T00:00:00').setZone('Asia/Kathmandu').toJSDate();

console.log('Tithi Transitions:');
// Find transition to Amavasya (29)
const t29 = findTithiBoundary(new Date('2026-03-19T00:00:00Z'), 29);
console.log(`Amavasya starts: ${DateTime.fromJSDate(t29).setZone('Asia/Kathmandu').toFormat('yyyy-MM-dd HH:mm:ss')}`);

// Find transition to Shukla Pratipada (0)
const t0 = findTithiBoundary(new Date('2026-03-19T12:00:00Z'), 0);
console.log(`Shukla Pratipada starts: ${DateTime.fromJSDate(t0).setZone('Asia/Kathmandu').toFormat('yyyy-MM-dd HH:mm:ss')}`);

// Find transition to Shukla Dwitiya (1)
const t1 = findTithiBoundary(new Date('2026-03-20T06:00:00Z'), 1);
console.log(`Shukla Dwitiya starts: ${DateTime.fromJSDate(t1).setZone('Asia/Kathmandu').toFormat('yyyy-MM-dd HH:mm:ss')}`);

const sunrise19 = DateTime.fromISO('2026-03-19T06:12:00').setZone('Asia/Kathmandu').toJSDate();
const sunrise20 = DateTime.fromISO('2026-03-20T06:11:00').setZone('Asia/Kathmandu').toJSDate();

console.log(`Sunrise March 19: 06:12`);
console.log(`Sunrise March 20: 06:11`);
