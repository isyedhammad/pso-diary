import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  LayoutDashboard, 
  Calendar, 
  Compass, 
  X
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
      badge: kpis.totalMeetings > 0 ? `${kpis.totalMeetings}` : null,
      badgeColor: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
    },
    {
      id: 'directions',
      label: 'DG Directions & Compliance',
      icon: Compass,
      badge: kpis.overdueDirections > 0 ? `${kpis.overdueDirections} overdue` : (kpis.pendingDirections > 0 ? `${kpis.pendingDirections} active` : null),
      badgeColor: kpis.overdueDirections > 0 
        ? 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-800'
        : 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-800'
    }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          onClick={onClose} 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`fixed lg:sticky top-0 lg:top-[53px] left-0 z-50 h-screen lg:h-[calc(100vh-53px)] w-60 bg-white dark:bg-[#0a1220] border-r border-slate-200 dark:border-[#1a2c47] flex flex-col transition-all duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Department Header in Sidebar for Mobile */}
        <div className="p-4 border-b border-slate-200 dark:border-[#182842] flex items-center justify-between lg:hidden">
          <div className="flex items-center gap-2">
            <img src="./assets/punjab_logo.png" alt="Punjab Seal" className="w-6 h-6" />
            <span className="text-xs font-bold text-emerald-800 dark:text-amber-400">DG MINES & MINERALS</span>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-3 pb-2 text-[10px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase font-mono">
            Navigation
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
                    ? 'bg-emerald-50 dark:bg-amber-500/15 text-emerald-900 dark:text-amber-300 border-l-4 border-emerald-600 dark:border-amber-500 font-semibold shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#122036] hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-emerald-700 dark:text-amber-400' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200'
                  }`} />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full border font-mono font-medium ${item.badgeColor || 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-700'}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="p-3 border-t border-slate-200 dark:border-[#182842] text-[10px] text-slate-400 font-mono text-center">
          Punjab Mines Department &bull; v2.0
        </div>
      </aside>
    </>
  );
};
