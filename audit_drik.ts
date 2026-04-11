import { computeModernPanchangaTimings } from './src/lib/modern/panchanga-timings';
import { KATHMANDU } from './src/lib/surya-siddhanta/geography/location';

async function auditAgainstDrik() {
  const testDate = new Date('2026-04-11T12:00:00Z'); // April 11, 2026
  const t = computeModernPanchangaTimings(testDate, KATHMANDU);
  
  console.log('=== DRIK COMPARISON AUDIT (APRIL 11, 2026) ===');
  console.log('Sunrise:  ', t.sunriseTime.toLocaleTimeString(), ' (Drik says 05:44 AM)');
  console.log('Sunset:   ', t.sunsetTime.toLocaleTimeString(), ' (Drik says 06:26 PM)');
  
  console.log('\nTITHI:');
  t.tithis.forEach(el => {
    console.log(`  ${el.name.padEnd(20)}: ${el.endTimeStr} (${el.endTime?.toLocaleTimeString() || '→'})`);
  });
  console.log(' (Drik: Navami upto 12:52 AM, Apr 12)');

  console.log('\nNAKSHATRA (27-SYSTEM NAMES):');
  t.nakshatras.forEach(el => {
    console.log(`  ${el.name.padEnd(20)}: ${el.endTimeStr} (${el.endTime?.toLocaleTimeString() || '→'})`);
  });
  console.log(' (Drik: Uttara Ashadha upto 01:54 PM)');

  console.log('\nYOGA:');
  t.yogas.forEach(el => {
    console.log(`  ${el.name.padEnd(20)}: ${el.endTimeStr} (${el.endTime?.toLocaleTimeString() || '→'})`);
  });
  console.log(' (Drik: Siddha upto 06:54 PM)');

  console.log('\nANANDADI (28-SYSTEM):');
  t.anandadi28.forEach(el => {
    console.log(`  ${el.name.padEnd(20)}: ${el.endTimeStr} (${el.endTime?.toLocaleTimeString() || '→'})`);
  });
  console.log(' (Drik: Rakshasa upto 07:25 AM, Chara upto 03:38 PM)');
}

auditAgainstDrik().catch(console.error);
