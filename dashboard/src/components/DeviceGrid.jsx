import React, { useState } from 'react';
import {
  Power, PowerOff, Wifi, WifiOff, Lock, Unlock, Users,
  ShieldAlert, ShieldCheck, Activity, Wrench, Link2, CheckCircle2, XCircle,
  MapPin, Cable, Globe, Layers, Ghost, AlertCircle, Search
} from 'lucide-react';
import { TIER_CONFIG } from '../tiers';
import SecurityTierBadge from './SecurityTierBadge';
import ComponentList from './ComponentList';

const TIER_FILTERS = [
  { label: 'All Tiers',          value: null },
  { label: 'T0 · Critical',      value: 0    },
  { label: 'T1 · Restricted',    value: 1    },
  { label: 'T2 · Confidential',  value: 2    },
  { label: 'T3 · Internal',      value: 3    },
  { label: 'T4 · Public',        value: 4    },
];

export default function DeviceGrid({ devices }) {
  const [selectedTiers, setSelectedTiers] = useState([]);

  const toggleTier = (tier) => {
    if (tier === null) { setSelectedTiers([]); return; }
    setSelectedTiers(prev =>
      prev.includes(tier) ? prev.filter(t => t !== tier) : [...prev, tier]
    );
  };

  const filteredDevices = selectedTiers.length === 0
    ? devices
    : devices.filter(d => selectedTiers.includes(d.securityTier));

  if (devices.length === 0) return (
    <div className="flex justify-center items-center" style={{ height: '200px', color: 'var(--text-secondary)' }}>
      No devices discovered. Initiating scan…
    </div>
  );

  return (
    <div>
      {/* ── Tier Filter Bar ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
          Filter:
        </span>
        {TIER_FILTERS.map(f => {
          const conf        = f.value != null ? TIER_CONFIG[f.value] : null;
          const isAllActive = f.value === null && selectedTiers.length === 0;
          const isTierActive = f.value != null && selectedTiers.includes(f.value);
          const isActive    = isAllActive || isTierActive;

          return (
            <button
              key={f.label}
              id={`tier-filter-${f.value ?? 'all'}`}
              onClick={() => toggleTier(f.value)}
              className="tier-filter-btn"
              style={{
                background:  isActive ? (conf ? conf.bg    : 'rgba(88,166,255,0.12)') : 'rgba(255,255,255,0.04)',
                borderColor: isActive ? (conf ? conf.border : 'rgba(88,166,255,0.4)') : 'var(--glass-border)',
                color:       isActive ? (conf ? conf.color  : 'var(--primary)')        : 'var(--text-secondary)',
                fontWeight:  isActive ? 700 : 500,
              }}
            >
              {conf && <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: conf.color, display: 'inline-block', flexShrink: 0 }} />}
              {f.label}
            </button>
          );
        })}

        {selectedTiers.length > 0 && (
          <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginLeft: '4px' }}>
            — {filteredDevices.length} of {devices.length} devices
          </span>
        )}
      </div>

      {/* ── Known Device Grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(370px, 1fr))', gap: '20px' }}>
        {filteredDevices.map(dev => <DeviceCard key={dev.id} device={dev} />)}
      </div>
    </div>
  );
}

function DeviceCard({ device }) {
  const unmetObligations = device.obligations.filter(o => o.status === 'unmet');
  const criticalUnmet    = unmetObligations.filter(o => o.criticality === 'high');
  
  const isCompliant      = unmetObligations.length === 0;
  const isCriticallyNonCompliant = criticalUnmet.length > 0;
  
  const statusColor = isCriticallyNonCompliant ? 'var(--danger)' : isCompliant ? '#3fb950' : '#ffab70';
  const statusBg = isCriticallyNonCompliant ? 'rgba(248,81,73,0.1)' : isCompliant ? 'rgba(63,185,80,0.1)' : 'rgba(255,171,112,0.1)';

  return (
    <div
      className={`glass-panel flex-col ${isCriticallyNonCompliant ? 'animate-alert' : ''}`}
      style={{
        padding: 0, overflow: 'hidden',
        borderColor: isCriticallyNonCompliant ? 'var(--danger)' : isCompliant ? 'var(--glass-border)' : 'rgba(255,171,112,0.5)',
      }}
    >
      <div style={{ height: '4px', width: '100%', background: statusColor, flexShrink: 0 }} />

      <div style={{
        background: statusBg, borderBottom: '1px solid var(--glass-border)',
        padding: '10px 20px', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.5px',
        color: statusColor, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div className="flex items-center gap-2">
          {isCompliant ? <ShieldCheck size={14} /> : <AlertCircle size={14} />}
          {isCompliant ? 'COMPLIANCE FIDELITY: SECURED' : `OBLIGATION BREACH: ${unmetObligations.length} UNMET DUTIES`}
        </div>
        <div style={{ opacity: 0.8, fontSize: '0.65rem' }}>
          ISO 27001 § {device.securityTier === 0 ? 'ANX A.5' : '8.5'}
        </div>
      </div>

      <div style={{ padding: '20px' }}>
        <div className="flex justify-between items-start" style={{ marginBottom: '16px' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="flex items-center gap-3">
              <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-primary)' }}>{device.name}</h3>
              <span className={`badge ${device.cyberState === 'Compromised' ? 'danger' : device.cyberState === 'Warning' ? 'warning' : 'neutral'}`} 
                    style={{ fontSize: '0.65rem', padding: '2px 8px', borderRadius: '4px' }}>
                {device.cyberState} Telemetry
              </span>
            </div>
            <span className="text-muted flex items-center gap-2" style={{ fontSize: '0.78rem', textTransform: 'uppercase', marginTop: '4px' }}>
              <span>{device.type} · {device.id}</span>
              <span className="flex items-center gap-1" style={{ borderLeft: '1px solid var(--glass-border)', paddingLeft: '8px' }}>
                <Globe size={11} /> {device.ipAddress}
              </span>
            </span>
          </div>
          <div className="flex flex-col items-end gap-1">
             <SecurityTierBadge tier={device.securityTier} has2FA={device.has2FA} />
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h4 className="text-muted" style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Search size={12} /> Strategic Obligation Checklist
          </h4>
          <div className="flex-col gap-2" style={{ background: 'rgba(0,0,0,0.25)', padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
            {device.obligations.map(ob => (
              <div key={ob.id} className="flex justify-between items-center" style={{ fontSize: '0.82rem' }}>
                <div className="flex items-center gap-3">
                  {ob.status === 'met' 
                    ? <CheckCircle2 size={15} style={{ color: '#3fb950' }} /> 
                    : <XCircle size={15} style={{ color: ob.criticality === 'high' ? 'var(--danger)' : '#ffab70' }} />
                  }
                  <div className="flex-col">
                    <span style={{ fontWeight: 500, color: ob.status === 'met' ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{ob.label}</span>
                    <span style={{ fontSize: '0.68rem', opacity: 0.6 }} className="text-muted">{ob.description}</span>
                  </div>
                </div>
                <span className={`badge ${ob.status === 'met' ? 'success' : ob.criticality === 'high' ? 'danger' : 'warning'}`} 
                      style={{ fontSize: '0.6rem', padding: '1px 6px', opacity: ob.status === 'met' ? 0.7 : 1 }}>
                  {ob.status.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 text-muted" style={{ fontSize: '0.73rem', marginBottom: '16px', padding: '8px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px' }}>
           <MapPin size={13} /> <span>{device.location.building}, {device.location.room} · {device.location.city}, {device.location.state}</span>
        </div>

        <ComponentList components={device.components} />
      </div>
    </div>
  );
}
