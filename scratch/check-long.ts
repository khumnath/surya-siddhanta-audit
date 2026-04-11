import { getModernPositions } from './src/lib/modern/astronomy';
import { getAyanamsha } from './src/lib/modern/ayanamsha';

const date = new Date('2026-04-11T07:25:00+05:45'); // Kathmandu time
const ayan = getAyanamsha(date, 'lahiri');
const pos = getModernPositions(date, 'lahiri');
const moonLong = pos.find(p => p.name === 'Moon')?.longitude || 0;

console.log(`Moon Longitude at 07:25 AM: ${moonLong.toFixed(4)}`);
console.log(`Sidereal Moon Longitude (Lahiri): ${(moonLong).toFixed(4)}`);
// Wait, getModernPositions should already return sidereal? Let's check.
