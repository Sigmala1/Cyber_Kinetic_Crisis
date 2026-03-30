import React from 'react';
import { Power, PowerOff, Wifi, WifiOff, Lock, Unlock, Users, ShieldAlert, ShieldCheck, Activity, Wrench, Link2, MapPin, Cable, Globe } from 'lucide-react';

export default function DeviceGrid({ devices }) {
  if (devices.length === 0) return (
    <div className="flex justify-center items-center" style={{ height: '200px', color: 'var(--text-secondary)' }}>
      No devices discovered. Initiating scan...
    </div>
  );

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
      {devices.map(dev => (
        <DeviceCard key={dev.id} device={dev} />
      ))}
    </div>
  );
}

function DeviceCard({ device }) {
  const isDanger = device.cyberState === 'Compromised';
  const isWarning = device.cyberState === 'Warning';
  
  let borderColor = 'var(--glass-border)';
  let glowClass = '';
  if (isDanger) {
    borderColor = 'var(--danger)';
    glowClass = 'animate-alert';
  } else if (isWarning) {
    borderColor = 'var(--warning)';
  }

  return (
    <div className={`glass-panel flex-col ${glowClass}`} style={{ padding: '20px', borderColor }}>
      <div className="flex justify-between items-center" style={{ marginBottom: '16px' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.2rem', color: isDanger ? 'var(--danger)' : 'var(--text-primary)' }}>{device.name}</h3>
          <span className="text-muted flex items-center gap-2" style={{ fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '4px' }}>
            <span>{device.type} | ID: {device.id}</span>
            <span className="flex items-center gap-1" style={{ borderLeft: '1px solid var(--glass-border)', paddingLeft: '8px' }}><Globe size={12}/> {device.ipAddress}</span>
          </span>
          <span className="text-muted flex items-center gap-1" style={{ fontSize: '0.75rem' }}><MapPin size={12}/> {device.location.building}, {device.location.room} ({device.location.city}, {device.location.state}, {device.location.country})</span>
        </div>
        {isDanger ? <ShieldAlert size={24} className="text-danger" /> : <ShieldCheck size={24} className="text-success" />}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
        <StatusBadge icon={device.isOn ? <Power size={14}/> : <PowerOff size={14}/>} 
                     label={device.isOn ? 'Power: On' : 'Power: Off'} 
                     type={device.isOn ? 'success' : 'neutral'} />
        <StatusBadge icon={device.isOnline ? <Wifi size={14}/> : <WifiOff size={14}/>} 
                     label={device.isOnline ? 'Online' : 'Offline'} 
                     type={device.isOnline ? 'success' : 'danger'} />
        <StatusBadge icon={device.hasPassword ? <Lock size={14}/> : <Unlock size={14}/>} 
                     label={device.hasPassword ? 'Secured' : 'Open Access'} 
                     type={device.hasPassword ? 'success' : 'warning'} />
        <StatusBadge icon={<Activity size={14}/>} 
                     label={device.condition} 
                     type={device.condition === 'Optimal' ? 'success' : device.condition === 'Degraded' ? 'warning' : 'danger'} />
      </div>

      <div className="flex-col gap-2" style={{ fontSize: '0.85rem', padding: '12px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
        <div className="flex justify-between">
          <span className="text-muted flex items-center gap-2"><Wrench size={14} /> Last Maintained:</span>
          <span>{device.lastMaintainedDate}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted flex items-center gap-2"><Users size={14} /> Allowed Roles:</span>
          <span>{device.authorizedRoles.join(', ')}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted flex items-center gap-2"><Users size={14} /> Active Users:</span>
          <span style={{ fontWeight: 600, color: device.activeUsers > 0 ? 'var(--primary)' : 'var(--text-primary)' }}>{device.activeUsers}</span>
        </div>
        <div className="flex flex-col mt-2 pt-2" style={{ borderTop: '1px solid var(--glass-border)' }}>
          <span className="text-muted flex items-center gap-2 mb-1"><Link2 size={14} /> Dependencies:</span>
          <div className="flex" style={{ gap: '4px', flexWrap: 'wrap' }}>
            {device.dependencies.length ? device.dependencies.map(dep => (
              <span key={dep} className="badge neutral" style={{ fontSize: '0.7rem' }}>{dep}</span>
            )) : <span className="text-muted">None</span>}
          </div>
        </div>
        <div className="flex flex-col mt-2 pt-2" style={{ borderTop: '1px solid var(--glass-border)' }}>
          <span className="text-muted flex items-center gap-2 mb-1"><Cable size={14} /> Open Ports:</span>
          <div className="flex" style={{ gap: '4px', flexWrap: 'wrap' }}>
            {device.openPorts && device.openPorts.length ? device.openPorts.map(port => (
              <span key={port} className="badge warning" style={{ fontSize: '0.7rem' }}>{port}</span>
            )) : <span className="text-muted">None</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ icon, label, type }) {
  return (
    <div className={`badge ${type}`} style={{ justifyContent: 'center', padding: '6px' }}>
      {icon} {label}
    </div>
  );
}
