import { AstroTime } from './timezone';
import { e_tilt } from './core';

export enum CoordinateSystem {
  Tropical = 'Tropical',
  Sidereal = 'Sidereal'
}

export enum AyanamsaMethod {
  Lahiri = 'Chitrapaksha (Lahiri)',
  Raman = 'Raman',
  FaganBradley = 'Fagan-Bradley',
  KP = 'Krishnamurti (KP)',
  TrueChitraPaksha = 'True Chitra Paksha (Swiss Ephemeris)',
  TruePushya = 'True Pushya (Pushya Paksha)',
  Yukteshwar = 'Yukteshwar',
  Bhasin = 'Bhasin',
  Revati = 'True Revati (Usha-Shashi)',
  SuryaSiddhanta = 'Surya Siddhanta',
  None = 'None'
}

export function getAyanamsa(time: AstroTime, method: AyanamsaMethod = AyanamsaMethod.Lahiri): number {
  // Years since J2000 (standard astronomical epoch)
  const yearsSinceJ2000 = time.tt / 365.25;
  const t = time.tt / 36525.0; // centuries since J2000

  // Compute True Nutation in Longitude (dpsi) to add to Mean Ayanamsa for True equivalent
  const nut = e_tilt(time);
  const trueNutation = nut.dpsi / 3600; // dpsi is in arcseconds

  // Base Ayanamsa rates
  switch (method) {
    case AyanamsaMethod.Lahiri:
    case AyanamsaMethod.TrueChitraPaksha:
      const meanLahiri = 23.856944 + (yearsSinceJ2000 * (50.290966 / 3600)) + (1.1115 * t * t / 3600);
      return meanLahiri + trueNutation;

    case AyanamsaMethod.Raman:
      return 22.40 + (yearsSinceJ2000 * (50.2564 / 3600));

    case AyanamsaMethod.FaganBradley:
      return 24.74 + (yearsSinceJ2000 * (50.290966 / 3600));

    case AyanamsaMethod.KP:
      return 23.77 + (yearsSinceJ2000 * (50.2388 / 3600));

    case AyanamsaMethod.TruePushya:
      return 24.484167 + (yearsSinceJ2000 * (50.290966 / 3600));

    case AyanamsaMethod.Yukteshwar:
      return 22.68 + (yearsSinceJ2000 * (50.290966 / 3600));

    case AyanamsaMethod.Bhasin:
      return 23.35 + (yearsSinceJ2000 * (50.290966 / 3600));

    case AyanamsaMethod.Revati:
      // True Revati / Usha-Shashi (approx 19°57' at 2000)
      return 19.9575 + (yearsSinceJ2000 * (50.290966 / 3600));

    case AyanamsaMethod.SuryaSiddhanta:
      // Surya Siddhanta (approx 22°27' at 2000)
      return 22.464 + (yearsSinceJ2000 * (50.290966 / 3600));

    case AyanamsaMethod.None:
      return 0;

    default:
      return 23.856944 + (yearsSinceJ2000 * (50.290966 / 3600)) + trueNutation;
  }
}



export function adjustLongitude(longitude: number, time: AstroTime, system: CoordinateSystem, method: AyanamsaMethod = AyanamsaMethod.Lahiri): number {
  if (system === CoordinateSystem.Sidereal) {
    let siderealLong = longitude - getAyanamsa(time, method);
    while (siderealLong < 0) siderealLong += 360;
    return siderealLong % 360;
  }
  return longitude;
}
