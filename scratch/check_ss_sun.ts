
import { calculateTrueLongitudeSun } from '../src/lib/surya-siddhanta/celestial/sun';
import { dateTimeToAhargana, aharganaToDateTime } from '../src/lib/surya-siddhanta/time/conversions';
import { DateTime } from 'luxon';

const start = DateTime.fromISO('2026-03-14T00:00:00', { zone: 'Asia/Kathmandu' });
for (let i = 0; i < 10; i++) {
  const dt = start.plus({ days: i });
  const a = dateTimeToAhargana(dt);
  const sun = calculateTrueLongitudeSun(a);
  const rashi = Math.floor(sun / 30);
  console.log(`${dt.toFormat('yyyy-MM-dd HH:mm')} | Ahargana: ${a.toFixed(4)} | Sun: ${sun.toFixed(4)} | Rashi: ${rashi}`);
}
