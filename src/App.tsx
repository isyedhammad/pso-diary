import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { MeetingsView } from './components/MeetingsView';
import { DirectionsView } from './components/DirectionsView';
import { DocumentsView } from './components/DocumentsView';
import { SettingsView } from './components/SettingsView';

const MainLayout: React.FC = () => {
  const { activeTab } = useApp();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-[#070c16] dark:text-slate-100 flex flex-col font-sans transition-colors duration-150">
      {/* Top Navigation Bar with Dual Crests, Theme Toggle & Search */}
      <Navbar 
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
        isSidebarOpen={isSidebarOpen} 
      />

      <div className="flex-1 flex">
        {/* Sidebar Navigation */}
        <Sidebar 
          isOpen={isSidebarOpen} 
          onClose={() => setIsSidebarOpen(false)} 
        />

        {/* Main Content Area */}
        <main className="flex-1 p-4 lg:p-6 max-w-7xl w-full mx-auto overflow-y-auto">
          {activeTab === 'dashboard' && <DashboardView />}
          {activeTab === 'meetings' && <MeetingsView />}
          {activeTab === 'directions' && <DirectionsView />}
          {activeTab === 'documents' && <DocumentsView />}
          {activeTab === 'settings' && <SettingsView />}

          {/* Departmental Institutional Footer */}
          <footer className="mt-16 pt-6 border-t border-slate-200 dark:border-[#182842] text-center text-xs text-slate-500 font-serif pb-8 space-y-1">
            <div className="flex items-center justify-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
              <span className="font-bold text-slate-700 dark:text-slate-400">Office of the Director General</span>
              <span className="text-slate-400 dark:text-slate-600">&bull;</span>
              <span>Mines &amp; Minerals Department</span>
              <span className="text-slate-400 dark:text-slate-600">&bull;</span>
              <span>Government of the Punjab</span>
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 font-sans">
              Poonch House, Multan Road, Lahore, Pakistan &bull; Regulated under PMCR 2002 &amp; Punjab Minerals Act
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
