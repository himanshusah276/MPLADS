import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { DigiGovDashboardView } from './components/DigiGovDashboardView';
import { WorksView } from './components/WorksView';
import { AlertsTriageView } from './components/AlertsTriageView';
import { AgenciesView } from './components/AgenciesView';
import { MPDossierView } from './components/MPDossierView';
import { PreCheckSimulatorModal } from './components/PreCheckSimulatorModal';
import { ReportsExportView } from './components/ReportsExportView';
import { WorkDetailModal } from './components/WorkDetailModal';
import { AlertTriageModal } from './components/AlertTriageModal';
import { RiskExplainerModal } from './components/RiskExplainerModal';

const MainContent: React.FC = () => {
  const { activeTab } = useApp();

  return (
    <main className="flex-1 p-6 overflow-y-auto max-h-[calc(100vh-61px)] bg-[#0b1329]">
      <div className="max-w-7xl mx-auto space-y-6">
        {activeTab === 'dashboard' && <DashboardView />}
        {activeTab === 'digigov' && <DigiGovDashboardView />}
        {activeTab === 'works' && <WorksView />}
        {activeTab === 'alerts' && <AlertsTriageView />}
        {activeTab === 'agencies' && <AgenciesView />}
        {activeTab === 'mps' && <MPDossierView />}
        {activeTab === 'simulator' && <PreCheckSimulatorModal />}
        {activeTab === 'reports' && <ReportsExportView />}
      </div>

      {/* Global Dossier & Triage Modals */}
      <WorkDetailModal />
      <AlertTriageModal />
      <RiskExplainerModal />
    </main>
  );
};

export function App() {
  return (
    <AppProvider>
      <div className="min-h-screen flex flex-col bg-[#0b1329] text-slate-100 font-sans selection:bg-orange-500 selection:text-white">
        <Navbar />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <MainContent />
        </div>
      </div>
    </AppProvider>
  );
}

export default App;
