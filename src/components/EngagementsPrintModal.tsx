import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Printer, 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Users, 
  X, 
  FileText, 
  CheckCircle2, 
  CalendarClock,
  Filter
} from 'lucide-react';

export const EngagementsPrintModal: React.FC = () => {
  const { 
    isPrintDocketOpen, 
    setIsPrintDocketOpen, 
    meetings, 
    directions 
  } = useApp();

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const tomorrowStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  }, []);

  const [scope, setScope] = useState<'today' | 'tomorrow' | 'custom' | 'all-scheduled' | 'all-total'>('today');
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [chairFilter, setChairFilter] = useState<'all' | 'dg'>('all');

  // Clean print state on unmount / after print
  useEffect(() => {
    const handleAfterPrint = () => {
      document.body.classList.remove('printing-docket');
    };
    window.addEventListener('afterprint', handleAfterPrint);
    return () => {
      window.removeEventListener('afterprint', handleAfterPrint);
      document.body.classList.remove('printing-docket');
    };
  }, []);

  // Filter meetings according to chosen scope
  const filteredMeetings = useMemo(() => {
    let list = meetings.filter(m => !m.is_archived);

    if (scope === 'today') {
      list = list.filter(m => m.date === todayStr);
    } else if (scope === 'tomorrow') {
      list = list.filter(m => m.date === tomorrowStr);
    } else if (scope === 'custom') {
      list = list.filter(m => m.date === selectedDate);
    } else if (scope === 'all-scheduled') {
      list = list.filter(m => m.status === 'Scheduled' || m.status === 'In Progress' || m.status === 'Rescheduled');
    }
    // 'all-total' includes all

    if (chairFilter === 'dg') {
      list = list.filter(m => 
        m.chairperson.toLowerCase().includes('director general') || 
        m.chairperson.toLowerCase().includes('dg')
      );
    }

    return list.sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return a.time.localeCompare(b.time);
    });
  }, [meetings, scope, selectedDate, chairFilter, todayStr, tomorrowStr]);

  // Statistics
  const stats = useMemo(() => {
    const total = filteredMeetings.length;
    const dgChaired = filteredMeetings.filter(m => 
      m.chairperson.toLowerCase().includes('director general') || 
      m.chairperson.toLowerCase().includes('dg')
    ).length;
    const rescheduled = filteredMeetings.filter(m => m.status === 'Rescheduled').length;
    const totalDirectives = filteredMeetings.reduce((acc, m) => {
      const count = directions.filter(d => d.meeting_id === m.id && !d.is_archived).length;
      return acc + count;
    }, 0);

    return { total, dgChaired, rescheduled, totalDirectives };
  }, [filteredMeetings, directions]);

  const handlePrint = () => {
    document.body.classList.add('printing-docket');
    window.print();
    setTimeout(() => {
      document.body.classList.remove('printing-docket');
    }, 1500);
  };

  if (!isPrintDocketOpen) return null;

  const formatDateFormal = (dateStr: string) => {
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        return d.toLocaleDateString('en-GB', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        });
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  const getScopeTitle = () => {
    if (scope === 'today') return `DAILY ENGAGEMENTS ROSTER (${formatDateFormal(todayStr)})`;
    if (scope === 'tomorrow') return `DAILY ENGAGEMENTS ROSTER (${formatDateFormal(tomorrowStr)})`;
    if (scope === 'custom') return `DAILY ENGAGEMENTS ROSTER (${formatDateFormal(selectedDate)})`;
    if (scope === 'all-scheduled') return 'SCHEDULE OF UPCOMING & ACTIVE MEETINGS';
    return 'COMPREHENSIVE EXECUTIVE ENGAGEMENTS & MEETINGS ROSTER';
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto modal-backdrop-print-hide">
      
      {/* Outer Modal Container */}
      <div className="bg-white dark:bg-[#0c1626] border border-slate-300 dark:border-[#22395d] rounded-2xl max-w-5xl w-full shadow-2xl flex flex-col max-h-[92vh] overflow-hidden my-auto">
        
        {/* Modal Toolbar (Screen-Only) */}
        <div className="p-4 bg-slate-100 dark:bg-[#08101d] border-b border-slate-200 dark:border-[#1c2e4b] flex flex-col md:flex-row md:items-center justify-between gap-3 no-print">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-emerald-100 dark:bg-amber-500/20 text-emerald-800 dark:text-amber-400 rounded-lg">
                <Printer className="w-4 h-4" />
              </span>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 font-serif">
                Print Executive Engagements &amp; Meetings (PDF)
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Generate an official Government of Punjab engagement docket suitable for printing or saving as PDF.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 dark:bg-amber-600 dark:hover:bg-amber-500 text-white dark:text-slate-950 text-xs font-bold rounded-lg shadow transition-all flex items-center gap-1.5"
              title="Open browser print dialog (Select 'Save as PDF' to export as PDF)"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save as PDF</span>
            </button>

            <button
              onClick={() => setIsPrintDocketOpen(false)}
              className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-[#152338] transition-colors"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Controls Bar (Screen-Only) */}
        <div className="p-3 bg-white dark:bg-[#0e192c] border-b border-slate-200 dark:border-[#1e3250] flex flex-wrap items-center justify-between gap-2.5 text-xs no-print">
          
          {/* Scope selection buttons */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-[#070e1a] p-1 rounded-lg border border-slate-200 dark:border-[#1b2d49]">
            <button
              onClick={() => setScope('today')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-all ${
                scope === 'today'
                  ? 'bg-white dark:bg-[#162744] text-emerald-800 dark:text-amber-300 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Today's Engagements
            </button>

            <button
              onClick={() => setScope('tomorrow')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-all ${
                scope === 'tomorrow'
                  ? 'bg-white dark:bg-[#162744] text-emerald-800 dark:text-amber-300 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Tomorrow
            </button>

            <button
              onClick={() => setScope('custom')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-all ${
                scope === 'custom'
                  ? 'bg-white dark:bg-[#162744] text-emerald-800 dark:text-amber-300 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Specific Date
            </button>

            <button
              onClick={() => setScope('all-scheduled')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-all ${
                scope === 'all-scheduled'
                  ? 'bg-white dark:bg-[#162744] text-emerald-800 dark:text-amber-300 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Total Scheduled
            </button>

            <button
              onClick={() => setScope('all-total')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-all ${
                scope === 'all-total'
                  ? 'bg-white dark:bg-[#162744] text-emerald-800 dark:text-amber-300 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              All Records
            </button>
          </div>

          {/* Date Picker if custom date selected */}
          {scope === 'custom' && (
            <div className="flex items-center gap-1.5">
              <label className="text-slate-600 dark:text-slate-400 font-semibold">Select Date:</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-slate-50 dark:bg-[#070e1a] text-slate-800 dark:text-slate-200 px-2.5 py-1 rounded border border-slate-300 dark:border-[#1e3250] focus:outline-none"
              />
            </div>
          )}

          {/* Chairperson filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Chair:</span>
            <select
              value={chairFilter}
              onChange={(e) => setChairFilter(e.target.value as any)}
              className="bg-slate-50 dark:bg-[#070e1a] text-slate-800 dark:text-slate-200 px-2 py-1 rounded border border-slate-300 dark:border-[#1e3250]"
            >
              <option value="all">All Chairpersons</option>
              <option value="dg">DG Mines &amp; Minerals Only</option>
            </select>
          </div>
        </div>

        {/* =========================================================================
            PRINTABLE DOCKET CONTENT (Rendered on screen & captured in Print / PDF)
           ========================================================================= */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-200/60 dark:bg-[#060b14]">
          
          {/* Paper Canvas */}
          <div 
            id="printable-engagement-docket"
            className="bg-white text-slate-900 max-w-4xl mx-auto p-8 sm:p-10 shadow-lg rounded-sm font-sans"
            style={{ minHeight: '840px', color: '#111827' }}
          >
            
            {/* 1. Official Government Letterhead */}
            <div className="border-b-2 border-slate-900 pb-4 mb-4">
              <div className="flex items-center justify-between gap-4">
                
                {/* Punjab Seal */}
                <div className="w-16 h-16 flex-shrink-0 flex items-center justify-center">
                  <img 
                    src="./assets/punjab_logo.png" 
                    alt="Government of the Punjab" 
                    className="w-16 h-16 object-contain"
                    onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                  />
                </div>

                {/* Central Title */}
                <div className="text-center flex-1">
                  <h1 className="text-base sm:text-lg font-black tracking-widest uppercase font-serif text-slate-900 leading-tight">
                    GOVERNMENT OF THE PUNJAB
                  </h1>
                  <h2 className="text-sm font-bold tracking-wider uppercase text-emerald-900 font-serif">
                    DIRECTORATE GENERAL OF MINES &amp; MINERALS
                  </h2>
                  <h3 className="text-xs font-semibold text-slate-700 tracking-wide">
                    OFFICE OF THE DIRECTOR GENERAL
                  </h3>
                  <p className="text-[10px] text-slate-500 font-serif mt-0.5">
                    Poonch House, Multan Road, Lahore, Punjab, Pakistan
                  </p>
                </div>

                {/* DGMM Crest */}
                <div className="w-16 h-16 flex-shrink-0 flex items-center justify-center">
                  <img 
                    src="./assets/dgmm_logo.png" 
                    alt="DG Mines & Minerals" 
                    className="w-16 h-16 object-contain rounded-full border border-slate-300 p-0.5"
                    onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                  />
                </div>

              </div>

              {/* Decorative double bar */}
              <div className="mt-3 pt-1 border-t border-slate-400 text-center">
                <span className="inline-block bg-slate-900 text-white font-mono text-[11px] font-bold px-3 py-0.5 uppercase tracking-wider rounded-xs">
                  {getScopeTitle()}
                </span>
              </div>
            </div>

            {/* 2. Metadata Information Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 py-2 px-3 bg-slate-100 border border-slate-300 text-[10px] font-mono text-slate-800 mb-4 rounded-xs">
              <div>
                <span className="text-slate-500 block">DOCKET REF:</span>
                <strong className="font-bold">DGM&amp;M/DG-ENG/{new Date().getFullYear()}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">GENERATED:</span>
                <strong>{new Date().toLocaleDateString('en-GB')} {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">CLASSIFICATION:</span>
                <strong className="text-emerald-900 font-bold">OFFICIAL / EXECUTIVE</strong>
              </div>
              <div>
                <span className="text-slate-500 block">ISSUED BY:</span>
                <strong>OFFICE OF THE DG</strong>
              </div>
            </div>

            {/* 3. Summary Statistics Line */}
            <div className="flex items-center justify-between gap-2 p-2.5 bg-emerald-50/70 border border-emerald-300 text-xs font-serif text-emerald-950 mb-4 rounded-xs">
              <div>
                Total Scheduled Engagements: <strong className="font-sans font-bold text-emerald-900">{stats.total}</strong>
              </div>
              <div>&bull;</div>
              <div>
                Chaired by DG: <strong className="font-sans font-bold text-emerald-900">{stats.dgChaired}</strong>
              </div>
              <div>&bull;</div>
              <div>
                Rescheduled: <strong className="font-sans font-bold text-amber-800">{stats.rescheduled}</strong>
              </div>
              <div>&bull;</div>
              <div>
                Directives Linked: <strong className="font-sans font-bold text-slate-900">{stats.totalDirectives}</strong>
              </div>
            </div>

            {/* 4. Tabular Engagements List */}
            {filteredMeetings.length === 0 ? (
              <div className="p-12 text-center border-2 border-dashed border-slate-300 my-6">
                <p className="text-sm font-semibold text-slate-600">
                  No scheduled meetings or engagements recorded for the selected scope.
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  (To view all upcoming meetings, switch to "Total Scheduled" in the filter above)
                </p>
              </div>
            ) : (
              <table className="w-full border-collapse border border-slate-900 text-xs text-slate-900 mb-6">
                <thead>
                  <tr className="bg-slate-900 text-white font-bold text-[10px] tracking-wider uppercase font-mono">
                    <th className="border border-slate-900 p-2 text-center w-8">#</th>
                    <th className="border border-slate-900 p-2 text-left w-36">Time &amp; Venue</th>
                    <th className="border border-slate-900 p-2 text-left">Meeting Title &amp; Details</th>
                    <th className="border border-slate-900 p-2 text-left w-48">Chair &amp; Participants</th>
                    <th className="border border-slate-900 p-2 text-center w-24">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-300">
                  {filteredMeetings.map((m, idx) => {
                    const relDirs = directions.filter(d => d.meeting_id === m.id && !d.is_archived);
                    return (
                      <tr key={m.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/80'}>
                        
                        {/* Sr. No */}
                        <td className="border border-slate-400 p-2 text-center font-bold font-mono text-[11px] align-top">
                          {idx + 1}
                        </td>

                        {/* Time & Venue */}
                        <td className="border border-slate-400 p-2 align-top text-[11px]">
                          <div className="font-bold text-slate-950 font-mono flex items-center gap-1">
                            <span>{m.time}</span>
                          </div>
                          {scope !== 'today' && scope !== 'tomorrow' && (
                            <div className="text-[10px] text-slate-600 font-mono font-semibold">
                              {m.date}
                            </div>
                          )}
                          <div className="text-[10px] text-slate-600 mt-1 leading-snug">
                            {m.venue}
                          </div>
                        </td>

                        {/* Title & Subject */}
                        <td className="border border-slate-400 p-2 align-top">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <span className="font-mono text-[9px] font-bold px-1 rounded bg-slate-200 text-slate-800">
                              {m.id}
                            </span>
                            <span className="text-[9px] px-1 rounded bg-emerald-100 text-emerald-900 font-semibold font-mono">
                              {m.category}
                            </span>
                            {relDirs.length > 0 && (
                              <span className="text-[9px] text-slate-500 font-mono">
                                ({relDirs.length} directions)
                              </span>
                            )}
                          </div>
                          <div className="font-bold text-slate-950 text-xs font-serif leading-snug">
                            {m.title}
                          </div>
                          <div className="text-[10px] text-slate-600 mt-1 leading-snug">
                            {m.subject}
                          </div>

                          {/* Reschedule note if applicable */}
                          {m.status === 'Rescheduled' && m.reschedule_history && m.reschedule_history.length > 0 && (
                            <div className="mt-1 text-[9px] bg-amber-100 text-amber-900 p-1 rounded border border-amber-300">
                              <strong>Rescheduled:</strong> {m.reschedule_history[m.reschedule_history.length - 1].reason} (Prev: {m.reschedule_history[m.reschedule_history.length - 1].previous_date})
                            </div>
                          )}
                        </td>

                        {/* Chair & Participants */}
                        <td className="border border-slate-400 p-2 align-top text-[10px] leading-tight">
                          <div className="font-bold text-slate-900 mb-0.5">
                            Chair: <span className="font-normal">{m.chairperson}</span>
                          </div>
                          <div className="text-slate-600 text-[10px]">
                            <strong>Participants:</strong> {m.participating_officers}
                          </div>
                        </td>

                        {/* Status */}
                        <td className="border border-slate-400 p-2 text-center align-top text-[10px]">
                          <span className={`inline-block px-1.5 py-0.5 rounded font-mono font-semibold uppercase text-[9px] ${
                            m.status === 'Rescheduled' 
                              ? 'bg-amber-100 text-amber-900 border border-amber-400' 
                              : m.status === 'In Progress'
                              ? 'bg-blue-100 text-blue-900 border border-blue-400'
                              : m.status === 'Concluded'
                              ? 'bg-emerald-100 text-emerald-900 border border-emerald-400'
                              : 'bg-slate-100 text-slate-800 border border-slate-400'
                          }`}>
                            {m.status}
                          </span>
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}

            {/* 5. Official Verification & Sign-Off Block */}
            <div className="mt-8 pt-4 border-t-2 border-slate-900 text-xs text-slate-800">
              <div className="flex flex-col sm:flex-row items-end justify-between gap-6 pt-2">
                
                {/* Notes & Circulation */}
                <div className="text-[10px] text-slate-500 font-mono space-y-0.5 max-w-sm">
                  <div className="font-bold text-slate-800 uppercase">Circulation / Action:</div>
                  <div>1. Personal Staff to Director General, Mines &amp; Minerals</div>
                  <div>2. All Concerned Division Heads &amp; Field Formations</div>
                  <div>3. Executive Diary &amp; Monitoring Cell</div>
                </div>

                {/* Sign-off Seal Block */}
                <div className="text-right flex-shrink-0">
                  <div className="h-12 flex items-end justify-end mb-1">
                    <span className="text-[10px] text-slate-400 italic font-serif">Verified from Official Management Portal</span>
                  </div>
                  <div className="border-t border-slate-800 pt-1 font-serif">
                    <div className="font-bold text-slate-950 text-xs">Staff Officer to Director General</div>
                    <div className="text-[10px] text-slate-700">Directorate General of Mines &amp; Minerals</div>
                    <div className="text-[9px] text-slate-500 font-mono">Government of the Punjab</div>
                  </div>
                </div>

              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
