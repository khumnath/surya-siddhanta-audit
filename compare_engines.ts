import { computeDayPanchangaTimings } from './src/lib/surya-siddhanta/calendar/panchanga-timings';
import { computeModernPanchangaTimings } from './src/lib/modern/panchanga-timings';
import { KATHMANDU } from './src/lib/surya-siddhanta/geography/location';
import { DateTime } from 'luxon';

async function compareEngines() {
  const testDate = new Date('2026-04-11T12:00:00Z');
  const trad = computeDayPanchangaTimings(0, KATHMANDU.latitude); // 0 offset for now
  // Wait, computeDayPanchangaTimings expects Ahargana.
  // Today April 11, 2026 is roughly...
  const jd = (testDate.getTime() / 86400000) + 2440587.5;
  const ahargana = jd - 2451545.0;

  const tradData = computeDayPanchangaTimings(ahargana, KATHMANDU.latitude);
  const modData = computeModernPanchangaTimings(testDate, KATHMANDU);
  
  console.log('=== ENGINE COMPARISON (APRIL 11, 2026) ===');
  
  console.log('\nTRADITIONAL (Surya Siddhanta) NAKSHATRA:');
  tradData.nakshatras.forEach(n => console.log(`  ${n.name}: Ends ${n.endTimeStr}`));
  
  console.log('\nMODERN (JPL Sidereal) NAKSHATRA:');
  modData.nakshatras.forEach(n => console.log(`  ${n.name}: Ends ${n.endTimeStr}`));
}

compareEngines().catch(console.error);
