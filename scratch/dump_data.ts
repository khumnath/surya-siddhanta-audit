import fs from 'node:fs';
import path from 'node:path';
import { DateTime } from 'luxon';
import { dateTimeToAhargana } from '../src/lib/surya-siddhanta/time/conversions';
import { getAllEraYears } from '../src/lib/surya-siddhanta/time/eras';
import { getTithiDetails, getLunarMonthName } from '../src/lib/surya-siddhanta/calendar/calendar';
import { calculateTrueLongitudeSun } from '../src/lib/surya-siddhanta/celestial/sun';
import { calculateTrueLongitudeMoon } from '../src/lib/surya-siddhanta/celestial/moon';
import { calculateTrueLongitudePlanet } from '../src/lib/surya-siddhanta/celestial/planets';
import { Body } from '../src/lib/surya-siddhanta/celestial/mean_motions';
import { KATHMANDU } from '../src/lib/surya-siddhanta/geography/location';
import { ModernPanchangaEngine } from '../src/lib/modern/modern-engine';
import { calculateSunriseSunset } from '../src/lib/surya-siddhanta/geometry/geodesy';

/**
 * Diagnostic Dumper for Surya Siddhanta Parity API.
 * 
 * Usage: bun scratch/dump_data.ts --date=2026-04-12 --time=12:00:00
 */

async function main() {
    const args = (process as any).argv.slice(2);
    const params = {
        date: args.find((a: string) => a.startsWith('--date='))?.split('=')[1] || DateTime.now().toISODate()!,
        time: args.find((a: string) => a.startsWith('--time='))?.split('=')[1] || "12:00:00",
        lat: parseFloat(args.find((a: string) => a.startsWith('--lat='))?.split('=')[1] || KATHMANDU.latitude.toString()),
        lon: parseFloat(args.find((a: string) => a.startsWith('--lon='))?.split('=')[1] || KATHMANDU.longitude.toString()),
        alt: parseFloat(args.find((a: string) => a.startsWith('--alt='))?.split('=')[1] || "0"),
        tz: parseFloat(args.find((a: string) => a.startsWith('--tz='))?.split('=')[1] || KATHMANDU.timezone_offset.toString()),
    };

    const targetTime: DateTime = DateTime.fromISO(`${params.date}T${params.time}`).setZone(`UTC${params.tz >= 0 ? '+' : ''}${Math.floor(params.tz)}:${Math.round((Math.abs(params.tz) % 1) * 60).toString().padStart(2, '0')}`, { keepLocalTime: true });
    
    if (!targetTime.isValid) {
        console.error("Invalid DateTime produced:", targetTime.invalidExplanation);
        (process as any).exit(1);
    }
    const location = { 
        name: "Custom Location",
        latitude: params.lat, 
        longitude: params.lon, 
        elevation: params.alt, 
        timezone_offset: params.tz,
        timezone_name: "UTC"
    };
    
    console.log(`--- Generating Snapshot for: ${targetTime.toISO()} at [${params.lat}, ${params.lon}] ---`);

    const ahargana = dateTimeToAhargana(targetTime, location);
    const sunLong = calculateTrueLongitudeSun(ahargana);
    
    const dump = {
        meta: {
            timestamp: DateTime.now().toISO(),
            input_datetime: targetTime.toISO(),
            location,
            ahargana
        },
        surya_siddhanta: {
            eras: getAllEraYears(ahargana),
            panchanga: {
                tithi: getTithiDetails(ahargana),
                month: getLunarMonthName(ahargana),
            },
            planets: {
                sun: sunLong,
                moon: calculateTrueLongitudeMoon(ahargana),
                mars: calculateTrueLongitudePlanet(Body.MARS, ahargana),
                mercury: calculateTrueLongitudePlanet(Body.MERCURY, ahargana),
                jupiter: calculateTrueLongitudePlanet(Body.JUPITER, ahargana),
                venus: calculateTrueLongitudePlanet(Body.VENUS, ahargana),
                saturn: calculateTrueLongitudePlanet(Body.SATURN, ahargana),
            },
            transitions: calculateSunriseSunset(sunLong, location.latitude)
        },
        modern: {
            panchanga: ModernPanchangaEngine.getElements(targetTime.toJSDate(), 'Chitrapaksha (Lahiri)'),
        }
    };

    const snapshotDir = path.resolve('scratch/snapshots');
    if (!fs.existsSync(snapshotDir)) fs.mkdirSync(snapshotDir, { recursive: true });

    const filename = `dump_${targetTime.toFormat('yyyyMMdd_HHmmss')}.json`;
    const filepath = path.join(snapshotDir, filename);
    
    fs.writeFileSync(filepath, JSON.stringify(dump, null, 2));
    console.log(`Success! Snapshot saved to: ${filepath}`);
}

main().catch(console.error);
