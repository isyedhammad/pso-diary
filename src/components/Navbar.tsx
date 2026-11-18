import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { SAMPLE_USERS } from '../data/constants';
import { 
  Search, 
  Bell, 
  ShieldCheck, 
  Database, 
  UserCheck, 
  Layers, 
  Menu, 
  X,
  FileText,
  Clock,
  ArrowRight
} from 'lucide-react';

interface NavbarProps {
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar, isSidebarOpen }) => {
  const { 
    currentUser, 
    setCurrentUser, 
    isDemoActive, 
    cloudConfig,
    meetings,
    directions,
    setSelectedMeetingId,
    setSelectedDirectionId,
    setActiveTab,
    kpis
  } = useApp();

  const [searchVal, setSearchVal] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Close search dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter search results
  const searchResults = React.useMemo(() => {
    if (!searchVal.trim() || searchVal.length < 2) return { meetings: [], directions: [] };
    const q = searchVal.toLowerCase();

    const matchedMeetings = meetings.filter(m => 
      m.title.toLowerCase().includes(q) ||
      m.subject.toLowerCase().includes(q) ||
      m.id.toLowerCase().includes(q) ||
      m.category.toLowerCase().includes(q) ||
      m.chairperson.toLowerCase().includes(q)
    ).slice(0, 5);

    const matchedDirections = directions.filter(d => 
      d.id.toLowerCase().includes(q) ||
      d.title.toLowerCase().includes(q) ||
      d.description.toLowerCase().includes(q) ||
      d.responsible_officer.toLowerCase().includes(q) ||
      d.responsible_divisions.some(div => div.toLowerCase().includes(q)) ||
      (d.responsible_field_offices && d.responsible_field_offices.some(fo => fo.toLowerCase().includes(q)))
    ).slice(0, 5);

    return { meetings: matchedMeetings, directions: matchedDirections };
  }, [searchVal, meetings, directions]);

  const hasResults = searchResults.meetings.length > 0 || searchResults.directions.length > 0;

  return (
    <header className="sticky top-0 z-40 bg-[#070d18]/95 backdrop-blur border-b border-[#1c2c48] px-4 lg:px-6 py-2.5">
      <div className="flex items-center justify-between gap-4">
        
        {/* Left: Hamburger & Dual Crests */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-[#14233c] focus:outline-none transition-colors"
            title="Toggle Sidebar"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex items-center gap-3">
            <div className="flex items-center -space-x-1">
              <img 
                src="./assets/punjab_logo.png" 
                alt="Gov of Punjab Seal" 
                className="w-9 h-9 object-contain drop-shadow-md"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <img 
                src="./assets/dgmm_logo.png" 
                alt="DG Mines Crest" 
                className="w-9 h-9 object-contain drop-shadow-md rounded-full bg-white/10 p-0.5 border border-amber-500/40"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            
            <div className="hidden sm:block">
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-wider font-extrabold text-amber-400 font-serif">
                  GOVERNMENT OF THE PUNJAB
                </span>
                <span className="text-[10px] bg-emerald-950 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-700/50 font-mono">
                  DGM&M
                </span>
              </div>
              <h1 className="text-sm lg:text-base font-bold text-slate-100 tracking-tight leading-tight">
                Directorate General of Mines & Minerals
                <span className="hidden md:inline font-normal text-slate-400 text-xs ml-2">
                  — Directions & Compliance Portal
                </span>
              </h1>
            </div>
          </div>
        </div>

        {/* Center: Global Search Bar */}
        <div ref={searchRef} className="relative flex-1 max-w-md hidden md:block">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search meetings, directions, divisions, officers..."
              value={searchVal}
              onChange={(e) => {
                setSearchVal(e.target.value);
                setShowSearchResults(true);
              }}
              onFocus={() => setShowSearchResults(true)}
              className="w-full bg-[#0e192c] text-xs text-slate-200 pl-9 pr-12 py-2 rounded-lg border border-[#1e3252] focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500/30 placeholder-slate-500 transition-colors"
            />
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center">
              <kbd className="text-[10px] bg-[#172744] text-slate-400 px-1.5 py-0.5 rounded border border-slate-700">
                /
              </kbd>
            </div>
          </div>

          {/* Search Dropdown Results */}
          {showSearchResults && searchVal.trim().length >= 2 && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-[#0d182b] border border-[#22385b] rounded-xl shadow-2xl overflow-hidden z-50 max-h-96 overflow-y-auto">
              {!hasResults ? (
                <div className="p-4 text-center text-xs text-slate-400">
                  No records matching <span className="text-amber-300 font-semibold">"{searchVal}"</span>
                </div>
              ) : (
                <div className="p-2 space-y-3">
                  {searchResults.meetings.length > 0 && (
                    <div>
                      <div className="text-[10px] uppercase font-bold text-slate-400 px-2 py-1 tracking-wider">
                        Meetings ({searchResults.meetings.length})
                      </div>
                      <div className="space-y-1">
                        {searchResults.meetings.map(m => (
                          <button
                            key={m.id}
                            onClick={() => {
                              setSelectedMeetingId(m.id);
                              setActiveTab('meetings');
                              setShowSearchResults(false);
                              setSearchVal('');
                            }}
                            className="w-full text-left p-2 rounded-lg hover:bg-[#162744] transition-colors flex items-start gap-2.5"
                          >
                            <FileText className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-[11px] font-mono font-bold text-amber-400">{m.id}</span>
                                <span className="text-[10px] text-slate-400">{m.date}</span>
                              </div>
                              <p className="text-xs text-slate-200 font-medium truncate">{m.title}</p>
                            </div>
                            <ArrowRight className="w-3.5 h-3.5 text-slate-400 self-center" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {searchResults.directions.length > 0 && (
                    <div>
                      <div className="text-[10px] uppercase font-bold text-slate-400 px-2 py-1 tracking-wider border-t border-[#1a2d4b] pt-2">
                        DG Directions ({searchResults.directions.length})
                      </div>
                      <div className="space-y-1">
                        {searchResults.directions.map(d => (
                          <button
                            key={d.id}
                            onClick={() => {
                              setSelectedDirectionId(d.id);
                              setActiveTab('directions');
                              setShowSearchResults(false);
                              setSearchVal('');
                            }}
                            className="w-full text-left p-2 rounded-lg hover:bg-[#162744] transition-colors flex items-start gap-2.5"
                          >
                            <Clock className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-[11px] font-mono font-bold text-amber-400">{d.id}</span>
                                <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                                  d.status === 'Completed' ? 'bg-emerald-950 text-emerald-300' :
                                  d.status === 'Overdue' ? 'bg-rose-950 text-rose-300' :
                                  'bg-blue-950 text-blue-300'
                                }`}>
                                  {d.status}
                                </span>
                              </div>
                              <p className="text-xs text-slate-200 font-medium truncate">{d.title}</p>
                              <p className="text-[11px] text-slate-400 truncate">{d.responsible_officer} ({d.responsible_divisions.join(', ')})</p>
                            </div>
                            <ArrowRight className="w-3.5 h-3.5 text-slate-400 self-center" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: Status Badges, Role Switcher, Alerts */}
        <div className="flex items-center gap-2 lg:gap-3">
          
          {/* Demo Data Tag */}
          {isDemoActive && (
            <div 
              onClick={() => setActiveTab('settings')}
              className="cursor-pointer hidden xl:flex items-center gap-1.5 px-2 py-1 bg-amber-950/60 hover:bg-amber-900/60 border border-amber-600/40 rounded-md text-[11px] text-amber-300 transition-colors"
              title="Click to manage or clear demo data in Settings"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
              <span className="font-semibold">DEMO DATA</span>
            </div>
          )}

          {/* Cloud Connection Badge */}
          <div 
            onClick={() => setActiveTab('settings')}
            className={`cursor-pointer hidden lg:flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] border transition-colors ${
              cloudConfig.supabaseUrl 
                ? 'bg-emerald-950/50 border-emerald-600/40 text-emerald-300' 
                : 'bg-[#121f35] border-[#22395d] text-slate-300 hover:border-amber-500/50'
            }`}
            title="Cloud Database & Storage Status. Click to configure."
          >
            <Database className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden xl:inline">Cloud:</span>
            <span className="font-medium">
              {cloudConfig.supabaseUrl ? 'Supabase Live' : 'Persistent Cloud Ledger'}
            </span>
          </div>

          {/* Notifications Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-[#14233c] transition-colors"
              title="Urgent Alerts"
            >
              <Bell className="w-4 h-4" />
              {kpis.overdueDirections > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-[#070d18]"></span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-[#0d182b] border border-[#22385b] rounded-xl shadow-2xl p-3 z-50">
                <div className="flex items-center justify-between pb-2 border-b border-[#1b2f4e]">
                  <span className="text-xs font-bold text-slate-200">Departmental Alerts</span>
                  <span className="text-[10px] text-amber-400 font-medium">Live Status</span>
                </div>
                <div className="mt-2 space-y-2 text-xs">
                  {kpis.overdueDirections > 0 && (
                    <div className="p-2 rounded bg-rose-950/40 border border-rose-800/40 text-rose-200 flex items-start gap-2">
                      <span className="w-2 h-2 rounded-full bg-rose-500 mt-1 flex-shrink-0"></span>
                      <div>
                        <p className="font-semibold">{kpis.overdueDirections} Directions Overdue</p>
                        <p className="text-[11px] text-rose-300/80">Immediate compliance or revised timeline required.</p>
                      </div>
                    </div>
                  )}
                  {kpis.dueIn48HoursDirections > 0 && (
                    <div className="p-2 rounded bg-amber-950/40 border border-amber-800/40 text-amber-200 flex items-start gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-400 mt-1 flex-shrink-0"></span>
                      <div>
                        <p className="font-semibold">{kpis.dueIn48HoursDirections} Directions Due Within 48 Hours</p>
                        <p className="text-[11px] text-amber-300/80">Check assigned divisions for upcoming submissions.</p>
                      </div>
                    </div>
                  )}
                  {kpis.complianceSubmittedDirections > 0 && (
                    <div className="p-2 rounded bg-blue-950/40 border border-blue-800/40 text-blue-200 flex items-start gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-400 mt-1 flex-shrink-0"></span>
                      <div>
                        <p className="font-semibold">{kpis.complianceSubmittedDirections} Submissions Awaiting DG Review</p>
                        <p className="text-[11px] text-blue-300/80">Review and accept or return for further action.</p>
                      </div>
                    </div>
                  )}
                  {kpis.overdueDirections === 0 && kpis.dueIn48HoursDirections === 0 && (
                    <p className="text-slate-400 text-center py-2 text-xs">No critical pending alerts.</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Role Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-[#111e33] hover:bg-[#182b49] border border-[#1e3250] text-left transition-colors"
            >
              <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs border border-amber-500/40">
                {currentUser.name.charAt(0)}
              </div>
              <div className="hidden md:block">
                <div className="text-xs font-semibold text-slate-200 leading-tight">
                  {currentUser.name}
                </div>
                <div className="text-[10px] text-amber-400/90 font-mono">
                  {currentUser.role}
                </div>
              </div>
            </button>

            {/* Role Switcher Menu */}
            {showRoleMenu && (
              <div className="absolute right-0 mt-2 w-72 bg-[#0c1626] border border-[#22395d] rounded-xl shadow-2xl p-2 z-50">
                <div className="px-3 py-2 border-b border-[#1c2e4b] mb-1">
                  <p className="text-xs font-bold text-slate-100">Simulate Operational Role</p>
                  <p className="text-[10px] text-slate-400">Switch user context to verify access & actions</p>
                </div>
                <div className="space-y-1">
                  {SAMPLE_USERS.map(u => (
                    <button
                      key={u.id}
                      onClick={() => {
                        setCurrentUser(u);
                        setShowRoleMenu(false);
                      }}
                      className={`w-full text-left p-2 rounded-lg text-xs transition-colors flex items-start gap-2 ${
                        currentUser.id === u.id ? 'bg-amber-950/60 border border-amber-600/40 text-amber-200' : 'hover:bg-[#14233c] text-slate-300'
                      }`}
                    >
                      <UserCheck className={`w-3.5 h-3.5 mt-0.5 ${currentUser.id === u.id ? 'text-amber-400' : 'text-slate-500'}`} />
                      <div>
                        <div className="font-semibold text-slate-200">{u.name}</div>
                        <div className="text-[10px] text-slate-400">{u.designation}</div>
                        <div className="text-[10px] font-mono text-amber-400">{u.role}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>

      </div>
    </header>
  );
};
