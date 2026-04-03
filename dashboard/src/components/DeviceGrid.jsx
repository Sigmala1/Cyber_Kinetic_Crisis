import React, { useState } from 'react';
import {
  Power, PowerOff, Wifi, WifiOff, Lock, Unlock, Users,
  ShieldAlert, ShieldCheck, Activity, Wrench, Link2,
  MapPin, Cable, Globe, Layers, Ghost,
} from 'lucide-react';
import { TIER_CONFIG } from '../tiers';
import SecurityTierBadge from './SecurityTierBadge';
import ComponentList from './ComponentList';

const TIER_FILTERS = [
  { label: 'All Tiers',          value: null },
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

  const hasAny = filteredDevices.length > 0;

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

/* ─────────────────────────────────────────── */
/* Known Device Card                           */
/* ─────────────────────────────────────────── */
function DeviceCard({ device }) {
  const isDanger        = device.cyberState === 'Compromised';
  const isWarning       = device.cyberState === 'Warning';
  const tierConf        = TIER_CONFIG[device.securityTier] || TIER_CONFIG[4];
  const has2FAViolation = tierConf.requires2FA && !device.has2FA;
  const glowClass       = isDanger ? 'animate-alert' : '';

  return (
    <div
      className={`glass-panel flex-col ${glowClass}`}
      style={{
        padding: 0, overflow: 'hidden',
        borderColor: isDanger ? 'var(--danger)' : has2FAViolation ? 'rgba(248,81,73,0.5)' : tierConf.border,
      }}
    >
      <div style={{ height: '4px', width: '100%', background: tierConf.color, flexShrink: 0 }} />

      {has2FAViolation && (
        <div style={{
          background: 'rgba(248,81,73,0.1)', borderBottom: '1px solid rgba(248,81,73,0.28)',
          padding: '6px 20px', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.3px',
          color: '#ff7b72', display: 'flex', alignItems: 'center', gap: '6px',
        }}>
          ⚠ ISO 27001 § 8.5 — 2FA NOT CONFIGURED · Required for {tierConf.label} ({tierConf.shortLabel}) devices
        </div>
      )}

      <div style={{ padding: '20px' }}>
        <div className="flex justify-between items-center" style={{ marginBottom: '10px' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 style={{ margin: 0, fontSize: '1.15rem', color: isDanger ? 'var(--danger)' : 'var(--text-primary)' }}>
              {device.name}
            </h3>
            <span className="text-muted flex items-center gap-2" style={{ fontSize: '0.78rem', textTransform: 'uppercase', marginTop: '2px' }}>
              <span>{device.type} · {device.id}</span>
              <span className="flex items-center gap-1" style={{ borderLeft: '1px solid var(--glass-border)', paddingLeft: '8px' }}>
                <Globe size={11} /> {device.ipAddress}
              </span>
            </span>
            <span className="text-muted flex items-center gap-1" style={{ fontSize: '0.73rem', marginTop: '3px' }}>
              <MapPin size={11} /> {device.location.building}, {device.location.room} · {device.location.city}, {device.location.state}
            </span>
          </div>
          {isDanger
            ? <ShieldAlert size={22} style={{ color: 'var(--danger)', flexShrink: 0 }} />
            : <ShieldCheck size={22} style={{ color: '#3fb950',       flexShrink: 0 }} />
          }
        </div>

        <div style={{ marginBottom: '16px' }}>
          <SecurityTierBadge tier={device.securityTier} has2FA={device.has2FA} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
          <StatusBadge icon={device.isOn ? <Power size={13}/> : <PowerOff size={13}/>}
                       label={device.isOn ? 'Power: On' : 'Power: Off'} type={device.isOn ? 'success' : 'neutral'} />
          <StatusBadge icon={device.isOnline ? <Wifi size={13}/> : <WifiOff size={13}/>}
                       label={device.isOnline ? 'Online' : 'Offline'} type={device.isOnline ? 'success' : 'danger'} />
          <StatusBadge icon={device.hasPassword ? <Lock size={13}/> : <Unlock size={13}/>}
                       label={device.hasPassword ? 'Secured' : 'Open Access'} type={device.hasPassword ? 'success' : 'warning'} />
          <StatusBadge icon={<Activity size={13}/>} label={device.condition}
                       type={device.condition === 'Optimal' ? 'success' : device.condition === 'Degraded' ? 'warning' : 'danger'} />
        </div>

        <div className="flex-col gap-2" style={{ fontSize: '0.83rem', padding: '12px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
          <div className="flex justify-between">
            <span className="text-muted flex items-center gap-2"><Layers size={13} /> System Class:</span>
            <span style={{ fontWeight: 500, color: 'var(--primary)' }}>{device.systemCategory}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted flex items-center gap-2"><Wrench size={13} /> Last Maintained:</span>
            <span>{device.lastMaintainedDate}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted flex items-center gap-2"><Users size={13} /> Allowed Roles:</span>
            <span>{device.authorizedRoles.join(', ')}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted flex items-center gap-2"><Users size={13} /> Active Users:</span>
            <span style={{ fontWeight: 600, color: device.activeUsers > 0 ? 'var(--primary)' : 'var(--text-primary)' }}>
              {device.activeUsers}
            </span>
          </div>
          <div className="flex flex-col" style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid var(--glass-border)' }}>
            <span className="text-muted flex items-center gap-2" style={{ marginBottom: '6px' }}><Link2 size={13} /> Dependencies:</span>
            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
              {device.dependencies.length
                ? device.dependencies.map(dep => <span key={dep} className="badge neutral" style={{ fontSize: '0.68rem' }}>{dep}</span>)
                : <span className="text-muted">None</span>}
            </div>
          </div>
          <div className="flex flex-col" style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid var(--glass-border)' }}>
            <span className="text-muted flex items-center gap-2" style={{ marginBottom: '6px' }}><Cable size={13} /> Open Ports:</span>
            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
              {device.openPorts?.length
                ? device.openPorts.map(port => <span key={port} className="badge warning" style={{ fontSize: '0.68rem' }}>{port}</span>)
                : <span className="text-muted">None</span>}
            </div>
          </div>
        </div>

        <ComponentList components={device.components} />
      </div>
    </div>
  );
}


function StatusBadge({ icon, label, type }) {
  return (
    <div className={`badge ${type}`} style={{ justifyContent: 'center', padding: '6px 8px' }}>
      {icon} {label}
    </div>
  );
}
