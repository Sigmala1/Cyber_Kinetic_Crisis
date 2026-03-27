import React from 'react';
import { Shield, Activity, HardDrive, Wifi, Server, Search, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function Sidebar({ isScanning, onScan, totalFound }) {
  return (
    <div style={{ width: '280px', padding: '24px', borderRight: '1px solid var(--glass-border)' }} className="glass-panel flex-col gap-4">
      <div className="flex items-center gap-2" style={{ marginBottom: '24px' }}>
        <Shield size={32} className="text-primary" />
        <div>
          <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Cyber-Kinetic</h2>
          <span className="text-muted" style={{ fontSize: '0.875rem' }}>Facility Monitor</span>
        </div>
      </div>

      <button className={`w-full justify-center ${isScanning ? 'primary animate-pulse' : 'primary'}`} onClick={onScan} disabled={isScanning}>
        <Search size={18} />
        {isScanning ? 'Scanning Network...' : 'Scan Network'}
      </button>

      <div style={{ marginTop: '32px' }}>
        <h4 className="text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px' }}>Network Status</h4>
        <div className="flex justify-between items-center" style={{ marginBottom: '12px' }}>
          <span className="flex items-center gap-2"><Wifi size={16} className="text-success" /> Connection</span>
          <span className="text-success">Secure</span>
        </div>
        <div className="flex justify-between items-center" style={{ marginBottom: '12px' }}>
          <span className="flex items-center gap-2"><HardDrive size={16} className="text-primary" /> Discovered</span>
          <span style={{ fontWeight: 600 }}>{totalFound} Nodes</span>
        </div>
      </div>
    </div>
  );
}
