import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  LayoutDashboard, 
  Calendar, 
  Compass, 
  CheckSquare, 
  Building2, 
  MapPin, 
  FolderArchive, 
  BarChart3, 
  Settings,
  ChevronRight,
  Shield,
  Clock,
  AlertTriangle
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { activeTab, setActiveTab, kpis } = useApp();

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'meetings',
      label: 'Meetings & Briefs',
      icon: Calendar,
      badge: kpis.meetingsRequiringFollowUp > 0 ? `${kpis.meetingsRequiringFollowUp} active` : null,
      badgeColor: 'bg-emerald-950 text-emerald-300 border-emerald-800'
    },
    {
      id: 'directions',
      label: 'DG Directions',
      icon: Compass,
      badge: `${kpis.totalDirections}`,
      badgeColor: 'bg-blue-950 text-blue-300 border-blue-800'
    },
    {
      id: 'compliance',
      label: 'Compliance Monitoring',
      icon: CheckSquare,
      badge: kpis.overdueDirections > 0 ? `${kpis.overdueDirections} overdue` : null,
      badgeColor: 'bg-rose-950 text-rose-300 border-rose-800'
    },
    {
      id: 'divisions',
      label: 'Divisions',
      icon: Building2,
      badge: '9 main',
      badgeColor: 'bg-slate-800 text-slate-300 border-slate-700'
    },
    {
      id: 'field-offices',
      label: 'Field Offices',
      icon: MapPin,
      badge: '15 units',
      badgeColor: 'bg-slate-800 text-slate-300 border-slate-700'
    },
    {
      id: 'documents',
      label: 'Documents Repository',
      icon: FolderArchive,
      badge: null
    },
    {
      id: 'reports',
      label: 'Reports & Analytics',
      icon: BarChart3,
      badge: null
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      badge: null
    }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          onClick={onClose} 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`fixed lg:sticky top-0 lg:top-[57px] left-0 z-50 h-screen lg:h-[calc(100vh-57px)] w-64 bg-[#0a1220] border-r border-[#1a2c47] flex flex-col transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Department Header in Sidebar for Mobile */}
        <div className="p-4 border-b border-[#182842] flex items-center justify-between lg:hidden">
          <div className="flex items-center gap-2">
            <img src="./assets/punjab_logo.png" alt="Punjab Seal" className="w-7 h-7" />
            <span className="text-xs font-bold text-amber-400">DG MINES & MINERALS</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-xs">
            ✕
          </button>
        </div>

        {/* Navigation Section */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-3 pb-2 text-[10px] font-bold tracking-wider text-slate-400 uppercase font-mono">
            Navigation Modules
          </div>

          {menuItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  onClose();
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all group ${
                  isActive
                    ? 'bg-gradient-to-r from-amber-500/20 to-amber-600/10 text-amber-300 border-l-4 border-amber-500 shadow-sm font-semibold'
                    : 'text-slate-300 hover:bg-[#122036] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-amber-400' : 'text-slate-400 group-hover:text-slate-200'
                  }`} />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border font-mono font-medium ${item.badgeColor || 'bg-slate-800 text-slate-300 border-slate-700'}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Quick Monitoring Footer Pill */}
        <div className="p-3 border-t border-[#182842] bg-[#070e1a]/80 text-[11px] text-slate-400">
          <div className="p-2.5 rounded-lg bg-[#0e192c] border border-[#1b2d49] space-y-1.5">
            <div className="flex items-center justify-between text-slate-300 font-semibold">
              <span className="flex items-center gap-1.5 text-xs text-amber-300">
                <Shield className="w-3.5 h-3.5 text-amber-400" />
                DG BENCH DISPATCH
              </span>
              <span className="font-mono text-[10px] text-emerald-400">ACTIVE</span>
            </div>
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-slate-400">Pending Directions:</span>
              <span className="font-mono text-slate-200 font-bold">{kpis.pendingDirections}</span>
            </div>
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-slate-400">Overdue:</span>
              <span className="font-mono text-rose-400 font-bold">{kpis.overdueDirections}</span>
            </div>
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-slate-400">Completed:</span>
              <span className="font-mono text-emerald-400 font-bold">{kpis.completedDirections}</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
