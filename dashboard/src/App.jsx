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
  const [apiMetadata,      setApiMetadata]       = useState(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

  /* ─── API Integration ─── */
  const fetchLiveAudit = async () => {
    try {
      const response = await fetch(`${API_URL}/api/devices`);
      const result = await response.json();
      if (result.status === 'success') {
        setApiMetadata(result.data);
        console.log('Live Audit Data Received:', result.data);
      }
    } catch (err) {
      console.warn('Backend API unreachable. Falling back to simulated scan.', err);
    }
  };


  /* ─── Obligation Engine ─── */
  const generateObligations = (node, isComponent = false) => {
    const obligations = [];
    
    // 1. Condition Obligation (Devices & Components)
    obligations.push({
      id: 'condition',
      label: 'Optimal Health',
      description: 'Physical and operational condition must be "Optimal"',
      status: node.condition === 'Optimal' ? 'met' : 'unmet',
      criticality: 'medium'
    });

    // 2. Cyber State Obligation (Devices & Components)
    obligations.push({
      id: 'cyber-state',
      label: 'Secure State',
      description: 'Cyber telemetry must report "Normal" state',
      status: node.cyberState === 'Normal' ? 'met' : 'unmet',
      criticality: 'high'
    });

    if (!isComponent) {
      // 3. 2FA Obligation (Devices only, Tiers 0, 1, 2)
      if ([0, 1, 2].includes(node.securityTier)) {
        obligations.push({
          id: 'auth-2fa',
          label: 'MFA Enforcement',
          description: 'Tier 0-2 assets require Multi-Factor Authentication',
          status: node.has2FA ? 'met' : 'unmet',
          criticality: 'high'
        });
      }

      // 4. Connectivity Obligation (Devices only)
      obligations.push({
        id: 'connectivity',
        label: 'Network Presence',
        description: 'Asset must maintain priority connection',
        status: node.isOnline ? 'met' : 'unmet',
        criticality: 'medium'
      });

      // 5. Power Obligation (Devices only)
      obligations.push({
        id: 'power',
        label: 'Power Stability',
        description: 'Asset must be powered on and stable',
        status: node.isOn ? 'met' : 'unmet',
        criticality: 'low'
      });
    }

    return obligations;
  };

  /* Normal network scan — enriched with obligations */
  const startScan = () => {
    setIsScanning(true);
    setDevices([]);
    fetchLiveAudit(); // Trigger real-time backend check
    MOCK_DEVICES.forEach((device, index) => {
      setTimeout(() => {
        const enrichedDevice = {
          ...device,
          obligations: generateObligations(device),
          components: device.components.map(c => ({
            ...c,
            obligations: generateObligations(c, true)
          }))
        };
        setDevices(prev => [...prev, enrichedDevice]);
        if (index === MOCK_DEVICES.length - 1) setIsScanning(false);
      }, 800 * (index + 1));
    });
  };


  /* ── Derived compliance stats ── */
  const totalNodes        = devices.length;
  const allObligations    = devices.flatMap(d => [
    ...d.obligations,
    ...d.components.flatMap(c => c.obligations)
  ]);
  const totalObligations  = allObligations.length;
  const metObligations    = allObligations.filter(o => o.status === 'met').length;
  const fulfillmentRate   = totalObligations > 0 ? Math.round((metObligations / totalObligations) * 100) : 0;
  
  const criticalFailures  = allObligations.filter(o => o.status === 'unmet' && o.criticality === 'high').length;
  const warningFailures   = allObligations.filter(o => o.status === 'unmet' && o.criticality === 'medium').length;

  const fulfillmentType   = fulfillmentRate > 90 ? 'success' : fulfillmentRate > 70 ? 'warning' : 'danger';

  return (
    <div className="flex w-full">
      <Sidebar
        isScanning={isScanning}
        onScan={startScan}
        totalFound={totalNodes}
        devices={devices}
      />

      <main style={{
        flex: 1, padding: '32px', overflowY: 'auto',
        background: 'radial-gradient(circle at 50% 0%, #1a2234 0%, var(--bg-color) 40%)',
      }}>
        <header style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>Strategic Obligation Audit</h1>
            <p className="text-muted" style={{ margin: 0 }}>
              Real-time fulfillment tracking of ISO 27001-aligned obligations and duty of care requirements.
            </p>
          </div>
          {apiMetadata && (
            <div style={{ fontSize: '0.7rem', padding: '10px', background: 'rgba(63,185,80,0.1)', border: '1px solid rgba(63,185,80,0.3)', borderRadius: '8px', color: '#3fb950' }}>
               <div style={{ fontWeight: 700, textTransform: 'uppercase' }}>Live Deployment Linked</div>
               <div>ID: {apiMetadata.uid || 'wrk-ufgxkm54avvi'}</div>
               <div>Status: Running</div>
            </div>
          )}
        </header>

        {/* ── Row 1: Compliance stats ── */}
        <div className="flex gap-4" style={{ marginBottom: '16px' }}>
          <StatCard title="Scope of Obligation" value={totalNodes} icon={<Target size={20} />} subtitle="Tracked Infrastructure Nodes" />
          <StatCard title="Fulfillment Rate" value={`${fulfillmentRate}%`} icon={<ShieldOff size={20} />} subtitle="Overall Duty Fulfillment"
            type={fulfillmentType} />
          <StatCard title="Critical Failures" value={criticalFailures} icon={<AlertOctagon size={20} />} subtitle="High-Risk Unmet Obligations"
            type={criticalFailures > 0 ? 'danger' : 'success'} />
        </div>

        {/* ── Row 2: Secondary stats ── */}
        <div className="flex gap-4" style={{ marginBottom: '32px' }}>
          <StatCard
            title="Total Duties"
            value={totalObligations}
            icon={<LayoutGrid size={20} />}
            subtitle="Combined Device & Component Obligations"
          />
          <StatCard
            title="Operational Gaps"
            value={warningFailures}
            icon={<Ghost size={20} />}
            subtitle="Medium-Risk Compliance Deviations"
            type={warningFailures > 0 ? 'warning' : 'success'}
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
