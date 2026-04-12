# Changelog: Surya Siddhanta Audit

All notable changes to this project will be documented in this file.

## [1.2.0] - 2026-04-12
### Added
- **Diagnostic Suite**: Implemented `dump_data.ts` and `verify_data.ts` for end-to-end mathematical regression testing.
- **Reference Management**: Consolidated authoritative Sanskrit and English source texts into the `reference/` directory.
- **Project Structure**: Renamed project to `surya-siddhanta-audit` and archived legacy test files into `scratch/internal/`.
- **Integrated Scripts**: Added `verify` and `dump` convenience scripts to `package.json`.

### Fixed
- **Geodesy Logic**: Corrected `calculateSunriseSunset` numerical input requirements.
- **Build Stability**: Fixed scriptural proof injector to handle nested comment blocks during documentation builds.
- **CSS Warnings**: Resolved Tailwind CSS v4 `@theme` unknown at-rule warnings.

## [1.1.0] - 2026-04-11
### Added
- **Premium Documentation**: Integrated high-fidelity TypeDoc site with automatic scriptural verse injection from `verses.json`.
- **UI Enhancements**: Added Sun/Moon theme toggle and branded "Siddhanta Parity API" footer to doc pages.
- **Verses Database**: Established `verses.json` with canonical Siddhantic constants and proofs.

### Changed
- Standardized planetary identifiers to `ALL_CAPS` across the library.
- Refactored `dateTimeToAhargana` for improved precision and timezone handling.

## [1.0.0] - 2026-04-10
### Added
- **Core Engine**: Initial TypeScript port of the Surya Siddhanta astronomical engine.
- **Modern Bridge**: Integration of JPL-based `astronomy-engine` for real-time comparative audits.
- **Dashboard**: React-based dash for side-by-side visualization of Traditional vs. Modern calculations.
- **Ayanamsha System**: Implementation of Lahiri, Revati, and Tropical ayanamsha modes.
