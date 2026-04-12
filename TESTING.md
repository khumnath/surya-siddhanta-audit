# Operational Guide: Siddhantic Regression Pipeline

This project uses a purpose-built diagnostic suite to maintain $10^{-6}$ degree precision during development. Follow this process for any changes to the core astronomical logic.

## 1. Establishing a Baseline (npm run dump)
Before starting a refactor or making formulaic changes, capture the current "known good" state of the engine.

```bash
# Capture current time (Kathmandu)
npm run dump

# Capture historical date
npm run dump -- --date=2000-01-01 --time=12:00:00

# Capture specific location
npm run dump -- --lat=27.7172 --lon=85.3240
```
*Snapshots are saved as JSON files in `scratch/snapshots/`.*

## 2. Regression Auditing (npm run verify)
After modifying code in `src/lib/surya-siddhanta/`, ensure no mathematical drift has occurred.

### Interactive Mode (Recommended)
```bash
npm run verify
```
1. The script will scan `scratch/snapshots/`.
2. Select the index of the baseline you wish to compare against.
3. Review the output for any `❌ FAILURE` flags.

### Direct Path Mode
```bash
npm run verify -- scratch/snapshots/dump_20260412_120000.json
```

## 3. Interpreting Results
- **Ahargana Change**: A delta in `meta.ahargana` usually indicates a bug in the time conversion or epoch logic.
- **Longitude Change**: A delta in planetary positions indicates a change in the mean motion or anomaly calculation logic.
- **Tolerance**: We enforce a precision threshold of **1e-6**. Any difference larger than this will trigger a failure.

> [!IMPORTANT]
> A failure isn't always a "bug"—it means your change has altered the engine's mathematical output. If you are intentionally refining a constant (e.g., from `verses.json`), you must acknowledge the change and generate a NEW baseline after verification.
