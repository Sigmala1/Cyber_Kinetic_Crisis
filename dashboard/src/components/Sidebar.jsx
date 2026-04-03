import React from 'react';
import { Shield, HardDrive, Wifi, Search, Ghost, StopCircle, Trash2 } from 'lucide-react';
import { TIER_CONFIG } from '../tiers';

export default function Sidebar({
  isScanning, onScan, totalFound, devices = [],
}) {
  const tierCounts = Object.keys(TIER_CONFIG).reduce((acc, tier) => {
    acc[tier] = devices.filter(d => d.securityTier === Number(tier)).length;
    return acc;
  }, {});

  return (
    <div
      style={{ width: '280px', padding: '24px', borderRight: '1px solid var(--glass-border)', flexShrink: 0 }}
      className="glass-panel flex-col gap-4"
    >
      {/* ── Brand ── */}
      <div className="flex items-center gap-2" style={{ marginBottom: '24px' }}>
        <Shield size={32} className="text-primary" />
        <div>
          <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Cyber-Kinetic</h2>
          <span className="text-muted" style={{ fontSize: '0.875rem' }}>Facility Monitor</span>
        </div>
      </div>

      {/* ── Scan Network ── */}
      <button
        id="scan-network-btn"
        className={`w-full justify-center ${isScanning ? 'primary animate-pulse' : 'primary'}`}
        onClick={onScan}
        disabled={isScanning}
      >
        <Search size={18} />
        {isScanning ? 'Scanning Network…' : 'Scan Network'}
      </button>

      {/* ── Network Status ── */}
      <div style={{ marginTop: '20px' }}>
        <h4 className="text-muted" style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '14px' }}>
          Network Status
        </h4>
        <div className="flex justify-between items-center" style={{ marginBottom: '10px' }}>
          <span className="flex items-center gap-2"><Wifi size={15} style={{ color: '#3fb950' }} /> Connection</span>
          <span style={{ color: '#3fb950', fontWeight: 600 }}>Secure</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="flex items-center gap-2"><HardDrive size={15} className="text-primary" /> Discovered</span>
          <span style={{ fontWeight: 600 }}>{totalFound} Node{totalFound !== 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* ── ISO 27001 Classification ── */}
      <div style={{ marginTop: '20px', paddingTop: '18px', borderTop: '1px solid var(--glass-border)' }}>
        <h4 className="text-muted" style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '14px' }}>
          ISO 27001 Classification
        </h4>

        {Object.entries(TIER_CONFIG).map(([tier, conf]) => {
          const count    = tierCounts[tier] || 0;
          const barWidth = totalFound > 0 ? (count / totalFound) * 100 : 0;
          return (
            <div key={tier} style={{ marginBottom: '12px' }}>
              <div className="flex justify-between items-center" style={{ marginBottom: '4px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '0.8rem' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: conf.color, display: 'inline-block' }} />
                  <span style={{ color: conf.color, fontWeight: 700, fontSize: '0.72rem' }}>{conf.shortLabel}</span>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.78rem' }}>{conf.label}</span>
                </span>
                <span style={{ fontWeight: 600, fontSize: '0.82rem' }}>{count}</span>
              </div>
              <div style={{ height: '3px', borderRadius: '2px', background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                <div style={{
                  height: '100%', borderRadius: '2px', width: `${barWidth}%`,
                  background: conf.color, opacity: count > 0 ? 1 : 0.2,
                  transition: 'width 0.6s ease',
                }} />
              </div>
            </div>
          );
        })}

        <p style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', marginTop: '10px', lineHeight: 1.5 }}>
          Per ISO 27001:2022 Control 5.12 — Information Classification
        </p>
      </div>
    </div>
  );
}
