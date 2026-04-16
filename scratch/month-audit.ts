import { DateTime } from 'luxon';
import { dateTimeToAhargana, aharganaToDateTime } from '../src/lib/surya-siddhanta/time/conversions';
import { getTithiDetails, getLunarMonthName, getEffectiveTithi } from '../src/lib/surya-siddhanta/calendar/calendar';
import { KATHMANDU } from '../src/lib/surya-siddhanta/geography/location';
import { getModernPanchangaElements } from '../src/lib/modern/panchanga-timings';
import { findModernLunarBoundary, findPrecedingTraditionalYugadiAhargana, findPrecedingYugadiAhargana } from '../src/lib/surya-siddhanta/calendar/transit-finder';

async function auditEras() {
  console.log("ERA TRANSIT AUDIT: March 18-21, 2026");
  console.log("---------------------------------------");
  
  for (let d = 18; d <= 21; d++) {
    const dt = DateTime.fromISO(`2026-03-${d}T06:15:00`).setZone('Asia/Kathmandu');
    const ahargana = dateTimeToAhargana(dt, KATHMANDU);
    const gYear = dt.year;

    // Yugadis
    const tradY = findPrecedingTraditionalYugadiAhargana(ahargana);
    const modY = findPrecedingYugadiAhargana(ahargana);
    
    const isPastTradY = Math.floor(ahargana) >= tradY;
    const isPastModY = Math.floor(ahargana) >= modY;
    
    console.log(`[${dt.toFormat('MMM d')}] Ahar=${ahargana.toFixed(2)}`);
    console.log(`  TRAD Yugadi: ${tradY.toFixed(2)} (${isPastTradY ? 'PAST' : 'PRE'})`);
    console.log(`  MOD  Yugadi: ${modY.toFixed(2)} (${isPastModY ? 'PAST' : 'PRE'})`);
    
    const kTrad = (dt.month < 3 && !isPastTradY) ? gYear + 3100 : (isPastTradY ? gYear + 3101 : gYear + 3100);
    const kMod = (dt.month < 3 && !isPastModY) ? gYear + 3100 : (isPastModY ? gYear + 3101 : gYear + 3100);
    console.log(`  Kali: TRAD=${kTrad}, MOD=${kMod}`);
    console.log("---------------------------------------");
  }
}

auditEras();
