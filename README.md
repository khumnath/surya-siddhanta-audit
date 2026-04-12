# 🪐 Surya Siddhanta Audit

A high-fidelity, academically-verifiable realization of the ancient **Surya Siddhanta** astronomical engine, implemented in pure TypeScript. 

This project bridges traditional Siddhantic mathematics with modern astronomical precision, providing a zero-lookup engine that derives all celestial positions from prime motion constants.

## 🚀 Key Features

- **Zero-Lookup Architecture**: Rejecting hard-coded tables, the system derives every astronomical element (Sun, Moon, Planets, Tithi, Nakshatra) formulaically.
- **Modern Parity Audits**: Integrated bridge to JPL-based `astronomy-engine` ensuring mathematical alignment within a $10^{-6}$ degree tolerance.
- **Siddhantic Proofs**: Static documentation enriched with authoritative Sanskrit verses automatically injected during the build process.
- **Diagnostic Pipeline**: A purpose-built regression suite (`dump`/`verify`) to prevent mathematical drift during development.
- **Premium UI**: A high-performance React dashboard with glassmorphism aesthetics and synchronized comparative views.

## 🛠 Project Structure

- `src/lib/surya-siddhanta/`: Core traditional engine implementation.
- `src/lib/modern/`: Modern JPL validation bridge.
- `scratch/`: The diagnostic suite and regression audit snapshots.
- `reference/`: Consolidated authoritative primary sources and reference PDFs.
- `scripts/`: Build-time automation and documentation enrichment logic.

## 🚦 Getting Started

### Installation
```bash
npm install
# or
bun install
```

### Development
```bash
npm run dev
```

### Static Documentation
Generate the high-fidelity documentation with scriptural proofs:
```bash
npm run build
# The site is generated in /public/docs
```

## ⚖️ The Audit Pipeline (Testing)

We maintain code integrity through a two-stage diagnostic process.

1. **Establish a Baseline**: Save the current mathematical state.
   ```bash
   npm run dump -- --date=2026-04-12
   ```

2. **Run Verification**: Audit live code against established baselines.
   ```bash
   npm run verify
   # Follow the interactive prompts to select your snapshot.
   ```

## 📖 References
Primary computational and textual references are located in the `reference/` directory, including:
- BURGESS, E. (1860). *Translation of the Sūrya-Siddhānta: A Text-book of Hindu Astronomy*.
- Authoritative Sanskrit DJVU source texts.

## ⚖️ Credits & Legal

### Modern Astronomical Core
Modern comparative audits are powered by the [astronomy-engine](https://github.com/cosinekitty/astronomy), created by **Donald Cross**. 
*Copyright © 2018-2024 Donald Cross. Distributed under the MIT License.*

### Project License
This project (Surya Siddhanta Audit) is licensed under the **GPL-3.0-or-later**. 
*Curated for the Surya Siddhanta Parity API.*
