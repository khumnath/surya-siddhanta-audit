
import { calculateTrueLongitudeSun } from '../src/lib/surya-siddhanta/celestial/sun';
import { dateTimeToAhargana, aharganaToDateTime } from '../src/lib/surya-siddhanta/time/conversions';
import { getSolarMonthDay } from '../src/lib/surya-siddhanta/calendar/calendar';
import { DateTime } from 'luxon';

const start = DateTime.fromISO('2026-03-19T00:00:00', { zone: 'Asia/Kathmandu' });
console.log("Checking March 19-20, 2026 (Meena Sankranti window)");
for (let i = 0; i < 48; i++) {
  const dt = start.plus({ hours: i });
  const a = dateTimeToAhargana(dt);
  const sun = calculateTrueLongitudeSun(a);
  const rashi = Math.floor(sun / 30);
  const solarDay = getSolarMonthDay(a);
  console.log(`${dt.toFormat('yyyy-MM-dd HH:mm')} | Rashi: ${rashi} | Solar Day: ${solarDay}`);
}
