import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HashRain } from './components/HashRain';
import { Sidebar, TabType } from './components/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { OrchestratorPage } from './pages/OrchestratorPage';
import { RedTeamPage } from './pages/RedTeamPage';
import { BlueTeamPage } from './pages/BlueTeamPage';
import { AuditLogsPage } from './pages/AuditLogsPage';
import { ZeroTrustPoliciesPage } from './pages/ZeroTrustPoliciesPage';
import { SideChannelPage } from './pages/SideChannelPage';
import { UserRole, Evaluation, SystemTelemetry } from './types';
import { api } from './services/api';

export function App() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [currentRole, setCurrentRole] = useState<UserRole>('admin');
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [telemetry, setTelemetry] = useState<SystemTelemetry | null>(null);

  useEffect(() => {
    // Initial fetch
    initApp();

    // Heartbeat poll for live telemetry
    const interval = setInterval(() => {
      fetchTelemetry();
      api.getEvaluations().then(setEvaluations).catch(() => {});
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const initApp = async () => {
    try {
      const evs = await api.getEvaluations();
      setEvaluations(evs);
    } catch (e) {
      console.error('Error fetching evaluations:', e);
    }
    await fetchTelemetry();
  };

  const fetchTelemetry = async () => {
    try {
      const data = await api.getTelemetry();
      setTelemetry(data);
    } catch (e) {
      // quiet fallback in local preview mode
    }
  };

  return (
    <div className="relative min-h-screen bg-[#080b11] text-slate-100 flex flex-col font-sans">
      <HashRain />
      <div className="relative z-10 flex flex-col flex-1">
      {/* Top Header */}
      <Navbar
        currentRole={currentRole}
        onRoleChange={setCurrentRole}
        telemetry={telemetry}
        onNavigate={setActiveTab}
      />

      {/* Main Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          currentRole={currentRole}
        />

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-7 bg-transparent">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'dashboard' && (
              <Dashboard
                evaluations={evaluations}
                telemetry={telemetry}
                onNavigateToLoop={() => setActiveTab('orchestrator')}
              />
            )}
            {activeTab === 'orchestrator' && <OrchestratorPage />}
            {activeTab === 'red_team' && <RedTeamPage />}
            {activeTab === 'blue_team' && <BlueTeamPage />}
            {activeTab === 'audit' && <AuditLogsPage />}
            {activeTab === 'policies' && <ZeroTrustPoliciesPage />}
            {activeTab === 'side_channel' && <SideChannelPage />}
          </div>
        </main>
      </div>
      </div>
    </div>
  );
}

export default App;
