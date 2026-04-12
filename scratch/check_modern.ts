
import { ModernPanchangaEngine } from '../src/lib/modern/modern-engine';

const testDate = new Date('2026-04-14T12:00:00+05:45');
const elements = ModernPanchangaEngine.getElements(testDate);
console.log(`Date: ${testDate.toISOString()}`);
console.log(`Sidereal Sun (Modern): ${elements.siderealSun}`);
console.log(`Tithi Index: ${elements.tithiIdx}`);
console.log(`Solar Month Index: ${Math.floor(elements.siderealSun / 30) + 1}`);
