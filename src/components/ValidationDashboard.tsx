/**
 * Comparative Validation Dashboard
 * ===============================
 * 
 * Provides a real-time analytical view of the mathematical "Drift" 
 * between the traditional Surya Siddhanta engine and the high-precision 
 * Modern (Drik) engine.
 */

import React, { useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { AlertCircle, CheckCircle2, Info, Zap, X, HelpCircle, TrendingUp } from 'lucide-react';


// Library Imports
import { getModernPositions, getModernTithi } from '../lib/modern/astronomy';
import { type AyanamshaMode } from '../lib/modern/ayanamsha';

/**
 * Interface for the Validation Dashboard properties.
 */
export interface ValidationProps {
  /** Julian day count (unscaled) for engine synchronization */
  ahargana: number;
  /** Current wall-clock reference date */
  date: Date;
  /** Positions from the Traditional SS engine */
  ssPositions: Record<string, { index: number; name: string; totalLongitude: number }>;
  /** Current Tithi (Lunar day) from the Traditional engine */
  ssTithi: number;
  /** Choice of Ayanamsha for the Modern baseline */
  ayanMode: AyanamshaMode;
}

/**
 * Visualizes the parity and deviations between the two astronomical engines.
 * 
 * It identifies the 'Mean Celestial Drift' by comparing sidereal longitudes 
 * for the seven classical planets (Sun through Saturn).
 */
const ValidationDashboard: React.FC<ValidationProps> = ({ date, ssPositions, ssTithi, ayanMode }) => {
  const [showDriftModal, setShowDriftModal] = React.useState(false);

  /**
   * Orchestrates high-precision modern positions for the exact 
   * moment passed from the main controller.
   */
  const modernData = useMemo(() => {
    const positions = getModernPositions(date, ayanMode);
    const tithi = getModernTithi(date);
    return { positions, tithi };
  }, [date, ayanMode]);

  /**
   * Main Transformation Layer: Computes the modular angular distance 
   * between traditional and modern models.
   */
  const comparisonData = useMemo(() => {
    const bodies = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn'];
    
    return bodies.map(body => {
      const modernLong = (modernData.positions as any)[body];
      const ssLong = ssPositions[body].totalLongitude; 
      // Handle the 360-degree wrap-around for distance calculation:
      // (modern - ss) modularly handled to find the shortest arc.
      const diff = Math.abs(modernLong - ssLong) % 360;
      const error = diff > 180 ? 360 - diff : diff;

      return {
        name: body.toUpperCase(),
        ss: parseFloat(ssLong.toFixed(2)),
        modern: parseFloat(modernLong.toFixed(2)),
        error: parseFloat(error.toFixed(2))
      };
    });
  }, [modernData, ssPositions]);

  /** Tithi error measured in units of Lunar Days (3460/30 = 12°) */
  const tithiError = Math.abs(modernData.tithi - ssTithi);

  return (
    <div className="fade-in" style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
      {/* ─── Summary Accuracy Cards ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card" style={{borderLeft: '4px solid var(--accent-success)'}}>
          <div className="flex-center" style={{marginBottom: '0.5rem'}}>
            <CheckCircle2 color="var(--accent-success)" size={20} />
            <span style={{fontSize: '0.9rem', marginLeft: '0.5rem', fontWeight: 600}}>Tithi Accuracy</span>
          </div>
          <p style={{fontSize: '1.5rem', fontWeight: 700}}>
            {((1 - tithiError/30) * 100).toFixed(2)}%
          </p>
          <p style={{fontSize: '0.75rem', color: 'var(--text-secondary)'}}>
            Delta: {tithiError.toFixed(4)} lunar days
          </p>
        </div>

        <div className="glass-card" style={{borderLeft: '4px solid var(--accent-secondary)'}}>
          <div className="flex-center" style={{marginBottom: '0.5rem'}}>
            <AlertCircle color="var(--accent-secondary)" size={20} />
            <span style={{fontSize: '0.9rem', marginLeft: '0.5rem', fontWeight: 600}}>Mean Celestial Drift</span>
          </div>
          <p style={{fontSize: '1.5rem', fontWeight: 700}}>
            {(comparisonData.reduce((acc, curr) => acc + curr.error, 0) / 7).toFixed(2)}°
          </p>
          <p style={{fontSize: '0.75rem', color: 'var(--text-secondary)'}}>
            {ayanMode === 'tropical' ? 'Tropical vs Sidereal Offset' : 
             ayanMode === 'lahiri' ? 'Lahiri vs Revati Reference Delta' : 
             'Mathematical Engine Precision Delta'}
          </p>
        </div>
      </div>

      {/* ─── Longitude Deviation Chart ─── */}
      <div className="glass-card" style={{height: '350px'}}>
        <h3 className="flex-center" style={{marginBottom: '1rem', fontSize: '1rem', color: 'var(--text-primary)'}}>
          <Info size={16} color="var(--accent-primary)" style={{marginRight: '0.5rem'}} /> 
          Longitude Deviation (Degrees)
        </h3>
        <div style={{width: '100%', height: '280px'}}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={comparisonData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
              <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--text-secondary)" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{background: 'var(--bg-card)', border: '1px solid var(--border-card)', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)'}}
                itemStyle={{color: 'var(--accent-primary)', fontWeight: 600}}
                cursor={{fill: 'var(--bg-subtle)'}}
                formatter={(value: any, name: any) => {
                  if (name === 'error') return [`${value}°`, 'Deviation'];
                  return [value, name || ''];
                }}
                labelFormatter={(label) => {
                  const item = comparisonData.find(d => d.name === label);
                  return `${label} (SS: ${item?.ss}°, Mod: ${item?.modern}°)`;
                }}
              />
              <Bar dataKey="error" fill="var(--accent-primary)" radius={[6, 6, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ─── Data Comparison Table ─── */}
      <div className="glass-card">
        <h3 style={{fontSize: '0.9rem', marginBottom: '1rem', color: 'var(--text-secondary)'}}>Detailed Comparison (Degrees)</h3>
        <table style={{width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem'}}>
          <thead>
            <tr style={{textAlign: 'left', borderBottom: '1px solid var(--border-subtle)'}}>
              <th style={{padding: '0.5rem'}}>Planet</th>
              <th style={{padding: '0.5rem'}}>SS (Baseline)</th>
              <th style={{padding: '0.5rem'}}>Modern ({ayanMode})</th>
              <th style={{padding: '0.5rem', textAlign: 'right'}}>Error</th>
            </tr>
          </thead>
          <tbody>
            {comparisonData.map(row => (
              <tr key={row.name} style={{borderBottom: '1px solid rgba(255,255,255,0.02)'}}>
                <td style={{padding: '0.8rem 0.5rem', fontWeight: 600}}>
                  <div className="flex items-center gap-2">
                    {row.name}
                    {row.name === 'SUN' && (
                      <button 
                        onClick={() => setShowDriftModal(true)}
                        style={{
                          background: 'rgba(99, 102, 241, 0.1)',
                          border: 'none',
                          color: 'var(--accent-primary)',
                          padding: '2px',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                        title="Analyze Drift & Bija"
                      >
                        <HelpCircle size={14} />
                      </button>
                    )}
                  </div>
                </td>
                <td style={{padding: '0.5rem'}}>{row.ss}°</td>
                <td style={{padding: '0.5rem'}}>{row.modern}°</td>
                <td style={{padding: '0.5rem', textAlign: 'right', color: row.error > 1 ? 'var(--accent-secondary)' : 'var(--accent-success)'}}>
                  <div className="flex items-center justify-end gap-2">
                    {row.error}°
                    {row.name === 'SUN' && row.error > 4 && (
                       <TrendingUp size={12} color="var(--accent-secondary)" />
                    )}
                  </div>
                </td>
              </tr>
            ))}

          </tbody>
        </table>
      </div>

      {/* ─── Contextual Footer ─── */}
      <div className="glass-card" style={{background: 'rgba(99, 102, 241, 0.05)', border: '1px solid rgba(99, 102, 241, 0.2)'}}>
         <p style={{fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6}}>
            <Zap size={14} color="var(--accent-primary)" style={{marginRight: '0.5rem', display: 'inline'}} />
            <strong>Astronomical Insight:</strong> The Surya Siddhanta engine uses a fixed sidereal baseline anchored to <b>Revati (ζ Piscium)</b>. 
            The current settings match the Modern engine to this baseline using the <b>{ayanMode}</b> Ayanamsha. 
            Remaining deviations represent the structural difference between traditional 6th-century formulas and JPL planetary ephemeris.
         </p>
      </div>

      {/* ─── Drift Analysis Modal ─── */}
      {showDriftModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0,0,0,0.8)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1rem'
        }} onClick={() => setShowDriftModal(false)}>
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-card)',
            borderRadius: '24px',
            width: '100%',
            maxWidth: '600px',
            padding: '2.5rem',
            position: 'relative',
            boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
          }} onClick={e => e.stopPropagation()}>
            <button 
              onClick={() => setShowDriftModal(false)}
              style={{
                position: 'absolute',
                top: '1.5rem',
                right: '1.5rem',
                background: 'var(--bg-subtle)',
                border: 'none',
                color: 'var(--text-secondary)',
                padding: '0.5rem',
                borderRadius: '50%',
                cursor: 'pointer'
              }}
            >
              <X size={20} />
            </button>

            <div style={{display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem'}}>
              <div style={{padding: '0.8rem', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '14px'}}>
                <TrendingUp size={24} color="var(--accent-primary)" />
              </div>
              <h2 style={{fontSize: '1.5rem', fontWeight: 800}}>Solar Drift & Bija Analysis</h2>
            </div>

            <div style={{display: 'flex', flexDirection: 'column', gap: '1.2rem', color: 'var(--text-primary)', fontSize: '0.95rem', lineHeight: 1.6}}>
              {/* Dynamic Derivative Calculation */}
              {(() => {
                const KALI_JD = 588465.5;
                const dateJD = (date.getTime() / 86400000) + 2440587.5;
                const elapsedYears = (dateJD - KALI_JD) / 365.25875648;
                const annualDrift = 4.6 / 5127; // degrees per year
                const currentAccumulated = elapsedYears * annualDrift;
                const derivedBija = (currentAccumulated * 4320000) / (elapsedYears * 360);

                return (
                  <section style={{background: 'rgba(99, 102, 241, 0.03)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(99, 102, 241, 0.1)'}}>
                    <div style={{fontWeight: 700, color: 'var(--accent-primary)', textTransform: 'uppercase', fontSize: '0.75rem', marginBottom: '0.8rem'}}>Dynamic Bija Derivation</div>
                    <div style={{fontFamily: 'monospace', fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.4rem'}}>
                      <div className="flex justify-between">
                        <span>Years since Kali Epoch:</span>
                        <span style={{fontWeight: 700}}>{elapsedYears.toFixed(2)} yrs</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Calculated Accumulation:</span>
                        <span style={{fontWeight: 700}}>{currentAccumulated.toFixed(2)}°</span>
                      </div>
                      <div className="flex justify-between" style={{borderTop: '1px solid var(--border-subtle)', paddingTop: '0.4rem', marginTop: '0.2rem'}}>
                        <span style={{color: 'var(--accent-success)'}}>Derived Optimal Bija:</span>
                        <span style={{fontWeight: 900, color: 'var(--accent-success)'}}>+{derivedBija.toFixed(2)}</span>
                      </div>
                    </div>
                  </section>
                );
              })()}
              
              <section>

                <div style={{fontWeight: 700, color: 'var(--accent-secondary)', textTransform: 'uppercase', fontSize: '0.75rem', marginBottom: '0.5rem'}}>Observed Discrepancy</div>
                <p>
                  The original **Surya Siddhanta Sun** is currently lagging by approximately <strong style={{color: 'var(--accent-secondary)'}}>4.6°</strong> ($~4.6$ days) compared to the modern sidereal epoch.
                </p>
              </section>

              <section style={{background: 'rgba(255,255,255,0.02)', padding: '1.2rem', borderRadius: '16px', border: '1px solid var(--border-subtle)'}}>
                <div style={{fontWeight: 700, color: 'var(--accent-primary)', textTransform: 'uppercase', fontSize: '0.75rem', marginBottom: '0.5rem'}}>Historical Context</div>
                <p style={{fontSize: '0.85rem', opacity: 0.9}}>
                  This drift has accumulated over <strong style={{color: 'var(--text-primary)'}}>5,127 years</strong> (since Kali Yuga). The Siddhantic year is roughly 3.5 minutes longer than the modern one, resulting in a 1° lag per millennium.
                </p>
              </section>

              <section>
                <div style={{fontWeight: 700, color: 'var(--accent-success)', textTransform: 'uppercase', fontSize: '0.75rem', marginBottom: '0.5rem'}}>Formula Logic</div>
                <div style={{background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '12px', fontSize: '0.85rem'}}>
                  <p style={{fontFamily: 'serif', fontStyle: 'italic', marginBottom: '0.5rem'}}>
                    "The Bija ($B$) required to nullify a drift of $\Delta L$ degrees over $T$ years is:"
                  </p>
                  <code style={{display: 'block', padding: '0.5rem', background: 'rgba(0,0,0,0.2)', borderRadius: '6px', textAlign: 'center'}}>
                    B = (ΔL × 4,320,000) / (T × 360)
                  </code>
                </div>
              </section>


              <div style={{marginTop: '1rem', padding: '1rem', borderRadius: '12px', background: 'rgba(99, 102, 241, 0.08)', fontSize: '0.85rem', border: '1px solid rgba(99, 102, 241, 0.2)'}}>
                <div style={{display: 'flex', gap: '0.8rem'}}>
                  <Info size={18} color="var(--accent-primary)" className="shrink-0" />
                  <p style={{margin: 0}}>
                    <strong>Historical Note:</strong> The standard <strong>+28 day Civil Bija</strong> (1,577,917,828 days/Age) is already active in this engine. The 4.6° drift remains as the cumulative longitudinal error of the uncorrected Sun model.
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};


export default ValidationDashboard;
