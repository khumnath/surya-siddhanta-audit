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
  Moon, Sun as SunIcon
} from 'lucide-react';


// Library Imports
import { KATHMANDU, getAllLocations } from './lib/surya-siddhanta/geography/location';
import type { Location } from './types/astronomy';
import { dateTimeToAhargana } from './lib/surya-siddhanta/time/conversions';
import {
  getTithiDetails, calculateNakshatra,
  getSolarMonthName, getAyana, getSeason,
  getAllPlanetRashis, getLunarMonthName, getSunriseSunset,
  getBikramMonthName, longitudeToRashiDetailed
} from './lib/surya-siddhanta/calendar/calendar';
import { computeDayPanchangaTimings } from './lib/surya-siddhanta/calendar/panchanga-timings';
import {
  computeModernPanchangaTimings,
  getModernPanchangaElements
} from './lib/modern/panchanga-timings';
import { getModernPositions } from './lib/modern/astronomy';
import { type AyanamshaMode } from './lib/modern/ayanamsha';
import { getAllEraYears } from './lib/surya-siddhanta/time/eras';
import { getLagna } from './lib/surya-siddhanta/astrology/lagna';
import { calculateDailyMuhurtas } from './lib/surya-siddhanta/calendar/muhurta';
import { getModernLagna } from './lib/modern/astronomy';


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
  const lunarMonth = getLunarMonthName(ahargana);
  const ayana = getAyana(ahargana);
  const season = getSeason(ahargana);
  const eras = getAllEraYears(ahargana);
  const rashis = getAllPlanetRashis(ahargana);
  const sunTimes = getSunriseSunset(ahargana, location.latitude);
  const bikramMonth = getBikramMonthName(ahargana);
  const ssLagna = getLagna(ahargana, location.latitude, location.longitude);

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

  // Modern Lagna
  const modernLagna = useMemo(() => {
    if (viewMode === 'ss') return null;
    return getModernLagna(selectedDate.toJSDate(), location, modernAyanamsha);
  }, [viewMode, selectedDate, location, modernAyanamsha]);



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
      {/* Parity Accuracy Bar */}
      {viewMode !== 'ss' && parityScore !== null && (
        <div style={{
          padding: '0.4rem 1.5rem',
          background: 'rgba(255,255,255,0.03)',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.65rem',
          fontWeight: 700,
          letterSpacing: '0.1em',
          textTransform: 'uppercase'
        }}>
          <div className="flex-center" style={{ gap: '0.6rem' }}>
            <LineChart size={14} color="var(--accent-secondary)" />
            <span style={{ color: 'var(--text-dim)' }}>Siddhanta-Modern Parity:</span>
            <span style={{ color: parityScore > 90 ? 'var(--accent-success)' : 'var(--accent-secondary)' }}>
              {parityScore.toFixed(1)}% Match
            </span>
          </div>
          <div style={{ width: '200px', height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
            <div style={{ width: `${parityScore}%`, height: '100%', background: 'var(--accent-secondary)', transition: 'width 1s ease-out' }}></div>
          </div>
        </div>
      )}

      <header className="header" style={{ marginBottom: '2.5rem', alignItems: 'center' }}>
        <div className="logo" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Globe size={32} color="var(--accent-primary)" />
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.6rem' }}>
              <span style={{
                fontSize: '1.8rem',
                fontWeight: 900,
                letterSpacing: '-0.02em',
                background: 'linear-gradient(135deg, var(--text-primary) 0%, var(--accent-primary) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                Siddhanta Parity by Nepdate
              </span>
              <span style={{
                fontSize: '0.65rem',
                fontWeight: 900,
                color: 'var(--accent-primary)',
                opacity: 0.8,
                background: 'rgba(99, 102, 241, 0.1)',
                padding: '0.15rem 0.5rem',
                borderRadius: '6px',
                letterSpacing: '0.05em'
              }}>
                v1.2.0
              </span>
            </div>
          </div>
          <div style={{ fontSize: '0.6rem', color: 'var(--text-dim)', letterSpacing: '0.25em', fontWeight: 900, textTransform: 'uppercase', marginTop: '0.2rem', marginLeft: '3.2rem', opacity: 0.7 }}>Vedic Astronomical Audit</div>
        </div>

        <div className="flex-center" style={{ gap: '1rem' }}>
          <div className="flex-center" style={{ gap: '0.8rem', background: 'rgba(255,255,255,0.05)', padding: '0.5rem 1rem', borderRadius: '12px', border: '1px solid var(--border-card)' }}>
            <MapPin size={18} color="var(--accent-primary)" />
            <select
              value={location.name}
              onChange={handleLocationChange}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', fontSize: '0.9rem', outline: 'none', cursor: 'pointer' }}
            >
              {locations.map(loc => (
                <option key={loc.name} value={loc.name} style={{ background: 'var(--bg-card)' }}>{loc.name}</option>
              ))}
            </select>
          </div>

          <div className="flex-center" style={{ gap: '0.8rem', background: 'rgba(255,255,255,0.05)', padding: '0.5rem 1rem', borderRadius: '12px', border: '1px solid var(--border-card)' }}>
            <CalendarIcon size={18} color="var(--accent-secondary)" />
            <input
              type="datetime-local"
              value={selectedDate.toFormat("yyyy-MM-dd'T'HH:mm")}
              onChange={handleDateChange}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', fontSize: '0.9rem', outline: 'none', cursor: 'pointer' }}
            />
            {!useCurrentTime && (
              <button
                onClick={() => setUseCurrentTime(true)}
                style={{ background: 'var(--accent-primary)', border: 'none', color: 'white', fontSize: '0.7rem', padding: '0.2rem 0.5rem', borderRadius: '4px', cursor: 'pointer' }}
              >
                Reset
              </button>
            )}
          </div>
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-card)', color: 'var(--text-primary)', padding: '0.5rem', borderRadius: '12px' }}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            {theme === 'dark' ? <SunIcon size={20} /> : <Moon size={20} />}
          </button>
          <a
            href="/docs/index.html"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              background: 'rgba(99, 102, 241, 0.1)',
              border: '1px solid var(--accent-primary)',
              color: 'var(--accent-primary)',
              padding: '0.5rem 1rem',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              fontSize: '0.8rem',
              fontWeight: 600,
              textDecoration: 'none'
            }}
            title="View Siddhanta Parity API Documentation"
          >
            <BookOpen size={18} /> API Docs
          </a>
        </div>
      </header>

      <nav style={{ display: 'flex', gap: '1rem', marginBottom: '2.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <button
          onClick={() => setActiveTab('panchanga')}
          className={activeTab === 'panchanga' ? 'active-tab' : 'inactive-tab'}
          style={{
            background: activeTab === 'panchanga' ? 'var(--accent-primary)' : 'transparent',
            border: activeTab === 'panchanga' ? 'none' : '1px solid var(--border-card)',
            padding: '0.6rem 1.2rem', borderRadius: '10px', cursor: 'pointer',
            color: activeTab === 'panchanga' ? 'white' : 'var(--text-secondary)',
            display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500
          }}
        >
          <CalendarIcon size={18} /> Daily Panchanga
        </button>
        <button
          onClick={() => setActiveTab('validation')}
          style={{
            background: activeTab === 'validation' ? 'var(--accent-primary)' : 'transparent',
            border: activeTab === 'validation' ? 'none' : '1px solid var(--border-card)',
            padding: '0.6rem 1.2rem', borderRadius: '10px', cursor: 'pointer',
            color: activeTab === 'validation' ? 'white' : 'var(--text-secondary)',
            display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500
          }}
        >
          <LineChart size={18} /> Engine Accuracy
        </button>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{
            display: 'flex',
            background: 'var(--bg-dark)',
            padding: '0.3rem',
            borderRadius: '12px',
            border: '1px solid var(--border-card)',
            gap: '0.2rem'
          }}>
            {(['ss', 'modern', 'both'] as const).map(mode => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                style={{
                  padding: '0.4rem 0.8rem',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: viewMode === mode ? 'var(--accent-primary)' : 'transparent',
                  color: viewMode === mode ? 'white' : 'var(--text-dim)',
                  transition: 'all 0.2s ease',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}
              >
                {mode === 'ss' ? 'Trad (SS)' : mode === 'modern' ? 'Mod (JPL)' : 'Compare'}
              </button>
            ))}
          </div>

          {viewMode !== 'ss' && (
            <div className="flex-center" style={{ gap: '0.5rem', background: 'rgba(255,255,255,0.05)', padding: '0.4rem 0.8rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <select
                value={modernAyanamsha}
                onChange={(e) => setModernAyanamsha(e.target.value as AyanamshaMode)}
                style={{ background: 'transparent', border: 'none', color: 'var(--accent-primary)', fontSize: '0.75rem', fontWeight: 600, outline: 'none', cursor: 'pointer' }}
              >
                <option value="lahiri" style={{ background: 'var(--bg-card)' }}>Lahiri</option>
                <option value="ss_lib" style={{ background: 'var(--bg-card)' }}>Revati</option>
                <option value="tropical" style={{ background: 'var(--bg-card)' }}>Tropical</option>
              </select>
            </div>
          )}
        </div>
      </nav>

      {activeTab === "panchanga" ? (
        <div className="grid-12 fade-in">

          {/* Chronology Master Card */}
          <div className="span-12">
            <div className="glass-card fade-in" style={{ borderTop: '4px solid var(--accent-primary)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <h2 className="flex-center" style={{ fontSize: '1.2rem' }}>
                  <Globe size={24} color="var(--accent-primary)" /> Chronology & Era Systems
                </h2>
                <div className="flex-center" style={{ background: 'rgba(255,255,255,0.03)', padding: '0.4rem 1rem', borderRadius: '12px', fontSize: '0.75rem' }}>
                  <span className="text-label" style={{ marginRight: '0.5rem' }}>Julian Day:</span>
                  <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>{(ahargana + 2451545.0 + 0.5).toFixed(2)}</span>
                </div>
              </div>

              <div className="grid-12">
                {/* Samvatsara Section */}
                <div className="span-4" style={{ borderRight: '1px solid var(--border-subtle)', paddingRight: '1.5rem' }}>
                  <div className="text-label" style={{ marginBottom: '1rem' }}>Samvatsara (60-Cycle)</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                    <div>
                      <div className="text-value" style={{ fontSize: '1.4rem' }}>{eras.south_samvatsar}</div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)', fontWeight: 700 }}>SOUTH SYSTEM</div>
                    </div>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '0.4rem' }}>
                        <div className="text-value" style={{ fontSize: '1.1rem', opacity: 0.9 }}>{eras.north_samvatsar}</div>
                        <div style={{ fontSize: '0.6rem', color: 'var(--accent-secondary)', fontWeight: 800, opacity: 0.8 }}>{((eras.north_samvatsar_fraction as number) * 100).toFixed(0)}% YEAR PROGRESS</div>
                      </div>
                      <div style={{ width: '100%', height: '3px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                        <div style={{ width: `${(eras.north_samvatsar_fraction as number) * 100}%`, height: '100%', background: 'var(--accent-secondary)', opacity: 0.6 }}></div>
                      </div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)', fontWeight: 700, marginTop: '0.4rem' }}>NORTH SYSTEM (JUPITER)</div>
                    </div>
                  </div>
                </div>

                {/* Major Eras Section */}
                <div className="span-8">
                  <div className="text-label" style={{ marginBottom: '1rem' }}>Traditional Eras</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1.5rem' }}>
                    {Object.entries(eras).filter(([k]) => !k.includes('samvatsar')).map(([key, val]) => (
                      <div key={key}>
                        <div className="text-value" style={{ color: key === 'vikram_samvat' ? 'var(--accent-secondary)' : 'var(--text-primary)' }}>{val}</div>
                        <div className="text-label" style={{ fontSize: '0.55rem', marginTop: '0.2rem' }}>{key.replace(/_/g, ' ')}</div>
                      </div>
                    ))}
                  </div>

                  {isBikramNewYearApproaching && (
                    <div style={{ marginTop: '1.5rem', padding: '0.75rem 1rem', background: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.2)', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                      <Info size={18} color="var(--accent-secondary)" />
                      <div style={{ fontSize: '0.7rem', color: 'var(--accent-secondary)', fontWeight: 500 }}>
                        <strong>New Year Transition:</strong> Currently in Chaitra (Meena). BS {Number(eras.vikram_samvat) + 1} starting soon.
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Primary Panchanga Hub Card */}
          <div className="span-12">
            <div className="glass-card" style={{ borderTop: '4px solid var(--accent-secondary)' }}>
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
                      borderTop: `4px solid ${item.color}`,
                      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                      position: 'relative'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                        <div className="text-label" style={{ color: item.color, fontWeight: 900, fontSize: '0.7rem', letterSpacing: '0.12em' }}>{item.label}</div>
                        <div style={{ fontSize: '0.55rem', fontWeight: 800, color: 'var(--accent-primary)', opacity: 0.8, letterSpacing: '0.05em', background: 'rgba(99, 102, 241, 0.1)', padding: '0.2rem 0.4rem', borderRadius: '4px' }}>
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
                          background: val.endAhargana ? `${item.color}15` : 'rgba(255,255,255,0.05)',
                          padding: '0.2rem 0.6rem',
                          borderRadius: '6px',
                          display: 'inline-block'
                        }}>
                          {val.endAhargana ? `Ends ${val.endTimeStr}` : 'Full Day'}
                        </div>
                      </div>

                      <div style={{ marginTop: '1.2rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
                        {item.trad && (
                          <div style={{ padding: '0.5rem', background: hasDrift ? 'rgba(239, 68, 68, 0.05)' : 'rgba(255,255,255,0.02)', borderRadius: '8px', border: hasDrift ? '1px solid rgba(239, 68, 68, 0.1)' : '1px solid var(--border-subtle)' }}>
                            <div style={{ fontSize: '0.6rem', fontWeight: 800, color: hasDrift ? 'var(--accent-error)' : 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '0.3rem', letterSpacing: '0.05em' }}>TRADITIONAL (SS)</div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: hasDrift ? 'var(--accent-error)' : 'var(--text-primary)' }}>{item.trad.name}</span>
                              <span style={{ fontSize: '0.7rem', fontWeight: 700, fontFamily: 'monospace', color: 'var(--text-dim)' }}>
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-subtle)' }}>
                <div>
                  <div className="text-label" style={{ marginBottom: '0.8rem' }}>☀️ Solar (Sauramana)</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                    <div>
                      <div className="text-value" style={{ fontSize: '0.9rem' }}>{solarMonth}</div>
                      <div className="text-label" style={{ fontSize: '0.5rem' }}>SUN RASHI</div>
                    </div>
                    <div>
                      <div className="text-value" style={{ fontSize: '0.9rem', color: 'var(--accent-secondary)' }}>{bikramMonth}</div>
                      <div className="text-label" style={{ fontSize: '0.5rem' }}>BS MONTH</div>
                    </div>
                    <div>
                      <div className="text-value" style={{ fontSize: '0.8rem' }}>{season}</div>
                      <div className="text-label" style={{ fontSize: '0.5rem' }}>SEASON</div>
                    </div>
                    <div>
                      <div className="text-value" style={{ fontSize: '0.8rem' }}>{ayana}</div>
                      <div className="text-label" style={{ fontSize: '0.5rem' }}>AYANA</div>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="text-label" style={{ marginBottom: '0.8rem' }}>🌙 Lunar (Chandramana)</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                    <div>
                      <div className="text-value" style={{ fontSize: '0.9rem' }}>{lunarMonth}</div>
                      <div className="text-label" style={{ fontSize: '0.5rem' }}>LUNAR MONTH</div>
                    </div>
                    <div>
                      <div className="text-value" style={{ fontSize: '0.9rem' }}>{tithi.paksha}</div>
                      <div className="text-label" style={{ fontSize: '0.5rem' }}>PAKSHA</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Celestial Longitudes Card (Full Width) */}
          <div className="span-12">
            <div className="glass-card" style={{ borderTop: '4px solid var(--accent-primary)' }}>
              <h2 className="flex-center" style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>
                <Layers color="var(--accent-primary)" /> Celestial Longitudes & Planet Positions
              </h2>
              <div className="grid-12" style={{ gap: '1.5rem' }}>
                {/* Lagna Section */}
                <div className="span-12" style={{ padding: '1rem', background: 'rgba(99, 102, 241, 0.05)', borderRadius: '14px', border: '1px solid var(--accent-primary)', marginBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div className="text-label" style={{ marginBottom: '0.4rem' }}>LAGNA (ASCENDANT)</div>
                      <div className="text-value" style={{ fontSize: '1.2rem' }}>{ssLagna.rashiName}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1rem', fontWeight: 700 }}>{Math.floor(ssLagna.degreeInRashi)}° {Math.floor((ssLagna.degreeInRashi % 1) * 60)}'</div>
                      <div style={{ fontSize: '0.6rem', color: 'var(--text-dim)' }}>SIDDANTIC BASELINE</div>
                    </div>
                  </div>
                  {viewMode === 'both' && modernLagna && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.8rem', paddingTop: '0.8rem', borderTop: '1px solid var(--border-subtle)' }}>
                      <div className="text-value" style={{ fontSize: '0.9rem', color: 'var(--accent-primary)' }}>{modernLagna.rashiName} (JPL)</div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-primary)' }}>{Math.floor(modernLagna.degreeInRashi)}° {Math.floor((modernLagna.degreeInRashi % 1) * 60)}'</div>
                        <div style={{ fontSize: '0.5rem', color: 'var(--text-dim)' }}>MODERN DRIK PARITY</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Planets Grid */}
                {Object.entries(rashis).map(([body, pos]) => {
                  const modLon = modernPositions ? (modernPositions as any)[body] : null;
                  const modRashi = modLon !== null ? longitudeToRashiDetailed(modLon) : null;
                  return (
                    <div key={body} className="span-3" style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
                      <div className="text-label" style={{ fontSize: '0.6rem', marginBottom: '0.5rem' }}>{body.toUpperCase()}</div>
                      <div className="text-value" style={{ fontSize: '0.9rem', marginBottom: '0.4rem' }}>{pos.name}</div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 700 }}>{pos.degrees}° {pos.minutes}'</div>
                        <div style={{ fontSize: '0.5rem', color: 'var(--text-dim)' }}>SS</div>
                      </div>
                      {modRashi && (
                        <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                          <div style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', fontWeight: 600 }}>{modRashi.name}</div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ fontSize: '0.65rem', color: 'var(--accent-primary)' }}>{modRashi.degrees}° {modRashi.minutes}'</div>
                            <div style={{ fontSize: '0.45rem', color: 'var(--accent-primary)', opacity: 0.7 }}>JPL</div>
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
            <div className="glass-card fade-in" style={{ borderTop: '4px solid var(--accent-secondary)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <h2 className="flex-center" style={{ fontSize: '1.2rem' }}>
                  <Clock size={24} color="var(--accent-secondary)" /> Daily Solar-Lunar Rhythm
                </h2>
                <div className="flex-center" style={{ gap: '1rem', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', alignItems: 'center', background: 'rgba(25, 118, 210, 0.05)', padding: '0.6rem 1rem', borderRadius: '14px', border: '1px solid rgba(25, 118, 210, 0.1)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <Sunrise size={18} color="var(--accent-secondary)" />
                      <span style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--text-primary)' }}>{formatHhhMm(modernTimings?.sunriseHours || currentTimings.sunriseHours)}</span>
                    </div>
                    <div style={{ fontSize: '0.55rem', fontWeight: 800, color: 'var(--text-dim)', letterSpacing: '0.05em' }}>
                      SS: {formatHhhMm(panchangaTimings.sunriseHours)}
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', alignItems: 'center', background: 'rgba(255, 87, 34, 0.05)', padding: '0.6rem 1rem', borderRadius: '14px', border: '1px solid rgba(255, 87, 34, 0.1)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <Sunset size={18} color="var(--accent-error)" />
                      <span style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--text-primary)' }}>{formatHhhMm(modernTimings?.sunsetHours || currentTimings.sunsetHours)}</span>
                    </div>
                    <div style={{ fontSize: '0.55rem', fontWeight: 800, color: 'var(--text-dim)', letterSpacing: '0.05em' }}>
                      SS: {formatHhhMm(panchangaTimings.sunsetHours)}
                    </div>
                  </div>

                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 700, padding: '0 0.5rem' }}>
                    MODERN DAY: {(modernTimings?.dayLengthHours || currentTimings.dayLengthHours).toFixed(2)}h
                  </div>
                </div>
              </div>

              <div className="grid-12" style={{ gap: '1.5rem' }}>
                {/* 1. UNIFIED RHYTHM CENTER (Transitions + Audit) */}
                <div className="span-8" style={{ borderRight: '1px solid var(--border-subtle)', paddingRight: '1.5rem', overflowX: 'hidden' }}>

                  {/* TOP: PANCHANGA TRANSITIONS GRID */}
                  <div className="text-label" style={{ marginBottom: '1.2rem', fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)' }}>Sunrise to Sunrise Transitions</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.8rem', marginBottom: '2.5rem' }}>
                    {(['tithis', 'nakshatras', 'yogas', 'karanas'] as const).map((key) => {
                      const label = key.toUpperCase().slice(0, -1);
                      const modItems = modernTimings?.[key];
                      const tradItems = panchangaTimings[key];
                      return (
                        <div key={key} style={{ background: 'rgba(255,255,255,0.015)', padding: '1rem', borderRadius: '14px', border: '1px solid var(--border-subtle)', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
                          <div style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--accent-secondary)', marginBottom: '1rem', letterSpacing: '0.12em', textTransform: 'uppercase' }}>{label}</div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                            {modItems?.slice(0, 2).map((modIt: any, i: number) => {
                              const tradIt = tradItems?.[i];
                              const hasNameDrift = tradIt && modIt.name !== tradIt.name;
                              const isCurrent = i === 0;

                              return (
                                <div key={i} style={{
                                  opacity: isCurrent ? 1 : 0.7,
                                  padding: '1rem',
                                  background: isCurrent ? 'rgba(255,255,255,0.03)' : 'transparent',
                                  borderRadius: '12px',
                                  border: isCurrent ? '1px solid rgba(255, 152, 0, 0.2)' : '1px solid transparent',
                                  borderLeft: isCurrent ? '4px solid var(--accent-secondary)' : '1px solid transparent'
                                }}>
                                  {/* MODERN ELEMENT */}
                                  <div style={{ marginBottom: '0.4rem' }}>
                                    <div style={{
                                      fontSize: '0.45rem',
                                      fontWeight: 900,
                                      color: 'var(--accent-primary)',
                                      opacity: 0.8,
                                      letterSpacing: '0.1em',
                                      background: 'rgba(99, 102, 241, 0.08)',
                                      padding: '0.1rem 0.4rem',
                                      borderRadius: '4px',
                                      display: 'inline-block',
                                      textTransform: 'uppercase',
                                      marginBottom: '0.2rem'
                                    }}>
                                      JPL Modern
                                    </div>
                                    <div style={{ fontWeight: 900, fontSize: '1.2rem', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>{modIt.name}</div>
                                  </div>

                                  <div style={{
                                    fontSize: '0.85rem',
                                    color: modIt.endAhargana ? 'var(--accent-secondary)' : 'var(--text-dim)',
                                    fontFamily: 'monospace',
                                    fontWeight: 800,
                                    background: modIt.endAhargana ? 'rgba(255, 152, 0, 0.1)' : 'rgba(255,255,255,0.05)',
                                    padding: '0.25rem 0.6rem',
                                    borderRadius: '6px',
                                    display: 'inline-block'
                                  }}>
                                    {modIt.endAhargana ? `Ends ${modIt.endTimeStr}` : 'Remaining'}
                                  </div>

                                  {/* TRADITIONAL COMPARISON */}
                                  {tradIt && (
                                    <div style={{ marginTop: '1rem', paddingTop: '0.8rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                      <div style={{ fontSize: '0.6rem', fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '0.4rem', letterSpacing: '0.05em' }}>Traditional (SS) Baseline</div>
                                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ fontWeight: 800, fontSize: '0.8rem', color: hasNameDrift ? 'var(--accent-error)' : 'var(--text-dim)' }}>
                                          {tradIt.name}
                                        </div>
                                        <div style={{ fontSize: '0.75rem', fontWeight: 700, fontFamily: 'monospace', color: hasNameDrift ? 'var(--accent-error)' : 'var(--text-dim)' }}>
                                          {tradIt.endAhargana ? `${tradIt.endTimeStr}` : '→'}
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

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-subtle)' }}>
                    <div className="text-label" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      <Layers size={18} color="var(--accent-secondary)" /> Prosperity Audit (28-System / Abhijit Aware)
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', overflowX: 'auto' }}>
                    {/* Header Row */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1.5fr 1.5fr',
                      gap: '1rem',
                      padding: '1rem 0.8rem',
                      background: 'rgba(255,255,255,0.02)',
                      borderBottom: '2px solid var(--border-subtle)',
                      fontSize: '0.65rem',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      color: 'var(--text-dim)'
                    }}>
                      <div>UTC/Local Timing</div>
                      <div>Modern Engine (Sidereal)</div>
                      <div>Siddhanta (Traditional)</div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', maxHeight: '450px', overflowY: 'auto', border: '1px solid var(--border-subtle)', borderTop: 'none', borderRadius: '0 0 10px 10px' }}>
                      {modernTimings?.anandadi28.map((modY, i) => {
                        const ssY = panchangaTimings.anandadi28[i];
                        const hasDrift = ssY && modY.name !== ssY.name;
                        const isAuspiciousMod = modY.type === 'auspicious';
                        const isInauspiciousMod = modY.type === 'inauspicious';

                        return (
                          <div key={i} style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1.5fr 1.5fr',
                            gap: '1rem',
                            alignItems: 'center',
                            padding: '1rem 0.8rem',
                            borderBottom: '1px solid var(--border-subtle)',
                            background: hasDrift ? 'rgba(239, 68, 68, 0.04)' : (i === 0 ? 'rgba(255,152,0,0.04)' : 'transparent'),
                            transition: 'all 0.2s ease'
                          }}>

                            {/* 1. MODERN TIMING (Baseline) */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                              <div style={{ fontSize: '0.85rem', fontWeight: 800, fontFamily: 'monospace', color: 'var(--accent-primary)' }}>
                                {modY.endAhargana ? `${modY.endTimeStr}` : 'Remaining'}
                              </div>
                              <div style={{ fontSize: '0.55rem', fontWeight: 700, color: 'var(--text-dim)', letterSpacing: '0.05em' }}>MODERN</div>
                            </div>

                            {/* 2. MODERN OUTPUT (REFERENCE) */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                              {isAuspiciousMod ? <div style={{ width: '8px', height: '8px', background: 'var(--accent-success)', borderRadius: '50%' }}></div> : <div style={{ width: '8px', height: '8px', background: 'var(--accent-error)', borderRadius: '50%' }}></div>}
                              <span style={{ fontSize: '1rem', fontWeight: 900, color: isAuspiciousMod ? 'var(--accent-success)' : isInauspiciousMod ? 'var(--accent-error)' : 'var(--text-primary)', textTransform: 'uppercase' }}>
                                {modY?.name || '---'}
                              </span>
                            </div>

                            {/* 3. SIDDHANTA (AUDIT TARGET) */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                <span style={{ fontSize: '0.9rem', fontWeight: 800, color: hasDrift ? 'var(--accent-error)' : 'var(--text-dim)', textTransform: 'uppercase', opacity: 1 }}>
                                  {ssY?.name || '---'}
                                </span>
                                {hasDrift && (
                                  <span title="Planetary Drift Detected" style={{ color: 'var(--accent-error)', fontSize: '1rem' }}>
                                    ⚠️
                                  </span>
                                )}
                              </div>
                              <div style={{ fontSize: '0.75rem', fontWeight: 700, fontFamily: 'monospace', color: 'var(--accent-secondary)', opacity: 0.9 }}>
                                {ssY?.endAhargana ? `Ends ${ssY.endTimeStr}` : 'Remaining'}
                              </div>
                              {hasDrift && <div style={{ fontSize: '0.55rem', color: 'var(--accent-error)', fontWeight: 800, letterSpacing: '0.05em' }}>SIDDHANTA DRIFT</div>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* 2. Muhurtas & Anandadi Side Panel */}
                <div className="span-4">
                  <div style={{ marginBottom: '2rem' }}>
                    <div className="text-label" style={{ marginBottom: '1rem' }}>Auspicious Kaal (Muhurta)</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', paddingRight: '0.5rem' }}>
                      {ssMuhurtas.map((m: any, i: number) => {
                        const isAuspicious = m.type === 'auspicious';
                        const isInauspicious = m.type === 'inauspicious';
                        const modM = modernMuhurtas?.find((mm: any) => mm.name === m.name);

                        let borderStyle = '3px solid var(--text-dim)';
                        if (isAuspicious) borderStyle = '3px solid var(--accent-success)';
                        if (isInauspicious) borderStyle = '3px solid var(--accent-error)';

                        let bgColor = 'rgba(255,255,255,0.02)';
                        if (isAuspicious) bgColor = 'rgba(16, 185, 129, 0.05)';
                        if (isInauspicious) bgColor = 'rgba(239, 68, 68, 0.05)';

                        return (
                          <div key={i} style={{ padding: '0.6rem 0.8rem', background: bgColor, borderRadius: '10px', borderLeft: borderStyle }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div>
                                <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>{m.name}</span>
                                <div style={{ fontSize: '0.45rem', opacity: 0.6, marginTop: '0.2rem', textTransform: 'uppercase' }}>{m.category}</div>
                              </div>
                              <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '0.6rem', fontFamily: 'monospace', color: 'var(--text-dim)' }}>{formatHhhMm(m.startHours)} - {formatHhhMm(m.endHours)} <span style={{ fontSize: '0.45rem' }}>SS</span></div>
                                {modM && <div style={{ fontSize: '0.55rem', fontFamily: 'monospace', color: 'var(--accent-primary)' }}>{formatHhhMm(modM.startHours)} - {formatHhhMm(modM.endHours)} <span style={{ fontSize: '0.45rem' }}>MOD</span></div>}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Extra space reserved for future astronomical plugins */}
                  <div style={{ marginTop: '2rem', padding: '1rem', border: '1px dashed var(--border-subtle)', borderRadius: '12px', textAlign: 'center', opacity: 0.3 }}>
                    <div style={{ fontSize: '0.6rem', color: 'var(--text-primary)', letterSpacing: '0.1em' }}>ASTRONOMICAL PLUGIN SPACE</div>
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
        <div style={{ fontSize: '0.8rem', marginBottom: '0.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>SIDDHANTA PARITY v1.2.0 by <a href="https://nepdate.khumnath.com.np">nepdate</a></div>
        <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Traditional Surya Siddhanta calibrated against JPL JPL-grade Ephemeris (Drik Logic)</div>
      </footer>
    </div>
  );
};
export default App;

