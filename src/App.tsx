/**
 * Siddhanta Parity - Primary Application Controller
 * =================================================
 *
 * Orchestrates the dual-engine astronomical calculations. It maintains
 * the unified temporal state and distributes it to the Surya Siddhanta
 * (Traditional) and Drik (Modern) modules.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { DateTime } from 'luxon';
import {
  Sun, MapPin, Calendar as CalendarIcon,
  Globe, Layers, Clock, LineChart,
  Sunrise, Sunset, Info, BookOpen,
  Moon
} from 'lucide-react';


// Library Imports
import { KATHMANDU, getAllLocations } from './lib/surya-siddhanta/geography/location';
import type { Location } from './types/astronomy';
import { dateTimeToAhargana } from './lib/surya-siddhanta/time/conversions';
import {
  getTithiDetails, calculateNakshatra,
  getSolarMonthName, getAyana, getSeason,
  getAllPlanetRashis, getLunarMonthName, getSunriseSunset,
  getBikramMonthName, longitudeToRashiDetailed,
  getSolarMonthDay, LUNAR_MONTH_NAMES, SOLAR_RASHI_NAMES, BIKRAM_MONTH_NAMES
} from './lib/surya-siddhanta/calendar/calendar';
import {
  computeDayPanchangaTimings
} from './lib/surya-siddhanta/calendar/panchanga-timings';
import {
  computeModernPanchangaTimings,
  getModernPanchangaElements
} from './lib/modern/panchanga-timings';
import { findModernLunarBoundary } from './lib/surya-siddhanta/calendar/transit-finder';
import { getModernPositions } from './lib/modern/astronomy';
import { type AyanamshaMode } from './lib/modern/ayanamsha';
import { getAllEraYears } from './lib/surya-siddhanta/time/eras';
import { getLagna } from './lib/surya-siddhanta/astrology/lagna';
import { calculateDailyMuhurtas } from './lib/surya-siddhanta/calendar/muhurta';
import { getModernLagna } from './lib/modern/astronomy';
import { getNorthSamvatsar } from './lib/surya-siddhanta/calendar/samvatsar';
import {
  findSSMeanTransitAhargana,
  findNextSSMeanTransitAhargana,
  getSSNextSamvatsarName,
  getModernNextSamvatsarName,
  findPrecedingYugadiAhargana,
  getNorthCivilSamvatsar,
  getSouthCivilSamvatsar,
  getNextSamvatsarName,
  findSSSunIngress,
  formatAharganaDate
} from './lib/surya-siddhanta/calendar/transit-finder';
import { ModernPanchangaEngine, TITHIS } from './lib/modern/modern-engine';


// Component Imports
import ValidationDashboard from './components/ValidationDashboard';

const App: React.FC = () => {
  /** The modern wall-clock reference for the Drik engine */
  const [selectedDate, setSelectedDate] = useState(DateTime.now());
  /** Toggle for real-time tracking */
  const [useCurrentTime, setUseCurrentTime] = useState(true);
  /** Global observer location */
  const [location, setLocation] = useState<Location>(KATHMANDU);
  /** Dashboard tab state: Daily Panchanga vs Accuracy Audit */
  const [activeTab, setActiveTab] = useState<'panchanga' | 'validation'>('panchanga');
  /** Engine visibility state: Traditional (SS), Modern (Drik), or Both (Compare) */
  const [viewMode, setViewMode] = useState<'ss' | 'modern' | 'both'>('both');
  /** Configurable Ayanamsha for the Modern calibration */
  const [modernAyanamsha, setModernAyanamsha] = useState<AyanamshaMode>('lahiri');
  const [lunarSystem, setLunarSystem] = useState<'amanta' | 'purnimanta'>('purnimanta');

  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('theme') as 'dark' | 'light') || 'light';
  });

  const locations = useMemo(() => getAllLocations(), []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    if (!useCurrentTime) return;
    const interval = setInterval(() => setSelectedDate(DateTime.now()), 60000);
    return () => clearInterval(interval);
  }, [useCurrentTime]);

  /**
   * Primary Mathematical Conversion:
   * Translates the modern timestamp (Luxon) into the traditional
   * day-count (Ahargana) for the Surya Siddhanta engine.
   */
  const ahargana = useMemo(() => {
    return dateTimeToAhargana(selectedDate, location);
  }, [selectedDate, location]);

  // ─── Traditional Astronomical Calculations ───
  const tithi = getTithiDetails(ahargana);
  const nakshatra = calculateNakshatra(ahargana);
  const solarMonth = getSolarMonthName(ahargana);
  const ayana = getAyana(ahargana);
  const season = getSeason(ahargana);
  const eras = getAllEraYears(ahargana);
  const rashis = getAllPlanetRashis(ahargana);
  const sunTimes = getSunriseSunset(ahargana, location.latitude);
  const bikramMonth = getBikramMonthName(ahargana);
  const ssLagna = getLagna(ahargana, location.latitude, location.longitude);
  /** Traditional Solar/Lunar details */
  const lunarMonth = getLunarMonthName(ahargana, lunarSystem);

  /** Modern currentized snapshots for comparison view */
  const modernCurrent = useMemo(() => {
    if (viewMode === 'ss') return null;
    return getModernPanchangaElements(selectedDate.toJSDate(), modernAyanamsha);
  }, [viewMode, selectedDate, modernAyanamsha]);

  /**
   * Computes a weighted Accuracy Score comparing the Tithi
   * and Nakshatra fractions between ancient and modern models.
   */
  const parityScore = useMemo(() => {
    if (!modernCurrent) return null;

    // Tithi Error (normalized)
    const tithiErr = Math.abs(tithi.fraction - (modernCurrent.tithi.fraction || 0));
    // Nakshatra Error (1 day = 360 deg, 1 nakshatra = 13.33 deg)
    const nakErr = Math.abs(nakshatra.fraction - (modernCurrent.nakshatra.fraction || 0));

    // Simple Score: 100 - (Avg error * 100)
    const score = 100 - ((tithiErr + nakErr) / 2) * 50;
    return Math.max(0, Math.min(100, score));
  }, [tithi, nakshatra, modernCurrent]);

  /** Full-day Panchanga schedule (Traditional) */
  const panchangaTimings = useMemo(() => {
    return computeDayPanchangaTimings(ahargana, location.latitude);
  }, [ahargana, location.latitude]);

  // Modern (JPL) panchanga timings for comparison
  const modernTimings = useMemo(() => {
    if (viewMode === 'ss') return null;
    return computeModernPanchangaTimings(selectedDate.toJSDate(), location, modernAyanamsha);
  }, [viewMode, selectedDate, location, modernAyanamsha]);

  // Modern planet positions
  const modernPositions = useMemo(() => {
    if (viewMode === 'ss') return null;
    return getModernPositions(selectedDate.toJSDate(), modernAyanamsha);
  }, [viewMode, selectedDate, modernAyanamsha]);

  /** Modern Solar/Lunar rhythm for comparison */
  const modernRhythm = useMemo(() => {
    if (!modernCurrent) return null;
    const sSun = (modernCurrent as any).siderealSun;

    // Find the modern New Moon boundary to determine the lunar month name correctly
    const modNM = findModernLunarBoundary(selectedDate.toJSDate(), 0, -1);
    const modElementsAtNM = getModernPanchangaElements(modNM, modernAyanamsha);
    const modSunAtNM = (modElementsAtNM as any).siderealSun;

    const modSign = ModernPanchangaEngine.getModernSolarMonthSign(selectedDate.toJSDate(), modernAyanamsha);
    const modDay = ModernPanchangaEngine.getModernSolarMonthDay(selectedDate.toJSDate(), modernAyanamsha);

    return {
      solarMonth: SOLAR_RASHI_NAMES[modSign - 1],
      bikramMonth: BIKRAM_MONTH_NAMES[modSign - 1],
      ayana: getAyana(ahargana, sSun),
      season: getSeason(ahargana, sSun),
      lunarMonth: getLunarMonthName(ahargana, lunarSystem, modSunAtNM, modernCurrent.tithi.index > 15),
      paksha: modernCurrent.tithi.name.split(' ')[0],
      solarDay: modDay
    };
  }, [modernCurrent, ahargana, selectedDate, modernAyanamsha, lunarSystem]);

  /** Modern Era Logic - Precise transit boundaries */
  const modernEras = useMemo(() => {
    if (!modernCurrent || !modernRhythm) return null;

    const gYear = selectedDate.year;
    const sSun = (modernCurrent as any).siderealSun;
    
    // 1. Solar Kali/Bikram (Mesha Sankranti)
    const baseKaliSolar = gYear + 3100;
    const finalKaliSolar = (selectedDate.month < 4 || (selectedDate.month === 4 && sSun >= 300)) ? baseKaliSolar : baseKaliSolar + 1;

    // 2. Lunar Kali/Vikram (Chaitra Shukla Pratipada)
    const mIdx = LUNAR_MONTH_NAMES.indexOf(modernRhythm.lunarMonth);
    
    let isPastYugadi = false;
    if (selectedDate.month > 4) isPastYugadi = true;
    else if (selectedDate.month >= 3) {
      if (mIdx > 0 && mIdx < 10) isPastYugadi = true;
      else if (mIdx === 0 && modernRhythm.paksha === 'Shukla') isPastYugadi = true;
    }
    const finalKaliLunar = isPastYugadi ? gYear + 3101 : gYear + 3100;

    // 3. Nepal Sambat (Kartika Shukla Pratipada)
    let isPastKartika = false;
    if (selectedDate.month > 11) isPastKartika = true;
    else if (selectedDate.month >= 10) {
      if (mIdx > 7) isPastKartika = true;
      else if (mIdx === 7 && modernRhythm.paksha === 'Shukla') isPastKartika = true;
    }
    const finalNS = (selectedDate.year - 880) + (isPastKartika ? 1 : 0);

    return {
      kaliSolar: finalKaliSolar,
      kaliLunar: finalKaliLunar,
      bikram: finalKaliSolar - 3044,
      vikram: finalKaliLunar - 3044,
      shaka: finalKaliLunar - 3179,
      nepal: finalNS
    };
  }, [modernCurrent, modernRhythm, selectedDate]);

  const ssSolarDay = getSolarMonthDay(ahargana);

  // Modern Lagna
  const modernLagna = useMemo(() => {
    if (viewMode === 'ss') return null;
    return getModernLagna(selectedDate.toJSDate(), location, modernAyanamsha);
  }, [viewMode, selectedDate, location, modernAyanamsha]);
  // Triple Samvatsara Auditor - High Precision refined for Adoption Window
  const samvatsarAudit = useMemo(() => {
    if (!modernCurrent) return null;

    // Find high-precision boundary dates
    const modernInDate = ModernPanchangaEngine.findJupiterIngress(selectedDate.toJSDate(), modernAyanamsha);
    const modernOutDate = ModernPanchangaEngine.findNextJupiterIngress(selectedDate.toJSDate(), modernAyanamsha);

    const ss = getNorthSamvatsar(ahargana);
    const ssMeanAhargana = findSSMeanTransitAhargana(ahargana);
    const ssEndAhargana = findNextSSMeanTransitAhargana(ahargana);
    const yugadiAhargana = findPrecedingYugadiAhargana(ahargana);

    const civilStartStr = formatAharganaDate(yugadiAhargana);
    const civilName = getNorthCivilSamvatsar(ahargana);
    const southName = getSouthCivilSamvatsar(ahargana);

    // Visibility logic: only show if selected date is between Modern Ingress and Yugadi
    const selTs = selectedDate.toMillis();
    const modTs = modernInDate.getTime();
    const yugadiTs = DateTime.fromFormat(civilStartStr, "MMM d, yyyy").setZone('Asia/Kathmandu').toMillis();

    const isTransWindow = (selTs > Math.min(modTs, yugadiTs)) && (selTs < Math.max(modTs, yugadiTs));

    return {
      isDiscrepant: isTransWindow && (civilName !== modernCurrent.samvatsar.name),
      ss: eras.north_samvatsar as string,
      ssNext: getSSNextSamvatsarName(ahargana),
      ssRawCount: (ss as any).rawCount,
      modern: modernCurrent.samvatsar.name,
      modernNext: getModernNextSamvatsarName(selectedDate.toJSDate(), modernAyanamsha),
      modernRawCount: modernCurrent.samvatsarRawCount,
      civil: civilName,
      civilNext: getNextSamvatsarName(civilName),
      south: southName,
      southNext: getNextSamvatsarName(southName),
      ssStart: formatAharganaDate(ssMeanAhargana),
      ssEnd: formatAharganaDate(ssEndAhargana),
      modernStart: DateTime.fromJSDate(modernInDate).setZone('Asia/Kathmandu').toFormat("MMM d, yyyy"),
      modernEnd: DateTime.fromJSDate(modernOutDate).setZone('Asia/Kathmandu').toFormat("MMM d, yyyy"),
      civilStart: formatAharganaDate(yugadiAhargana)
    };
  }, [eras, modernCurrent, selectedDate, ahargana, modernAyanamsha]);



  // Muhurtas
  const ssMuhurtas = useMemo(() => {
    return calculateDailyMuhurtas(sunTimes.sunrise, sunTimes.sunset, selectedDate.weekday % 7);
  }, [sunTimes, selectedDate]);

  const modernMuhurtas = useMemo(() => {
    if (!modernTimings) return null;
    return calculateDailyMuhurtas(modernTimings.sunriseHours, modernTimings.nextSunriseHours, selectedDate.weekday % 7);
  }, [modernTimings, selectedDate]);


  const formatHhhMm = (decimalHours: number) => {
    const h = Math.floor(decimalHours);
    const m = Math.floor((decimalHours - h) * 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };

  // Select the primary data source for the overall dashboard based on viewMode
  const currentTimings = useMemo(() => {
    if (viewMode === 'modern' && modernTimings) return modernTimings;
    return panchangaTimings;
  }, [viewMode, modernTimings, panchangaTimings]);

  const isBikramNewYearApproaching = useMemo(() => {
    return solarMonth.includes("Meena");
  }, [solarMonth]);

  const sankrantiAudit = useMemo(() => {
    if (!isBikramNewYearApproaching) return null;

    // Modern Mesha Sankranti (Sidereal 0)
    const modernSankrantiDate = ModernPanchangaEngine.findSunIngress(selectedDate.toJSDate(), 0, modernAyanamsha);
    const modernElements = ModernPanchangaEngine.getElements(modernSankrantiDate, modernAyanamsha);
    const modernTithiName = TITHIS[modernElements.tithiIdx];

    // SS Mesha Sankranti (Sidereal 0)
    const ssSankrantiAhargana = findSSSunIngress(ahargana, 0);
    const ssSankrantiDateStr = formatAharganaDate(ssSankrantiAhargana);
    const ssTithi = getTithiDetails(ssSankrantiAhargana);
    const ssMonth = getLunarMonthName(ssSankrantiAhargana);

    return {
      modernDate: DateTime.fromJSDate(modernSankrantiDate).setZone('Asia/Kathmandu').toFormat("MMMM d, yyyy"),
      modernLunar: `${modernTithiName}`,
      ssDate: ssSankrantiDateStr,
      ssLunar: `${ssMonth} ${ssTithi.paksha} ${ssTithi.name}`
    };
  }, [isBikramNewYearApproaching, selectedDate, ahargana, modernAyanamsha]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUseCurrentTime(false);
    const dt = DateTime.fromISO(e.target.value);
    if (dt.isValid) setSelectedDate(dt);
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const loc = locations.find(l => l.name === e.target.value);
    if (loc) setLocation(loc);
  };

  return (
    <div className="dashboard-container fade-in">
      {/* Global Top Bar (Parity Audit + Theme Toggle) */}
      <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-border-subtle" style={{
        fontSize: '0.85rem',
        fontWeight: 700,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        minHeight: '40px'
      }}>
        {/* Parity Content (Left/Center) */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 flex-1">
          {viewMode !== 'ss' && parityScore !== null && (
            <>
              <div className="flex items-center gap-2.5">
                <LineChart size={16} color="var(--accent-secondary)" className="shrink-0" />
                <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Siddhanta-Modern Parity:</span>
                <span style={{ color: parityScore > 90 ? 'var(--accent-success)' : 'var(--accent-secondary)', fontWeight: 800, fontSize: '0.9rem' }}>
                  {parityScore.toFixed(1)}% Match
                </span>
              </div>
              <div className="w-full sm:w-[200px] h-1 bg-white/5 rounded-full overflow-hidden shrink-0 hidden sm:block">
                <div style={{ width: `${parityScore}%`, height: '100%', background: 'var(--accent-secondary)', transition: 'width 1s ease-out' }}></div>
              </div>
            </>
          )}
        </div>

        {/* Global Controls (Right) */}
        <div className="flex items-center gap-2 ml-4">
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid var(--border-subtle)',
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              padding: 0
            }}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            className="flex items-center justify-center hover:bg-white/10 transition-colors"
          >
            {theme === 'dark' ? (
              <Sun size={22} className="text-accent-secondary" />
            ) : (
              <Moon size={22} className="text-accent-primary" />
            )}
          </button>
        </div>
      </div>

      <header className="flex flex-col items-center py-6 mb-10 gap-8">
        <div className="flex flex-col items-center w-full text-center">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full">
            <Globe size={32} color="var(--accent-primary)" className="shrink-0" />
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-center gap-2 sm:gap-4 w-full overflow-hidden">
              <span className="text-xl sm:text-2xl md:text-3xl font-black tracking-tighter bg-linear-to-br from-text-primary to-accent-primary bg-clip-text text-transparent leading-tight">
                Surya Siddhanta audit
              </span>
              <span style={{
                fontSize: '0.85rem',
                fontWeight: 800,
                color: 'var(--accent-primary)',
                background: 'rgba(99, 102, 241, 0.1)',
                padding: '0.25rem 0.6rem',
                borderRadius: '8px',
                letterSpacing: '0.05em'
              }} className="w-fit whitespace-nowrap mx-auto sm:mx-0">
                v1.2.0
              </span>
            </div>
          </div>
          <div className="text-[0.75rem] sm:text-[0.85rem] text-text-secondary tracking-[0.2em] font-black uppercase mt-3 opacity-90">
            Vedic Astronomical Audit
          </div>
        </div>

        <div className="flex flex-col items-center gap-6 w-full">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full lg:w-auto">
            <div className="flex items-center gap-3 bg-white/5 px-4 py-2.5 rounded-xl border border-border-card shrink-0">
              <MapPin size={18} color="var(--accent-primary)" className="shrink-0" />
              <select
                value={location.name}
                onChange={handleLocationChange}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', outline: 'none', cursor: 'pointer', width: '200px', fontSize: '0.9rem' }}
              >
                {locations.map(loc => (
                  <option key={loc.name} value={loc.name} style={{ background: 'var(--bg-surface)' }}>{loc.name}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-3 bg-white/5 px-4 py-2.5 rounded-xl border border-border-card min-w-0 w-full sm:w-auto">
              <CalendarIcon size={18} color="var(--accent-secondary)" className="shrink-0" />
              <input
                type="datetime-local"
                value={selectedDate.toFormat("yyyy-MM-dd'T'HH:mm")}
                onChange={handleDateChange}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', outline: 'none', cursor: 'pointer', width: '100%', maxWidth: '220px', fontSize: '0.9rem' }}
              />
              {!useCurrentTime && (
                <button
                  onClick={() => setUseCurrentTime(true)}
                  style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem', borderRadius: '6px' }}
                  className="bg-accent-primary! text-white! hover:brightness-110 whitespace-nowrap shadow-sm"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full">
            <a
              href="/docs/index.html"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: 'rgba(99, 102, 241, 0.1)',
                border: '1px solid var(--accent-primary)',
                color: 'var(--accent-primary)',
                padding: '0.8rem 2.5rem',
                borderRadius: '12px',
                fontSize: '0.8rem',
                fontWeight: 600,
                textDecoration: 'none'
              }}
              className="flex items-center justify-center gap-2 hover:bg-white/5 transition-all shadow-sm whitespace-nowrap min-w-[200px]"
            >
              <BookOpen size={18} /> API Docs
            </a>
          </div>
        </div>
      </header>

      <div className="flex flex-col items-center gap-6 mb-12">
        <nav className="nav-pill-group flex-wrap justify-center gap-2 sm:gap-4 mb-0 w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('panchanga')}
            className={`nav-pill ${activeTab === 'panchanga' ? 'active' : ''}`}
          >
            <CalendarIcon size={18} /> Daily Panchanga
          </button>
          <button
            onClick={() => setActiveTab('validation')}
            className={`nav-pill ${activeTab === 'validation' ? 'active' : ''}`}
          >
            <LineChart size={18} /> Engine Accuracy
          </button>
        </nav>
        <div className="w-full sm:w-auto flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-4">
          <div className="nav-pill-group">
            {(['ss', 'modern', 'both'] as const).map(mode => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`nav-pill text-[0.65rem] px-3! font-black uppercase ${viewMode === mode ? 'active bg-accent-primary! text-white!' : ''}`}
              >
                {mode === 'ss' ? 'TRAD (SS)' : mode === 'modern' ? 'MOD (JPL)' : 'COMPARE'}
              </button>
            ))}
          </div>

          {viewMode !== 'ss' && (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10 shrink-0">
                <span className="text-[0.6rem] font-bold text-text-secondary uppercase tracking-tighter opacity-70">Ayanamsha</span>
                <select
                  value={modernAyanamsha}
                  onChange={(e) => setModernAyanamsha(e.target.value as AyanamshaMode)}
                  className="bg-transparent border-none text-accent-primary text-xs font-bold outline-none cursor-pointer"
                >
                  <option value="lahiri" style={{ background: 'var(--bg-surface)' }}>Lahiri</option>
                  <option value="ss_lib" style={{ background: 'var(--bg-surface)' }}>Revati</option>
                  <option value="tropical" style={{ background: 'var(--bg-surface)' }}>Tropical</option>
                </select>
              </div>

              <div className="flex items-center gap-1 bg-subtle p-1 rounded-xl border border-white/5 shrink-0 shadow-inner">
                {(['amanta', 'purnimanta'] as const).map((sys) => (
                  <button
                    key={sys}
                    onClick={() => setLunarSystem(sys)}
                    className={`px-4 py-1.5 rounded-lg text-[0.65rem] font-bold uppercase tracking-wider transition-all duration-500 transform ${lunarSystem === sys
                        ? 'bg-accent-primary! text-white! shadow-md scale-100 opacity-100'
                        : 'text-text-secondary hover:text-text-primary bg-subtle! opacity-80 hover:opacity-100 scale-95'
                      }`}
                  >
                    {sys}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {activeTab === "panchanga" ? (
        <div className="grid-12 fade-in">
          {/* Calendar Adoption Note (Educational discrepancy banner) */}
          {samvatsarAudit?.isDiscrepant && (
            <div className="span-12" style={{ marginBottom: '1.5rem' }}>
              <div style={{
                background: 'rgba(99, 102, 241, 0.05)',
                border: '1px solid var(--accent-primary)',
                borderRadius: '16px',
                padding: '1.2rem 1.5rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '1rem',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{ padding: '0.6rem', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '12px' }}>
                  <Info size={20} color="var(--accent-primary)" />
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 900, color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '0.5rem' }}>
                    Calendar Adoption Comparison
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: '1.6', margin: 0 }}>
                    Transition period detected: Different regional calendars adopt Samvatsara names based on varying logic. Modern systems follow high-precision **True Jupiter Ingress**, while traditional systems follow **Mean Motion** or pin the name strictly to the **Lunar New Year (Yugadi)**.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Chronology Master Card */}
          <div className="span-12">
            <div className="glass-card fade-in">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <h2 className="flex-center" style={{ fontSize: '1.2rem' }}>
                  <Globe size={24} color="var(--accent-primary)" /> Chronology & Era Systems
                </h2>
                <div className="flex-center" style={{ background: 'var(--bg-subtle)', padding: '0.5rem 1.2rem', borderRadius: '14px', fontSize: '0.85rem', fontWeight: 600 }}>
                  <span className="text-label" style={{ marginRight: '0.5rem' }}>Julian Day:</span>
                  <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>{(ahargana + 2451545.0 + 0.5).toFixed(2)}</span>
                </div>
              </div>

              <div className="grid-12">
                {/* Samvatsara Section */}
                <div className="span-4" style={{ borderRight: '1px solid var(--border-subtle)', paddingRight: '1.5rem' }}>
                  <div className="text-label" style={{ marginBottom: '1rem' }}>Samvatsara (60-Cycle)</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                    {viewMode === 'both' && samvatsarAudit ? (
                      <>
                        <div style={{ marginBottom: '1.5rem' }}>
                          <div className="text-value" style={{ fontSize: '1.3rem', fontWeight: 700 }}>{samvatsarAudit.ss}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 700, marginBottom: '6px' }}>SS MEAN (Astronomical Status) • {samvatsarAudit.ssStart} – {samvatsarAudit.ssEnd}</div>
                          <div style={{ backgroundColor: 'var(--bg-subtle)', padding: '6px 10px', borderRadius: '6px', fontSize: '0.75rem', color: 'var(--text-primary)' }}>
                            SS EPOCH: FEB 18, 3102 BCE • YEAR COUNT: {samvatsarAudit.ssRawCount}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, marginTop: '6px' }}>NEXT: {samvatsarAudit.ssNext}</div>
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                          <div className="text-value" style={{ fontSize: '1.3rem', color: 'var(--accent-primary)', fontWeight: 700 }}>{samvatsarAudit.modern}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', fontWeight: 800, marginBottom: '6px' }}>MODERN TRUE (Astronomical Status) • {samvatsarAudit.modernStart} – {samvatsarAudit.modernEnd}</div>
                          <div style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)', padding: '6px 10px', borderRadius: '6px', fontSize: '0.75rem', color: 'var(--accent-primary)', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                            TRANSIT EPOCH: JAN 5, 3102 BCE • TRANSIT COUNT: {samvatsarAudit.modernRawCount}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', fontWeight: 600, marginTop: '6px' }}>NEXT: {samvatsarAudit.modernNext}</div>
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                          <div className="text-value" style={{ fontSize: '1.3rem', opacity: 1, fontWeight: 700 }}>{samvatsarAudit.civil}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 700 }}>NORTH CIVIL (Pinned at Yugadi {samvatsarAudit.civilStart})</div>
                          <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--accent-secondary)', fontWeight: 800, marginTop: '6px' }}>
                            CIVIL ADOPTION: NAME REMAINS CONSTANT UNTIL NEXT LUNAR YEAR
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, marginTop: '6px' }}>NEXT: {samvatsarAudit.civilNext}</div>
                        </div>

                        <div>
                          <div className="text-value" style={{ fontSize: '1.3rem', color: 'var(--accent-secondary)', fontWeight: 700 }}>{samvatsarAudit.south}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--accent-secondary)', fontWeight: 800 }}>SOUTH CIVIL (Lunar-Pinned • Salivahana Era)</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--accent-secondary)', fontWeight: 600, marginTop: '6px' }}>NEXT: {samvatsarAudit.southNext}</div>
                        </div>
                      </>
                    ) : (
                      <div>
                        <div className="text-value" style={{ fontSize: '1.4rem' }}>
                          {viewMode === 'ss' ? eras.north_samvatsar : (modernCurrent?.samvatsar.name || '---')}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 700 }}>
                          {viewMode === 'ss' ? 'NORTH SYSTEM (JUPITER)' : 'MODERN JUPITER TRANSIT'}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Major Eras Section */}
                <div className="span-8">
                  <div className="text-label" style={{ marginBottom: '1.5rem', fontWeight: 900, fontSize: '0.75rem', letterSpacing: '0.1em' }}>Traditional Eras & Boundaries</div>

                  <div className="flex flex-col gap-6">
                    {/* Comparative Era Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1.5rem' }}>
                      <div className="text-label text-[0.65rem] uppercase opacity-50 font-black">Era System</div>
                      <div className="text-label text-[0.65rem] uppercase opacity-50 font-black text-center">Siddhantic (Trad)</div>
                      <div className="text-label text-[0.65rem] uppercase opacity-50 font-black text-center">JPL/Drik (Modern)</div>
                    </div>

                    {[
                      { label: 'Solar Month Day', ss: ssSolarDay, mod: modernRhythm?.solarDay },
                      { label: 'Kali Yuga (Lunar)', ss: eras.kali_yuga, mod: modernEras?.kaliLunar },
                      { label: 'Bikram Sambat (Solar)', ss: eras.bikram_sambat_solar, mod: modernEras?.bikram },
                      { label: 'Bikram Sambat (Lunar)', ss: eras.vikram_samvat_lunar, mod: modernEras?.vikram },
                      { label: 'Nepal Sambat', ss: eras.nepal_sambat, mod: modernEras?.nepal },
                      { label: 'Shaka Samvat', ss: eras.shaka_samvat, mod: modernEras?.shaka }
                    ].map((row) => (
                      <div key={row.label} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem', alignItems: 'center' }}>
                        <div className="text-label text-[0.75rem] font-bold uppercase tracking-wide">{row.label}</div>

                        <div className="text-center">
                          {(viewMode === 'ss' || viewMode === 'both') ? (
                            <div className="text-value text-[1rem] font-bold text-text-primary">{row.ss}</div>
                          ) : <div className="text-text-secondary opacity-30">—</div>}
                        </div>

                        <div className="text-center">
                          {(viewMode === 'modern' || viewMode === 'both') ? (
                            <div className="text-value text-[1rem] font-bold text-accent-primary">{row.mod || '---'}</div>
                          ) : <div className="text-text-secondary opacity-30">—</div>}
                        </div>
                      </div>
                    ))}
                  </div>

                  {isBikramNewYearApproaching && sankrantiAudit && (
                    <div style={{ marginTop: '1.5rem', padding: '1rem 1.2rem', background: 'rgba(245, 158, 11, 0.08)', border: '1px solid var(--accent-secondary)', borderRadius: '16px', display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                      <Info size={18} color="var(--accent-secondary)" style={{ marginTop: '0.2rem' }} />
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: '1.6' }}>
                        <strong style={{ color: 'var(--accent-secondary)', display: 'block', marginBottom: '0.4rem' }}>Solar Transition Warning: Mesha Sankranti</strong>
                        Currently in the transition gap: Vikram Samvat {eras.vikram_samvat_lunar} (Lunar) has begun, but Bikram Sambat {eras.bikram_sambat_solar} (Solar) remains until Mesha Sankranti.
                        <div style={{ marginTop: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                          <span style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600 }}>
                            Modern Target (JPL): **{sankrantiAudit.modernDate}** ({sankrantiAudit.modernLunar})
                          </span>
                          <span style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600 }}>
                            Siddhanta Target (SS): **{sankrantiAudit.ssDate}** ({sankrantiAudit.ssLunar})
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Primary Panchanga Hub Card */}
          <div className="span-12">
            <div className="glass-card">
              <h2 className="flex-center" style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>
                <Sun color="var(--accent-secondary)" /> Primary Panchanga Hub
              </h2>
              <div className="grid-12" style={{ gap: '1rem', marginBottom: '1.5rem' }}>
                {[
                  { label: 'TITHI', current: modernTimings?.tithis[0], trad: panchangaTimings.tithis[0], color: 'var(--accent-secondary)' },
                  { label: 'NAKSHATRA', current: modernTimings?.nakshatras[0], trad: panchangaTimings.nakshatras[0], color: '#fbbf24' },
                  { label: 'YOGA', current: modernTimings?.yogas[0], trad: panchangaTimings.yogas[0], color: 'var(--accent-primary)' },
                  { label: 'KARANA', current: modernTimings?.karanas[0], trad: panchangaTimings.karanas[0], color: '#10b981' }
                ].map((item, idx) => {
                  const val = item.current || item.trad;
                  const hasDrift = item.current && item.trad && item.current.name !== item.trad.name;

                  return (
                    <div key={idx} className="span-3" style={{
                      padding: '1.2rem',
                      background: 'rgba(255,255,255,0.02)',
                      borderRadius: '20px',
                      border: `1px solid var(--border-subtle)`,
                      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                      position: 'relative'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                        <div className="text-label" style={{ color: item.color, fontWeight: 900, fontSize: '0.85rem', letterSpacing: '0.12em' }}>{item.label}</div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--accent-primary)', letterSpacing: '0.05em', background: 'rgba(99, 102, 241, 0.1)', padding: '0.3rem 0.6rem', borderRadius: '6px' }}>
                          MODERN (J2000)
                        </div>
                      </div>

                      <div style={{ marginBottom: '0.8rem' }}>
                        <div className="text-value" style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                          {val.name}
                        </div>
                        <div style={{
                          fontSize: '0.9rem',
                          color: val.endAhargana ? item.color : 'var(--text-dim)',
                          marginTop: '0.4rem',
                          fontFamily: 'monospace',
                          fontWeight: 800,
                          background: val.endAhargana ? `${item.color}15` : 'var(--bg-subtle)',
                          padding: '0.2rem 0.6rem',
                          borderRadius: '6px',
                          display: 'inline-block'
                        }}>
                          {val.endAhargana ? `Ends ${val.endTimeStr}` : 'Full Day'}
                        </div>
                      </div>

                      <div style={{ marginTop: '1.2rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
                        {item.trad && (
                          <div style={{ padding: '0.7rem', background: hasDrift ? 'rgba(239, 68, 68, 0.08)' : 'rgba(255,255,255,0.04)', borderRadius: '10px', border: hasDrift ? '1px solid rgba(239, 68, 68, 0.2)' : '1px solid var(--border-subtle)' }}>
                            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: hasDrift ? 'var(--accent-error)' : 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.4rem', letterSpacing: '0.05em' }}>TRADITIONAL (SS)</div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: hasDrift ? 'var(--accent-error)' : 'var(--text-primary)' }}>{item.trad.name}</span>
                              <span style={{ fontSize: '0.85rem', fontWeight: 700, fontFamily: 'monospace', color: 'var(--text-secondary)' }}>
                                {item.trad.endAhargana ? `${item.trad.endTimeStr}` : '→'}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex flex-row flex-wrap justify-center gap-x-16 gap-y-12 pt-10 border-t border-border-subtle overflow-x-auto pb-6 scrollbar-hide" style={{ overflowY: 'hidden' }}>
                {/* 1. SOLAR GROUP */}
                <div className="flex flex-col items-center gap-8">
                  <div className="flex flex-col gap-1 items-center">
                    <div className="text-[0.8rem] font-bold tracking-[0.2em] text-accent-secondary flex items-center gap-2 uppercase">
                      <Sun size={14} /> Solar (Sauramana)
                    </div>
                  </div>
                  <div className="flex flex-row flex-wrap justify-center gap-x-12 gap-y-8">
                    {[
                      { label: 'SUN RASHI', trad: solarMonth, modern: modernRhythm?.solarMonth, icon: Globe },
                      { label: 'BS MONTH', trad: bikramMonth, modern: modernRhythm?.bikramMonth, icon: CalendarIcon },
                      { label: 'SEASON', trad: season, modern: modernRhythm?.season, icon: Sun },
                      { label: 'AYANA', trad: ayana, modern: modernRhythm?.ayana, icon: Layers },
                    ].map((item) => (
                      <div key={item.label} className="flex flex-col items-center min-w-[140px]">
                        <div className="text-[0.65rem] font-black text-text-secondary uppercase tracking-widest mb-3">{item.label}</div>

                        {viewMode === 'both' ? (
                          <div className="flex flex-col gap-2.5 w-full">
                            <div className="px-3 py-1.5 bg-accent-primary/5 rounded-lg border border-accent-primary/10">
                              <div className="text-[0.5rem] font-bold text-accent-primary uppercase tracking-tighter mb-0.5 opacity-70">MODERN</div>
                              <div className="text-[0.85rem] font-black text-text-primary whitespace-nowrap">{item.modern}</div>
                            </div>
                            <div className="px-3 py-1.5 bg-white/5 rounded-lg border border-white/5">
                              <div className="text-[0.5rem] font-bold text-text-secondary uppercase tracking-tighter mb-0.5 opacity-60">TRADITIONAL</div>
                              <div className="text-[0.85rem] font-black text-text-primary whitespace-nowrap">{item.trad}</div>
                            </div>
                          </div>
                        ) : (
                          <div className="text-base font-black text-text-primary tracking-tight whitespace-nowrap">
                            {viewMode === 'modern' ? item.modern : item.trad}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. LUNAR GROUP */}
                <div className="flex flex-col items-center gap-8 px-8 sm:border-l sm:border-white/5">
                  <div className="flex flex-col gap-1 items-center">
                    <div className="text-[0.8rem] font-bold tracking-[0.2em] text-accent-primary flex items-center gap-2 uppercase">
                      <Moon size={14} /> Lunar (Chandramana)
                    </div>
                  </div>
                  <div className="flex flex-row flex-wrap justify-center gap-x-12 gap-y-8">
                    {[
                      { label: 'LUNAR MONTH', trad: lunarMonth, modern: modernRhythm?.lunarMonth },
                      { label: 'PAKSHA', trad: tithi.paksha, modern: modernRhythm?.paksha },
                    ].map((item) => (
                      <div key={item.label} className="flex flex-col items-center min-w-[140px]">
                        <div className="text-[0.65rem] font-black text-text-secondary uppercase tracking-widest mb-3">{item.label}</div>

                        {viewMode === 'both' ? (
                          <div className="flex flex-col gap-2.5 w-full">
                            <div className="px-3 py-1.5 bg-accent-primary/5 rounded-lg border border-accent-primary/10">
                              <div className="text-[0.5rem] font-bold text-accent-primary uppercase tracking-tighter mb-0.5 opacity-70">MODERN</div>
                              <div className="text-[0.85rem] font-black text-text-primary whitespace-nowrap">{item.modern}</div>
                            </div>
                            <div className="px-3 py-1.5 bg-white/5 rounded-lg border border-white/5">
                              <div className="text-[0.5rem] font-bold text-text-secondary uppercase tracking-tighter mb-0.5 opacity-60">TRADITIONAL</div>
                              <div className="text-[0.85rem] font-black text-text-primary whitespace-nowrap">{item.trad}</div>
                            </div>
                          </div>
                        ) : (
                          <div className="text-base font-black text-text-primary tracking-tight whitespace-nowrap">
                            {viewMode === 'modern' ? item.modern : item.trad}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Celestial Longitudes Card (Full Width) */}
          <div className="span-12">
            <div className="glass-card">
              <h2 className="flex items-center gap-3 text-lg font-black tracking-tight mb-8">
                <Layers size={24} className="text-accent-primary" />
                <span className="uppercase tracking-widest text-sm opacity-80">Celestial Longitudes & Planet Positions</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {/* Lagna Section - Spans 2 Columns for Emphasis */}
                <div className="md:col-span-2 bg-accent-primary/5 rounded-xl border border-accent-primary/20 shadow-sm relative group" style={{ padding: '2rem', overflow: 'visible' }}>
                  <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Layers size={100} />
                  </div>

                  <div className="relative z-10 flex flex-col gap-8">
                    {/* SS BLOCK */}
                    {(viewMode === 'ss' || viewMode === 'both') && (
                      <div className="flex justify-between items-end">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-accent-primary">LAGNA (ASCENDANT)</span>
                            <span className="px-2.5 py-1 rounded bg-accent-primary/10 text-[0.5rem] font-black text-accent-primary uppercase tracking-widest border border-accent-primary/20">SIDDANTIC BASELINE</span>
                          </div>
                          <div className="text-3xl font-black text-text-primary tracking-tight">{ssLagna.rashiName}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-4xl font-mono font-black text-text-primary tracking-[-0.05em] drop-shadow-sm">
                            {Math.floor(ssLagna.degreeInRashi)}° {Math.floor((ssLagna.degreeInRashi % 1) * 60)}'
                          </div>
                        </div>
                      </div>
                    )}

                    {(viewMode === 'modern' || viewMode === 'both') && modernLagna && (
                      <div className={`${viewMode === 'both' ? 'pt-8 border-t border-accent-primary/10' : ''} flex justify-between items-end`}>
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-accent-primary/80">Modern (JPL)</span>
                            <span className="px-2.5 py-1 rounded bg-white/5 text-[0.5rem] font-black text-text-secondary uppercase tracking-widest border border-white/10">MODERN DRIK PARITY</span>
                          </div>
                          <div className="text-2xl font-black text-accent-primary">{modernLagna.rashiName}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-3xl font-mono font-black text-accent-primary tracking-tight drop-shadow-sm">
                            {Math.floor(modernLagna.degreeInRashi)}° {Math.floor((modernLagna.degreeInRashi % 1) * 60)}'
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Planets Grid */}
                {Object.entries(rashis).map(([body, pos]) => {
                  const modLon = modernPositions ? (modernPositions as any)[body] : null;
                  const modRashi = modLon !== null ? longitudeToRashiDetailed(modLon) : null;
                  return (
                    <div key={body} className="bg-white/5 rounded-xl border border-border-subtle hover:border-border-card transition-all group shadow-sm flex flex-col" style={{ padding: '2rem', gap: viewMode === 'both' ? '2.5rem' : '1.5rem', overflow: 'visible' }}>
                      {/* HEADER */}
                      <div className="flex justify-between items-center -mb-2">
                        <div className="text-[0.8rem] font-bold uppercase tracking-[0.2em] text-text-primary/70 group-hover:text-accent-primary transition-colors">{body}</div>
                        <span className="text-[0.55rem] font-black text-text-secondary uppercase tracking-[0.15em]">ELEMENT</span>
                      </div>

                      {/* SS BLOCK */}
                      {(viewMode === 'ss' || viewMode === 'both') && (
                        <div className="flex flex-col gap-3">
                          <div className="text-[0.6rem] font-black uppercase tracking-[0.2em] text-text-dim/80">Traditional (SS)</div>
                          <div className="flex justify-between items-end">
                            <div className="text-2xl font-black text-text-primary tracking-tight">{pos.name}</div>
                            <div className="text-3xl font-mono font-black text-text-primary tracking-tighter line-clamp-1 drop-shadow-sm">
                              {pos.degrees}° {pos.minutes}'
                            </div>
                          </div>
                        </div>
                      )}

                      {(viewMode === 'modern' || viewMode === 'both') && modRashi && (
                        <div className={`${viewMode === 'both' ? 'pt-8 border-t border-white/5' : ''} flex flex-col gap-3`}>
                          <div className="text-[0.6rem] font-black text-accent-primary uppercase tracking-[0.2em]">Modern (JPL)</div>
                          <div className="flex justify-between items-end">
                            <span className="text-2xl font-black text-accent-primary">{modRashi.name}</span>
                            <div className="text-2xl font-mono font-black text-accent-primary tracking-tighter line-clamp-1 drop-shadow-sm">
                              {modRashi.degrees}° {modRashi.minutes}'
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Daily Rhythm Master Card */}
          <div className="span-12">
            <div className="glass-card fade-in" style={{ padding: '2.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1.5rem' }}>
                <h2 className="flex items-center gap-3 text-lg font-black tracking-tight">
                  <Clock size={24} className="text-accent-secondary" />
                  <span className="uppercase tracking-widest text-sm opacity-80">Daily Solar-Lunar Rhythm</span>
                </h2>
                <div className="flex items-center gap-6 flex-wrap">
                  {/* Sunrise Box */}
                  <div className="flex flex-col gap-1 items-center bg-accent-secondary/5 px-6 py-3 rounded-xl border border-accent-secondary/20 min-w-[120px]">
                    <div className="flex items-center gap-3">
                      <Sunrise size={20} className="text-accent-secondary" />
                      <span className="text-xl font-bold text-text-primary tracking-tight">{formatHhhMm(modernTimings?.sunriseHours || currentTimings.sunriseHours)}</span>
                    </div>
                    <div className="text-[0.6rem] font-black text-accent-secondary/70 uppercase tracking-widest">
                      SS: {formatHhhMm(panchangaTimings.sunriseHours)}
                    </div>
                  </div>

                  {/* Sunset Box */}
                  <div className="flex flex-col gap-1 items-center bg-accent-error/5 px-6 py-3 rounded-xl border border-accent-error/20 min-w-[120px]">
                    <div className="flex items-center gap-3">
                      <Sunset size={20} className="text-accent-error" />
                      <span className="text-xl font-bold text-text-primary tracking-tight">{formatHhhMm(modernTimings?.sunsetHours || currentTimings.sunsetHours)}</span>
                    </div>
                    <div className="text-[0.6rem] font-black text-accent-error/70 uppercase tracking-widest">
                      SS: {formatHhhMm(panchangaTimings.sunsetHours)}
                    </div>
                  </div>

                  <div className="px-4 py-2 bg-white/5 rounded-lg border border-white/10">
                    <span className="text-[0.7rem] font-black text-text-primary uppercase tracking-widest opacity-90">Modern Day: </span>
                    <span className="text-sm font-bold text-accent-primary">{(modernTimings?.dayLengthHours || currentTimings.dayLengthHours).toFixed(2)}h</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* 1. UNIFIED RHYTHM CENTER (Transitions + Audit) */}
                <div className="lg:col-span-8 border-r border-border-subtle pr-8 overflow-visible">

                  {/* TOP: PANCHANGA TRANSITIONS GRID */}
                  <div className="text-label mb-6 text-sm font-bold uppercase tracking-widest flex items-center gap-3">
                    <Sunrise size={18} className="text-text-dim" /> Sunrise to Sunrise Transitions
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
                    {(['tithis', 'nakshatras', 'yogas', 'karanas'] as const).map((key) => {
                      const label = key.toUpperCase().slice(0, -1);
                      const modItems = modernTimings?.[key];
                      const tradItems = panchangaTimings[key];
                      return (
                        <div key={key} className="bg-white/5 rounded-xl border border-border-subtle flex flex-col gap-6" style={{ padding: '2.5rem', overflow: 'visible' }}>
                          <div className="text-[0.75rem] font-black color-text-dim uppercase tracking-[0.2em] opacity-60 flex justify-between items-center">
                            {label}
                            <span className="text-[0.45rem] px-2 py-0.5 rounded-md bg-white/10 uppercase tracking-widest">ELEMENT</span>
                          </div>

                          <div className="flex flex-col gap-8">
                            {modItems?.slice(0, 2).map((modIt: any, i: number) => {
                              const tradIt = tradItems?.[i];
                              const hasNameDrift = tradIt && modIt.name !== tradIt.name;
                              const isCurrent = i === 0;

                              return (
                                <div key={i} className={`flex flex-col gap-5 ${isCurrent ? 'opacity-100' : 'opacity-60 grayscale-[0.5]'}`}>
                                  {/* MODERN BLOCK */}
                                  <div className="flex flex-col gap-3">
                                    <div className="flex justify-between items-center">
                                      <div className="text-[0.55rem] font-black uppercase tracking-[0.2em] text-accent-primary">JPL MODERN</div>
                                      {!!modIt.endAhargana && (
                                        <span className="px-2 py-0.5 rounded bg-accent-secondary/10 text-[0.6rem] font-black text-accent-secondary uppercase tracking-widest border border-accent-secondary/20">
                                          Ends {modIt.endTimeStr}
                                        </span>
                                      )}
                                    </div>
                                    <div className="text-lg font-black text-text-primary tracking-tight">{modIt.name}</div>
                                  </div>

                                  {/* TRADITIONAL COMPARISON */}
                                  {tradIt && (
                                    <div className="pt-6 border-t border-white/5 flex flex-col gap-3">
                                      <div className="flex justify-between items-center">
                                        <span className="text-[0.55rem] font-black text-text-secondary uppercase tracking-widest opacity-80">TRADITIONAL (SS) BASELINE</span>
                                        {hasNameDrift && <span title="Drift Detected" className="text-accent-error text-[0.8rem]">⚠️</span>}
                                      </div>
                                      <div className="flex justify-between items-end">
                                        <div className={`text-base font-black ${hasNameDrift ? 'text-accent-error' : 'text-text-dim'}`}>
                                          {tradIt.name}
                                        </div>
                                        <div className={`text-sm font-mono font-black ${hasNameDrift ? 'text-accent-error' : 'text-text-dim'}`}>
                                          {!!tradIt.endAhargana ? tradIt.endTimeStr : '→'}
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex justify-between items-center mb-6 pt-10 border-t border-border-subtle">
                    <div className="text-sm font-bold uppercase tracking-widest flex items-center gap-3 text-text-primary">
                      <Layers size={18} className="text-accent-secondary" /> Prosperity Audit (28-System / Abhijit Aware)
                    </div>
                  </div>

                  <div className="flex flex-col overflow-x-auto">
                    {/* Header Row */}
                    <div className="grid grid-cols-[1fr_1.5fr_1.5fr] gap-4 px-6 py-4 bg-white/5 border-b-2 border-border-subtle text-[0.65rem] font-black uppercase tracking-[0.15em] text-text-dim/80">
                      <div>UTC/Local Timing</div>
                      <div>Modern Engine (Sidereal)</div>
                      <div>Siddhanta (Traditional)</div>
                    </div>

                    <div className="flex flex-col max-h-[500px] overflow-y-auto border border-border-subtle border-t-0 rounded-b-xl" style={{ overflowX: 'hidden' }}>
                      {modernTimings?.anandadi28.map((modY, i) => {
                        const ssY = panchangaTimings.anandadi28[i];
                        const hasDrift = ssY && modY.name !== ssY.name;
                        const isAuspiciousMod = modY.type === 'auspicious';
                        const isInauspiciousMod = modY.type === 'inauspicious';

                        return (
                          <div key={i} className={`grid grid-cols-[1fr_1.5fr_1.5fr] gap-4 items-center px-6 py-5 border-b border-border-subtle transition-all duration-200 ${hasDrift ? 'bg-accent-error/5' : (i === 0 ? 'bg-accent-secondary/5' : 'hover:bg-white/2')}`}>
                            {/* 1. MODERN TIMING (Baseline) */}
                            <div className="flex flex-col gap-1">
                              <div className="text-[0.9rem] font-black font-mono text-accent-primary">
                                {modY.endAhargana ? `${modY.endTimeStr}` : 'Remaining'}
                              </div>
                              <div className="text-[0.55rem] font-black text-text-dim uppercase tracking-widest opacity-60">MODERN</div>
                            </div>

                            {/* 2. MODERN OUTPUT (REFERENCE) */}
                            <div className="flex items-center gap-3">
                              <div className={`w-2.5 h-2.5 rounded-full ${isAuspiciousMod ? 'bg-accent-success shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'bg-accent-error shadow-[0_0_8px_rgba(239,68,68,0.4)]'}`}></div>
                              <span className={`text-[1.1rem] font-black uppercase tracking-tight ${isAuspiciousMod ? 'text-accent-success' : isInauspiciousMod ? 'text-accent-error' : 'text-text-primary'}`}>
                                {modY?.name || '---'}
                              </span>
                            </div>

                            {/* 3. SIDDHANTA (AUDIT TARGET) */}
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-3">
                                <span className={`text-[0.95rem] font-black uppercase ${hasDrift ? 'text-accent-error' : 'text-text-secondary'}`}>
                                  {ssY?.name || '---'}
                                </span>
                                {hasDrift && <span title="Planetary Drift Detected" className="text-accent-error text-lg drop-shadow-sm">⚠️</span>}
                              </div>
                              <div className="text-[0.8rem] font-black font-mono text-accent-secondary">
                                {ssY?.endAhargana ? `Ends ${ssY.endTimeStr}` : 'Remaining'}
                              </div>
                              {hasDrift && <div className="text-[0.55rem] text-accent-error font-black uppercase tracking-widest mt-1">SIDDHANTA DRIFT</div>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* 2. Muhurtas & Anandadi Side Panel */}
                <div className="lg:col-span-4 flex flex-col gap-8">
                  <div>
                    <div className="text-sm font-bold uppercase tracking-widest mb-6 text-text-primary flex items-center gap-3">
                      <Clock size={18} className="text-accent-success" /> Auspicious Kaal (Muhurta)
                    </div>
                    <div className="flex flex-col gap-3">
                      {ssMuhurtas.map((m: any, i: number) => {
                        const isAuspicious = m.type === 'auspicious';
                        const isInauspicious = m.type === 'inauspicious';
                        const modM = modernMuhurtas?.find((mm: any) => mm.name === m.name);

                        let borderStyle = 'border-l-4 border-text-dim/30';
                        if (isAuspicious) borderStyle = 'border-l-4 border-accent-success';
                        if (isInauspicious) borderStyle = 'border-l-4 border-accent-error';

                        let bgColor = 'bg-white/5';
                        if (isAuspicious) bgColor = 'bg-accent-success/5';
                        if (isInauspicious) bgColor = 'bg-accent-error/5';

                        return (
                          <div key={i} className={`p-5 ${bgColor} rounded-xl border border-border-subtle ${borderStyle} transition-all hover:border-white/10`}>
                            <div className="flex justify-between items-center">
                              <div>
                                <span className={`text-[0.9rem] font-black tracking-tight ${isAuspicious ? 'text-accent-success' : isInauspicious ? 'text-accent-error' : 'text-text-primary'}`}>{m.name}</span>
                                <div className="text-[0.55rem] font-black text-text-dim uppercase tracking-widest mt-1 opacity-70">{m.category}</div>
                              </div>
                              <div className="text-right flex flex-col gap-1">
                                <div className="text-[0.75rem] font-mono font-black text-text-secondary">{formatHhhMm(m.startHours)} - {formatHhhMm(m.endHours)} <span className="text-[0.5rem] opacity-60">SS</span></div>
                                {modM && <div className="text-[0.7rem] font-mono font-black text-accent-primary">{formatHhhMm(modM.startHours)} - {formatHhhMm(modM.endHours)} <span className="text-[0.45rem] opacity-60">MOD</span></div>}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Extra space reserved for future astronomical plugins */}
                  <div className="mt-4 p-8 border border-dashed border-border-subtle rounded-xl text-center opacity-30 flex flex-col items-center gap-3">
                    <Layers size={24} className="text-text-dim" />
                    <div className="text-[0.65rem] font-black text-text-primary uppercase tracking-[0.2em]">ASTRONOMICAL PLUGIN SPACE</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <ValidationDashboard
          ahargana={ahargana}
          date={selectedDate.toJSDate()}
          ssPositions={rashis as any}
          ssTithi={tithi.index + tithi.fraction}
          ayanMode={modernAyanamsha}
        />
      )}

      <footer style={{ marginTop: '4rem', padding: '2rem 1rem', borderTop: '1px solid var(--border-card)', textAlign: 'center', opacity: 0.6 }}>
        <div style={{ fontSize: '0.8rem', marginBottom: '0.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>Surya Siddhanta audit by <a href="https://nepdate.khumnath.com.np">nepdate</a></div>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Traditional Surya Siddhanta calibrated against JPL-grade Ephemeris (Drik Logic)</div>
      </footer>
    </div>
  );
};
export default App;

