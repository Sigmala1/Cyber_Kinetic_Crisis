import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import StatCard from './components/StatCard';
import DeviceGrid from './components/DeviceGrid';
import { Target, ServerCrash, WifiOff } from 'lucide-react';

const MOCK_DEVICES = [
  { id: 'NET-GW-01', name: 'Core Gateway', type: 'Server', isOn: true, isOnline: true, hasPassword: true, condition: 'Needs Maintenance', cyberState: 'Normal', lastMaintainedDate: '2024-06-12', authorizedRoles: ['IT Admin'], activeUsers: 5, dependencies: [] },
  { id: 'HVAC-01', name: 'Main Air Handler', type: 'HVAC', isOn: true, isOnline: true, hasPassword: true, condition: 'Optimal', cyberState: 'Normal', lastMaintainedDate: '2026-01-15', authorizedRoles: ['Admin', 'Maintenance'], activeUsers: 1, dependencies: ['NET-GW-01', 'TEMP-SENS-12'] },
  { id: 'TEMP-SENS-12', name: 'Lobby Temperature', type: 'IoT Sensor', isOn: true, isOnline: false, hasPassword: false, condition: 'Degraded', cyberState: 'Warning', lastMaintainedDate: '2025-11-20', authorizedRoles: ['Admin'], activeUsers: 0, dependencies: ['NET-GW-01'] },
  { id: 'AC-DOOR-05', name: 'Server Room Lock', type: 'Access Control', isOn: true, isOnline: true, hasPassword: true, condition: 'Optimal', cyberState: 'Compromised', lastMaintainedDate: '2026-03-01', authorizedRoles: ['Admin', 'Security'], activeUsers: 2, dependencies: ['CAM-09', 'NET-GW-01'] },
  { id: 'CAM-09', name: 'Server Room Camera', type: 'Security Camera', isOn: true, isOnline: true, hasPassword: true, condition: 'Optimal', cyberState: 'Normal', lastMaintainedDate: '2026-02-14', authorizedRoles: ['Security'], activeUsers: 1, dependencies: ['NET-GW-01'] },
  { id: 'HVAC-02', name: 'Exhaust Fan C', type: 'HVAC', isOn: false, isOnline: false, hasPassword: false, condition: 'Optimal', cyberState: 'Normal', lastMaintainedDate: '2026-03-20', authorizedRoles: ['Maintenance'], activeUsers: 0, dependencies: ['HVAC-01'] },
  { id: 'ELEV-01', name: 'Main Elevator', type: 'Transport', isOn: true, isOnline: true, hasPassword: true, condition: 'Needs Maintenance', cyberState: 'Warning', lastMaintainedDate: '2025-08-30', authorizedRoles: ['Admin', 'Maintenance'], activeUsers: 0, dependencies: ['NET-GW-01'] },
];

function App() {
  const [devices, setDevices] = useState([]);
  const [isScanning, setIsScanning] = useState(false);

  const startScan = () => {
    setIsScanning(true);
    setDevices([]); // clear previous
    
    // Simulate discovering devices sequentially over network bounds
    MOCK_DEVICES.forEach((device, index) => {
      setTimeout(() => {
        setDevices(prev => [...prev, device]);
        if (index === MOCK_DEVICES.length - 1) {
          setIsScanning(false);
        }
      }, 800 * (index + 1));
    });
  };

  const totalDevices = devices.length;
  const activeThreats = devices.filter(d => d.cyberState === 'Compromised' || d.cyberState === 'Warning').length;
  const offlineDevices = devices.filter(d => !d.isOnline).length;

  return (
    <div className="flex w-full">
      <Sidebar isScanning={isScanning} onScan={startScan} totalFound={totalDevices} />
      
      <main style={{ flex: 1, padding: '32px', overflowY: 'auto', background: 'radial-gradient(circle at 50% 0%, #1a2234 0%, var(--bg-color) 40%)' }}>
        <header style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>Security Operations Overview</h1>
          <p className="text-muted" style={{ margin: 0 }}>Real-time telemetry and cyber-health metrics for connected infrastructure.</p>
        </header>

        <div className="flex gap-4" style={{ marginBottom: '32px' }}>
          <StatCard title="Total Connected" value={totalDevices} icon={<Target size={20} />} subtitle="Network Nodes Discovered" />
          <StatCard title="Active Threats" type={activeThreats > 0 ? 'danger' : 'success'} value={activeThreats} icon={<ServerCrash size={20} />} subtitle="Alerts Requiring Triage" />
          <StatCard title="Offline Modules" type="warning" value={offlineDevices} icon={<WifiOff size={20} />} subtitle="Awaiting Connection" />
        </div>

        <section>
          <div className="flex justify-between items-center" style={{ marginBottom: '20px' }}>
            <h2>Infrastructure Topology</h2>
          </div>
          <DeviceGrid devices={devices} />
        </section>
      </main>
    </div>
  );
}

export default App;
