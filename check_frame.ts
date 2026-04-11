
import * as Astronomy from 'astronomy-engine';

const date = new Date('2026-04-11T06:10:00Z');
const time = Astronomy.MakeTime(date);

const geoMoon = Astronomy.EclipticGeoMoon(time);
console.log(`EclipticGeoMoon longitude: ${geoMoon.lon.toFixed(4)}`);

// Get J2000 position
const equJ2000 = Astronomy.Equator(Astronomy.Body.Moon, time, Astronomy.Observer.Geocentric(), Astronomy.EquatorEpoch.J2000, Astronomy.Aberration.Corrected);
console.log(`Equator J2000 RA: ${equJ2000.ra.toFixed(4)}, Dec: ${equJ2000.dec.toFixed(4)}`);

// Convert EquJ2000 to EclipticJ2000
const eclJ2000 = Astronomy.RotateVector(Astronomy.RotationMatrix_EquatorialToEcliptic(time), new Astronomy.Vector(equJ2000.vec.x, equJ2000.vec.y, equJ2000.vec.z));
// Calculate lon from vector
const lonJ2000 = (Math.atan2(eclJ2000.y, eclJ2000.x) * 180 / Math.PI + 360) % 360;
console.log(`Calculated Ecliptic J2000 Longitude: ${lonJ2000.toFixed(4)}`);
