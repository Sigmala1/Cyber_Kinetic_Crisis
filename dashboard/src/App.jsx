import React, { useState, useRef } from 'react';
import Sidebar from './components/Sidebar';
import StatCard from './components/StatCard';
import DeviceGrid from './components/DeviceGrid';
import TopologyView from './components/TopologyView';
import { Target, ServerCrash, WifiOff, ShieldOff, AlertOctagon, Ghost, LayoutGrid, Network } from 'lucide-react';
import { TIER_CONFIG } from './tiers';

/* ─── Known device inventory ───────────────────────────────── */
const MOCK_DEVICES = [
  {
    id: 'NET-GW-01', name: 'Core Gateway', type: 'Server',
    securityTier: 1, has2FA: true,
    isOn: true, isOnline: true, hasPassword: true, condition: 'Needs Maintenance',
    cyberState: 'Normal', lastMaintainedDate: '2024-06-12',
    authorizedRoles: ['IT Admin'], activeUsers: 5, dependencies: [],
    location: { city: 'Seattle', state: 'WA', country: 'USA', building: 'HQ', room: 'Server Room 1' },
    openPorts: [80, 443, 22, 53], ipAddress: '10.0.0.1/16', systemCategory: 'Electrical',
    components: [
      { name: 'Primary NIC',         securityTier: 1, has2FA: true,  cyberState: 'Normal'  },
      { name: 'Firmware v3.2',        securityTier: 2, has2FA: true,  cyberState: 'Normal'  },
      { name: 'Management Interface', securityTier: 1, has2FA: false, cyberState: 'Warning' },
    ],
  },
  {
    id: 'HVAC-01', name: 'Main Air Handler', type: 'HVAC',
    securityTier: 2, has2FA: true,
    isOn: true, isOnline: true, hasPassword: true, condition: 'Optimal',
    cyberState: 'Normal', lastMaintainedDate: '2026-01-15',
    authorizedRoles: ['Admin', 'Maintenance'], activeUsers: 1, dependencies: ['NET-GW-01', 'TEMP-SENS-12'],
    location: { city: 'Seattle', state: 'WA', country: 'USA', building: 'HQ', room: 'Roof Deck' },
    openPorts: [502, 8080], ipAddress: '10.0.1.15/16', systemCategory: 'Mechanical',
    components: [
      { name: 'Main Controller Board',    securityTier: 2, has2FA: true,  cyberState: 'Normal' },
      { name: 'Temperature Sensor Array', securityTier: 3, has2FA: false, cyberState: 'Normal' },
      { name: 'Network Module',           securityTier: 2, has2FA: false, cyberState: 'Normal' },
    ],
  },
  {
    id: 'TEMP-SENS-12', name: 'Lobby Temperature', type: 'IoT Sensor',
    securityTier: 3, has2FA: false,
    isOn: true, isOnline: false, hasPassword: false, condition: 'Degraded',
    cyberState: 'Warning', lastMaintainedDate: '2025-11-20',
    authorizedRoles: ['Admin'], activeUsers: 0, dependencies: ['NET-GW-01'],
    location: { city: 'Seattle', state: 'WA', country: 'USA', building: 'HQ', room: 'Main Lobby' },
    openPorts: [], ipAddress: '10.0.2.112/16', systemCategory: 'Electrical',
    components: [
      { name: 'Sensor Core',  securityTier: 3, has2FA: false, cyberState: 'Warning' },
      { name: 'Radio Module', securityTier: 4, has2FA: false, cyberState: 'Normal'  },
    ],
  },
  {
    id: 'AC-DOOR-05', name: 'Server Room Lock', type: 'Access Control',
    securityTier: 2, has2FA: false,
    isOn: true, isOnline: true, hasPassword: true, condition: 'Optimal',
    cyberState: 'Compromised', lastMaintainedDate: '2026-03-01',
    authorizedRoles: ['Admin', 'Security'], activeUsers: 2, dependencies: ['CAM-09', 'NET-GW-01'],
    location: { city: 'Seattle', state: 'WA', country: 'USA', building: 'HQ', room: 'Server Room 1 Door' },
    openPorts: [443, 1883], ipAddress: '10.0.3.50/16', systemCategory: 'Electrical',
    components: [
      { name: 'Lock Mechanism', securityTier: 2, has2FA: false, cyberState: 'Compromised' },
      { name: 'RFID Reader',    securityTier: 2, has2FA: false, cyberState: 'Compromised' },
      { name: 'Camera Module',  securityTier: 3, has2FA: false, cyberState: 'Normal'      },
    ],
  },
  {
    id: 'CAM-09', name: 'Server Room Camera', type: 'Security Camera',
    securityTier: 3, has2FA: false,
    isOn: true, isOnline: true, hasPassword: true, condition: 'Optimal',
    cyberState: 'Normal', lastMaintainedDate: '2026-02-14',
    authorizedRoles: ['Security'], activeUsers: 1, dependencies: ['NET-GW-01'],
    location: { city: 'Seattle', state: 'WA', country: 'USA', building: 'HQ', room: 'Server Room 1' },
    openPorts: [554, 80], ipAddress: '10.0.4.155/16', systemCategory: 'Electrical',
    components: [
      { name: 'Image Processor',   securityTier: 3, has2FA: false, cyberState: 'Normal' },
      { name: 'Infrared Array',    securityTier: 4, has2FA: false, cyberState: 'Normal' },
      { name: 'Network Interface', securityTier: 3, has2FA: false, cyberState: 'Normal' },
    ],
  },
  {
    id: 'HVAC-02', name: 'Exhaust Fan C', type: 'HVAC',
    securityTier: 4, has2FA: false,
    isOn: false, isOnline: false, hasPassword: false, condition: 'Optimal',
    cyberState: 'Normal', lastMaintainedDate: '2026-03-20',
    authorizedRoles: ['Maintenance'], activeUsers: 0, dependencies: ['HVAC-01'],
    location: { city: 'Seattle', state: 'WA', country: 'USA', building: 'HQ', room: 'Utility Shaft 3' },
    openPorts: [502], ipAddress: '10.0.1.16/16', systemCategory: 'Mechanical',
    components: [
      { name: 'Fan Motor Controller', securityTier: 4, has2FA: false, cyberState: 'Normal' },
      { name: 'Power Supply Unit',    securityTier: 4, has2FA: false, cyberState: 'Normal' },
    ],
  },
  {
    id: 'ELEV-01', name: 'Main Elevator', type: 'Transport',
    securityTier: 2, has2FA: false,
    isOn: true, isOnline: true, hasPassword: true, condition: 'Needs Maintenance',
    cyberState: 'Warning', lastMaintainedDate: '2025-08-30',
    authorizedRoles: ['Admin', 'Maintenance'], activeUsers: 0, dependencies: ['NET-GW-01'],
    location: { city: 'Seattle', state: 'WA', country: 'USA', building: 'HQ', room: 'Core Shaft' },
    openPorts: [10001], ipAddress: '10.0.5.10/16', systemCategory: 'Mechanical',
    components: [
      { name: 'Main Control Unit', securityTier: 1, has2FA: false, cyberState: 'Warning' },
      { name: 'Door Sensor Array', securityTier: 3, has2FA: false, cyberState: 'Normal'  },
      { name: 'Emergency Comms',   securityTier: 2, has2FA: false, cyberState: 'Normal'  },
    ],
  },
  {
    id: 'PUMP-01', name: 'Chilled Water Pump', type: 'Plumbing',
    securityTier: 3, has2FA: false,
    isOn: true, isOnline: true, hasPassword: true, condition: 'Optimal',
    cyberState: 'Normal', lastMaintainedDate: '2025-10-12',
    authorizedRoles: ['Maintenance'], activeUsers: 0, dependencies: ['HVAC-01', 'NET-GW-01'],
    location: { city: 'Seattle', state: 'WA', country: 'USA', building: 'HQ', room: 'Basement Utility' },
    openPorts: [502], ipAddress: '10.0.6.5/16', systemCategory: 'Plumbing',
    components: [
      { name: 'Pump Controller', securityTier: 3, has2FA: false, cyberState: 'Normal' },
      { name: 'Flow Sensor',     securityTier: 4, has2FA: false, cyberState: 'Normal' },
      { name: 'Network Module',  securityTier: 3, has2FA: false, cyberState: 'Normal' },
    ],
  },
];


