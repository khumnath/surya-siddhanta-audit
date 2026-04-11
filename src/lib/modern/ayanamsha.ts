/**
 * Ayanamsha (Longitudinal Offset) Systems
 * =======================================
 * 
 * Manages the conversion between Tropical (Equinoctial) and 
 * Sidereal (Fixed Star) longitude systems.
 */

import * as Astronomy from 'astronomy-engine';
import { KALI_EPOCH_JDN } from '../surya-siddhanta/time/conversions';

export type AyanamshaMode = 'lahiri' | 'ss_lib' | 'tropical';

/**
 * Modern Lahiri (Chitra Paksha) Ayanamsha.
 * 
 * This is the standard ayanamsha used by the Government of India, 
 * assuming a linear precession of roughly 50.3" per year.
 * 
 * @param date Current date
 * @returns Offset in degrees
 */
export function getLahiriAyanamsha(date: Date): number {
  const time = Astronomy.MakeTime(date);
  const jd = time.ut + 2451545.0;
  // Epoch relative to J1900.0
  const T = (jd - 2415020.5) / 36525;
  return 22.460148 + 1.396042 * T + 0.000308 * T * T;
}

/**
 * traditional Surya Siddhanta Libratory Precession (Ayana-chalana).
 * 
 * [Ch. III, v.9-12] Describes precession not as a continuous cycle, 
 * but as a libration (oscillation) of 27° in each direction.
 * 
 * 600 revolutions per Mahayuga implies a total range of 54° over 
 * several thousand years.
 * 
 * @param date Current date
 * @returns Offset in degrees according to traditional formula
 */
export function getSSLibAyanamsha(date: Date): number {
  const time = Astronomy.MakeTime(date);
  const jd = time.ut + 2451545.0;
  const ahargana = jd - KALI_EPOCH_JDN;

  // [Ch. III, v.9] 600 revolutions in a Mahayuga (1,577,917,828 days)
  const totalRevolutions = (ahargana * 600) / 1577917828;
  const angle = (totalRevolutions * 360) % 360;
  
  // Transform cycle to a triangle-wave oscillation
  let bhuja;
  const normalized = angle < 0 ? angle + 360 : angle;
  
  /**
   * [Ch. III, v.10-12] The oscillation moves through 27 degrees 
   * in each quadrant of the 600-revolution cycle.
   */
  if (normalized <= 90) bhuja = normalized;
  else if (normalized <= 270) bhuja = 180 - normalized;
  else bhuja = normalized - 360;

  // 0.3 = 27 degrees amplitude / 90 degrees cycle quadrant
  return bhuja * 0.3;
}

/**
 * Dispatcher to retrieve the current longitudinal offset.
 * 
 * @param date Current date
 * @param mode 'lahiri' (modern), 'ss_lib' (traditional), or 'tropical' (0)
 */
export function getAyanamsha(date: Date, mode: AyanamshaMode): number {
  switch (mode) {
    case 'ss_lib': return getSSLibAyanamsha(date);
    case 'tropical': return 0;
    case 'lahiri':
    default:
      return getLahiriAyanamsha(date);
  }
}
