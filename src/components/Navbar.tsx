import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Search, 
  Sun, 
  Moon, 
  Menu, 
  X,
  FileText,
  Clock
} from 'lucide-react';

interface NavbarProps {
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar, isSidebarOpen }) => {
  const { 
    theme,
    toggleTheme,
    meetings,
    directions,
    setSelectedMeetingId,
    setSelectedDirectionId,
    setActiveTab
  } = useApp();

  const [searchVal, setSearchVal] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
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
      m.id.toLowerCase().includes(q)
    ).slice(0, 4);

    const matchedDirections = directions.filter(d => 
      d.id.toLowerCase().includes(q) ||
      d.title.toLowerCase().includes(q) ||
      d.responsible_officer.toLowerCase().includes(q) ||
      d.responsible_divisions.some(div => div.toLowerCase().includes(q))
    ).slice(0, 4);

    return { meetings: matchedMeetings, directions: matchedDirections };
  }, [searchVal, meetings, directions]);

  const hasResults = searchResults.meetings.length > 0 || searchResults.directions.length > 0;

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#070d18]/95 backdrop-blur border-b border-slate-200 dark:border-[#1c2c48] px-4 lg:px-6 py-2.5 transition-colors">
      <div className="flex items-center justify-between gap-4">
        
        {/* Left: Mobile Toggle & Dual Crests */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#14233c] focus:outline-none transition-colors"
            title="Toggle Sidebar"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex items-center gap-3">
            <div className="flex items-center -space-x-1">
              <img 
                src="./assets/punjab_logo.png" 
                alt="Gov of Punjab Seal" 
                className="w-9 h-9 object-contain drop-shadow-sm"
                onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
              />
              <img 
                src="./assets/dgmm_logo.png" 
                alt="DGMM Logo" 
                className="w-9 h-9 object-contain drop-shadow-sm rounded-full bg-slate-100 dark:bg-white/10 p-0.5 border border-amber-600/40"
                onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
              />
            </div>
            
            <div className="hidden sm:block">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] uppercase tracking-wider font-extrabold text-emerald-800 dark:text-amber-400 font-serif">
                  GOVERNMENT OF THE PUNJAB
                </span>
                <span className="text-[9px] bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-1 py-0.2 rounded font-mono font-semibold">
                  DGM&M
                </span>
              </div>
              <h1 className="text-sm font-bold text-slate-800 dark:text-slate-100 tracking-tight leading-tight">
                DG Mines & Minerals
                <span className="hidden md:inline font-normal text-slate-500 dark:text-slate-400 text-xs ml-1.5">
                  — Compliance Portal
                </span>
              </h1>
            </div>
          </div>
        </div>

        {/* Center: Search Bar */}
        <div ref={searchRef} className="relative flex-1 max-w-sm hidden md:block">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search meetings, directions, officers..."
              value={searchVal}
              onChange={(e) => {
                setSearchVal(e.target.value);
                setShowSearchResults(true);
              }}
              onFocus={() => setShowSearchResults(true)}
              className="w-full bg-slate-100 dark:bg-[#0e192c] text-xs text-slate-800 dark:text-slate-200 pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-[#1e3252] focus:border-emerald-600 dark:focus:border-amber-500 focus:outline-none placeholder-slate-400 transition-colors"
            />
          </div>

          {/* Search Dropdown */}
          {showSearchResults && searchVal.trim().length >= 2 && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-white dark:bg-[#0d182b] border border-slate-200 dark:border-[#22385b] rounded-xl shadow-xl overflow-hidden z-50 max-h-80 overflow-y-auto">
              {!hasResults ? (
                <div className="p-3 text-center text-xs text-slate-500">
                  No records matching "{searchVal}"
                </div>
              ) : (
                <div className="p-2 space-y-2">
                  {searchResults.meetings.map(m => (
                    <button
                      key={m.id}
                      onClick={() => {
                        setSelectedMeetingId(m.id);
                        setActiveTab('meetings');
                        setShowSearchResults(false);
                        setSearchVal('');
                      }}
                      className="w-full text-left p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-[#162744] transition-colors flex items-start gap-2"
                    >
                      <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-mono font-bold text-emerald-700 dark:text-amber-400">{m.id}</span>
                        <p className="text-xs text-slate-800 dark:text-slate-200 font-medium truncate">{m.title}</p>
                      </div>
                    </button>
                  ))}

                  {searchResults.directions.map(d => (
                    <button
                      key={d.id}
                      onClick={() => {
                        setSelectedDirectionId(d.id);
                        setActiveTab('directions');
                        setShowSearchResults(false);
                        setSearchVal('');
                      }}
                      className="w-full text-left p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-[#162744] transition-colors flex items-start gap-2"
                    >
                      <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-mono font-bold text-amber-600 dark:text-amber-400">{d.id}</span>
                          <span className="text-[9px] px-1 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                            {d.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-800 dark:text-slate-200 font-medium truncate">{d.title}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: Dark/Light Toggle */}
        <div className="flex items-center gap-2">
          
          {/* THEME TOGGLE: DARK / LIGHT MODE */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg border border-slate-200 dark:border-[#1e3250] bg-slate-100 dark:bg-[#111e33] text-slate-700 dark:text-amber-300 hover:bg-slate-200 dark:hover:bg-[#182b49] transition-colors flex items-center justify-center"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700" />
            )}
          </button>

        </div>

      </div>
    </header>
  );
};