/* ─── App ───────────────────────────────────────────────────── */
function App() {
  const [devices,          setDevices]          = useState([]);
  const [isScanning,       setIsScanning]        = useState(false);
  const [viewMode,         setViewMode]           = useState('grid'); // 'grid' | 'topology'

  /* Normal network scan */
  const startScan = () => {
    setIsScanning(true);
    setDevices([]);
    MOCK_DEVICES.forEach((device, index) => {
      setTimeout(() => {
        setDevices(prev => [...prev, device]);
        if (index === MOCK_DEVICES.length - 1) setIsScanning(false);
      }, 800 * (index + 1));
    });
  };


  /* ── Derived stats ── */
  const totalDevices    = devices.length;
  const activeThreats   = devices.filter(d => d.cyberState === 'Compromised' || d.cyberState === 'Warning').length;
  const offlineDevices  = devices.filter(d => !d.isOnline).length;
  const twoFAViolations = devices.filter(d => TIER_CONFIG[d.securityTier]?.requires2FA && !d.has2FA).length;

  const threateningDevices = devices.filter(d => d.cyberState === 'Compromised' || d.cyberState === 'Warning');
  const highestRiskTier    = threateningDevices.length > 0
    ? Math.min(...threateningDevices.map(d => d.securityTier))
    : null;
  const riskTierLabel    = highestRiskTier != null ? TIER_CONFIG[highestRiskTier].shortLabel : '—';
  const riskTierSubtitle = highestRiskTier != null
    ? `${TIER_CONFIG[highestRiskTier].label} — Active Threat Detected`
    : 'No active threats detected';

  return (
    <div className="flex w-full">
      <Sidebar
        isScanning={isScanning}
        onScan={startScan}
        totalFound={totalDevices}
        devices={devices}
      />

      <main style={{
        flex: 1, padding: '32px', overflowY: 'auto',
        background: 'radial-gradient(circle at 50% 0%, #1a2234 0%, var(--bg-color) 40%)',
      }}>
        <header style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>Security Operations Overview</h1>
          <p className="text-muted" style={{ margin: 0 }}>
            Real-time telemetry and ISO 27001-aligned cyber-health metrics for connected infrastructure.
          </p>
        </header>

        {/* ── Row 1: Operational stats ── */}
        <div className="flex gap-4" style={{ marginBottom: '16px' }}>
          <StatCard title="Total Connected" value={totalDevices}  icon={<Target size={20} />}      subtitle="Network Nodes Discovered" />
          <StatCard title="Active Threats"  value={activeThreats} icon={<ServerCrash size={20} />} subtitle="Alerts Requiring Triage"
            type={activeThreats > 0 ? 'danger' : 'success'} />
          <StatCard title="Offline Modules" value={offlineDevices} icon={<WifiOff size={20} />}    subtitle="Awaiting Connection"
            type={offlineDevices > 0 ? 'warning' : 'success'} />
        </div>

        {/* ── Row 2: ISO 27001 + shadow stats ── */}
        <div className="flex gap-4" style={{ marginBottom: '32px' }}>
          <StatCard
            title="2FA Violations"
            value={twoFAViolations}
            icon={<ShieldOff size={20} />}
            subtitle="ISO 27001 § 8.5 — Tiers 1 & 2 Non-Compliant"
            type={twoFAViolations > 0 ? 'danger' : 'success'}
          />
          <StatCard
            title="Highest Risk Tier"
            value={riskTierLabel}
            icon={<AlertOctagon size={20} />}
            subtitle={riskTierSubtitle}
            type={highestRiskTier === 1 ? 'danger' : highestRiskTier === 2 ? 'warning' : 'success'}
          />
        </div>

        {/* ── Infrastructure Section ── */}
        <section>
          <div className="flex justify-between items-center" style={{ marginBottom: '20px' }}>
            <h2 style={{ margin: 0 }}>Infrastructure Topology</h2>

            {/* View toggle */}
            <div style={{ display: 'flex', gap: '4px', background: 'rgba(255,255,255,0.04)', borderRadius: '10px', padding: '3px' }}>
              <button
                id="view-grid-btn"
                className={`view-toggle-btn ${viewMode === 'grid'     ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
              >
                <LayoutGrid size={14} /> Grid
              </button>
              <button
                id="view-topology-btn"
                className={`view-toggle-btn ${viewMode === 'topology' ? 'active' : ''}`}
                onClick={() => setViewMode('topology')}
              >
                <Network size={14} /> Topology
              </button>
            </div>
          </div>

          {viewMode === 'grid'
            ? <DeviceGrid devices={devices} />
            : <TopologyView devices={devices} />
          }
        </section>
      </main>
    </div>
  );
}

export default App;
