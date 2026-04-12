# Changelog: Surya Siddhanta Audit

All notable changes to this project will be documented in this file.

## [1.3.0] - 2026-04-12
### Fixed
- **Engine Calibration**: Restored full scriptural parity with the **Burgess (1935)** standard.
  - Corrected flipped Manda (eccentricity) epicycle circumferences for star-planets.
  - Aligned Sun and Mars apogee longitudes with canonical values.
- **UI Aesthetics**: Restored vibrant "Signature Blue" active states for all tabs, toggles, and primary action buttons.
- **Visibility**: Improved Light Mode accessibility by darkening primary text colors and implementing theme-aware translucent backgrounds.

### Added
- **Solar Drift Audit**: Integrated a dynamic Bija derivation modal for analyzing the ~4.6° longitudinal drift since the Kali Yuga epoch.
- **Enriched Chronology**: Solar months are now displayed alongside days in the "Traditional Eras" table (e.g., "Meena 25").
- **Documentation**: Added precise Burgess (1935) source citations to all core astronomical constants.

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
