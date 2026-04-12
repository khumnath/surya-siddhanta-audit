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
import { ModernPanchangaEngine } from '../src/lib/modern/modern-engine';
import readlineModule from 'node:readline';
import { calculateSunriseSunset } from '../src/lib/surya-siddhanta/geometry/geodesy';

/**
 * Regression Verifier for Surya Siddhanta Parity API.
 * 
 * Usage: bun scratch/verify_data.ts scratch/snapshots/dump_20260412_103000.json
 */

function compare(current: any, baseline: any, path: string = '', tolerance: number = 1e-6): string[] {
    const diffs: string[] = [];
    
    // Ignore volatile metadata
    if (path === 'meta.timestamp') return [];

    if (typeof baseline === 'number' && typeof current === 'number') {
        const delta = Math.abs(current - baseline);
        if (delta > tolerance) {
            diffs.push(`[DIFF] ${path}: Expected ${baseline}, got ${current} (delta: ${delta})`);
        }
    } else if (typeof baseline === 'object' && baseline !== null && current !== null) {
        for (const key in baseline) {
            diffs.push(...compare(current[key], baseline[key], path ? `${path}.${key}` : key, tolerance));
        }
    } else if (current !== baseline) {
        // Handle null vs NaN consistency
        const isCurrentEmpty = current === null || (typeof current === 'number' && isNaN(current));
        const isBaselineEmpty = baseline === null || (typeof baseline === 'number' && isNaN(baseline));
        if (isCurrentEmpty && isBaselineEmpty) return [];
        
        diffs.push(`[DIFF] ${path}: Expected "${baseline}", got "${current}"`);
    }
    
    return diffs;
}

async function main() {
    let baselinePath = (process as any).argv[2];

    const snapshotDir = path.resolve('scratch/snapshots');
    
    if (!baselinePath || !fs.existsSync(baselinePath)) {
        if (!fs.existsSync(snapshotDir)) {
            console.error("No snapshots found and no path provided.");
            process.exit(1);
        }

        const files = fs.readdirSync(snapshotDir).filter((f: string) => f.endsWith('.json'));
        if (files.length === 0) {
            console.error("No JSON snapshots available in scratch/snapshots/");
            process.exit(1);
        }

        console.log("\n--- Available Baseline Snapshots ---");
        files.forEach((f: string, i: number) => console.log(`${i + 1}: ${f}`));
        
        const rl = readlineModule.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        const answer = await new Promise<string>(resolve => {
            rl.question('\nSelect snapshot number: ', resolve);
        });
        rl.close();

        const index = parseInt(answer) - 1;
        if (isNaN(index) || index < 0 || index >= files.length) {
            console.error("Invalid selection.");
            process.exit(1);
        }

        baselinePath = path.join(snapshotDir, files[index]);
    }

    const baseline = JSON.parse(fs.readFileSync(baselinePath, 'utf-8'));
    const { input_datetime, location } = baseline.meta;
    const targetTime = DateTime.fromISO(input_datetime);
    
    console.log(`--- Verifying against baseline: ${baselinePath} ---`);
    console.log(`--- Input: ${input_datetime} at [${location.latitude}, ${location.longitude}] ---`);

    const ahargana = dateTimeToAhargana(targetTime, location);
    
    const currentData = {
        meta: {
            ...baseline.meta,
            ahargana
        },
        surya_siddhanta: {
            eras: getAllEraYears(ahargana),
            panchanga: {
                tithi: getTithiDetails(ahargana),
                month: getLunarMonthName(ahargana),
            },
            planets: {
                sun: calculateTrueLongitudeSun(ahargana),
                moon: calculateTrueLongitudeMoon(ahargana),
                mars: calculateTrueLongitudePlanet(Body.MARS, ahargana),
                mercury: calculateTrueLongitudePlanet(Body.MERCURY, ahargana),
                jupiter: calculateTrueLongitudePlanet(Body.JUPITER, ahargana),
                venus: calculateTrueLongitudePlanet(Body.VENUS, ahargana),
                saturn: calculateTrueLongitudePlanet(Body.SATURN, ahargana),
            },
            transitions: calculateSunriseSunset(calculateTrueLongitudeSun(ahargana), location.latitude)
        },
        modern: {
            panchanga: ModernPanchangaEngine.getElements(targetTime.toJSDate(), 'Chitrapaksha (Lahiri)'),
        }
    };

    const diffs = compare(currentData, baseline);

    if (diffs.length === 0) {
        console.log("\n✅ SUCCESS: Current output perfectly matches the baseline.");
    } else {
        console.log(`\n❌ FAILURE: Found ${diffs.length} differences:`);
        diffs.forEach(d => console.log(d));
        process.exit(1);
    }
}

main().catch(console.error);
