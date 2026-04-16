import { DateTime } from 'luxon';
import { dateTimeToAhargana, aharganaToDateTime } from '../src/lib/surya-siddhanta/time/conversions';
import { getTithiDetails } from '../src/lib/surya-siddhanta/calendar/calendar';
import { KATHMANDU } from '../src/lib/surya-siddhanta/geography/location';
import { ModernPanchangaEngine } from '../src/lib/modern/modern-engine';
import { computeModernPanchangaTimings } from '../src/lib/modern/panchanga-timings';

async function researchTransitions() {
  const dateStr = "2026-03-20";
  const dt = DateTime.fromISO(`${dateStr}T06:15:00`).setZone('Asia/Kathmandu');
  const location = KATHMANDU;
  const ayanamsha = 'lahiri';

  console.log(`Transitions for ${dateStr}:`);
  const timings = computeModernPanchangaTimings(dt.toJSDate(), location, ayanamsha);
  
  console.log("Modern Tithis:");
  timings.tithis.forEach(t => {
    const endStr = t.endTime ? DateTime.fromJSDate(t.endTime).setZone('Asia/Kathmandu').toFormat('HH:mm') : "None";
    console.log(`  - ${t.name} (Index ${t.index}) ends at ${endStr}`);
  });
}

researchTransitions();
