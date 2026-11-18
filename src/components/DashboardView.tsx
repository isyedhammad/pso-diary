import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  Calendar, 
  Compass, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  ArrowRight,
  Plus,
  FileText,
  Building,
  User,
  Printer
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const { 
    meetings, 
    directions, 
    kpis, 
    setActiveTab, 
    setSelectedMeetingId, 
    setSelectedDirectionId,
    setIsPrintDocketOpen
  } = useApp();

  const todayStr = new Date().toISOString().split('T')[0];

  // Pending & Overdue directions list
  const pendingDirections = directions
    .filter(d => !d.is_archived && d.status !== 'Completed')
    .sort((a, b) => (a.deadline || '').localeCompare(b.deadline || ''))
    .slice(0, 8);

  // Recent meetings
  const recentMeetings = [...meetings]
    .filter(m => !m.is_archived)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5);

  const hasAnyData = meetings.length > 0 || directions.length > 0;

  return (
    <div className="space-y-6 pb-12">
      
      {/* Executive Header Banner */}
      <div className="bg-white dark:bg-[#0e192c] border border-slate-200 dark:border-[#1d3558] rounded-xl p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-800 dark:text-amber-400 bg-emerald-50 dark:bg-amber-950/70 border border-emerald-300 dark:border-amber-600/40 px-2 py-0.5 rounded font-mono">
              Executive Dashboard
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Office of the Director General, Mines & Minerals
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 font-serif">
            Directions, Meetings & Compliance Portal
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Centralized monitoring for DG meetings, departmental directions, and field office compliance.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => setIsPrintDocketOpen(true)}
            className="px-3 py-2 bg-slate-100 dark:bg-[#12223c] hover:bg-slate-200 dark:hover:bg-[#1a3055] border border-slate-300 dark:border-[#233d66] text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
            title="Print or Export Daily Engagements & Scheduled Meetings (PDF)"
          >
            <Printer className="w-3.5 h-3.5 text-emerald-600 dark:text-amber-400" />
            <span>Print Engagements (PDF)</span>
          </button>
          <button
            onClick={() => setActiveTab('meetings')}
            className="px-3 py-2 bg-slate-100 dark:bg-[#12223c] hover:bg-slate-200 dark:hover:bg-[#1a3055] border border-slate-300 dark:border-[#233d66] text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Record Meeting</span>
          </button>
          <button
            onClick={() => setActiveTab('directions')}
            className="px-3.5 py-2 bg-emerald-700 dark:bg-amber-600 hover:bg-emerald-800 dark:hover:bg-amber-500 text-white dark:text-slate-950 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Issue Direction</span>
          </button>
        </div>
      </div>

      {/* 4 SIMPLIFIED SUMMARY METRIC CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Meetings */}
        <div 
          onClick={() => setActiveTab('meetings')}
          className="bg-white dark:bg-[#0e192c] hover:bg-slate-50 dark:hover:bg-[#13223b] border border-slate-200 dark:border-[#1e3250] rounded-xl p-4 transition-all cursor-pointer shadow-sm group"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Total Meetings</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-800 dark:text-slate-100 font-mono">
            {kpis.totalMeetings}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
            <span>Meetings Chaired</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-amber-400" />
          </div>
        </div>

        {/* Active Directions */}
        <div 
          onClick={() => setActiveTab('directions')}
          className="bg-white dark:bg-[#0e192c] hover:bg-slate-50 dark:hover:bg-[#13223b] border border-slate-200 dark:border-[#1e3250] rounded-xl p-4 transition-all cursor-pointer shadow-sm group"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Active Directions</span>
            <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-800 dark:text-slate-100 font-mono">
            {kpis.pendingDirections}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
            <span>Pending &amp; In Progress</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-amber-400" />
          </div>
        </div>

        {/* Overdue Directions */}
        <div 
          onClick={() => setActiveTab('directions')}
          className={`border rounded-xl p-4 transition-all cursor-pointer shadow-sm group ${
            kpis.overdueDirections > 0 
              ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800/60' 
              : 'bg-white dark:bg-[#0e192c] border-slate-200 dark:border-[#1e3250] hover:bg-slate-50 dark:hover:bg-[#13223b]'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className={`text-xs font-semibold ${kpis.overdueDirections > 0 ? 'text-rose-700 dark:text-rose-300' : 'text-slate-600 dark:text-slate-300'}`}>
              Overdue Directions
            </span>
            <div className={`p-1.5 rounded-lg ${kpis.overdueDirections > 0 ? 'bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
              <AlertTriangle className={`w-4 h-4 ${kpis.overdueDirections > 0 ? 'animate-pulse' : ''}`} />
            </div>
          </div>
          <div className={`text-2xl font-bold font-mono ${kpis.overdueDirections > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-800 dark:text-slate-100'}`}>
            {kpis.overdueDirections}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
            <span>Past Deadline</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-rose-500" />
          </div>
        </div>

        {/* Completed Directions */}
        <div 
          onClick={() => setActiveTab('directions')}
          className="bg-white dark:bg-[#0e192c] hover:bg-slate-50 dark:hover:bg-[#13223b] border border-slate-200 dark:border-[#1e3250] rounded-xl p-4 transition-all cursor-pointer shadow-sm group"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Completed Directions</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-400 font-mono">
            {kpis.completedDirections}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
            <span>Compliance Accepted</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600" />
          </div>
        </div>

      </div>

      {/* EMPTY STATE IF NO DATA */}
      {!hasAnyData ? (
        <div className="bg-white dark:bg-[#0e192c] border border-slate-200 dark:border-[#1e3250] rounded-xl p-12 text-center shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-amber-400 flex items-center justify-center mx-auto border border-emerald-200 dark:border-emerald-800">
            <Compass className="w-6 h-6" />
          </div>
          <div className="max-w-md mx-auto">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 font-serif">
              No Departmental Records Yet
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              The portal is clean and ready for official use. Record your first DG meeting or issue a direction directly.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setActiveTab('meetings')}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 dark:bg-amber-600 dark:hover:bg-amber-500 text-white dark:text-slate-950 text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
            >
              <Calendar className="w-4 h-4" />
              <span>Record First Meeting</span>
            </button>
            <button
              onClick={() => setActiveTab('directions')}
              className="px-4 py-2 bg-slate-100 dark:bg-[#12223c] hover:bg-slate-200 dark:hover:bg-[#1a3055] border border-slate-300 dark:border-[#233d66] text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
            >
              <Compass className="w-4 h-4 text-emerald-600 dark:text-amber-400" />
              <span>Issue Direction</span>
            </button>
          </div>
        </div>
      ) : (
        /* TWO CLEAN SECTIONS: PENDING DIRECTIVES & RECENT MEETINGS */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Pending & Overdue Directives (7 cols) */}
          <div className="lg:col-span-7 bg-white dark:bg-[#0e192c] border border-slate-200 dark:border-[#1e3250] rounded-xl p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-[#1b2d49]">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                  Active Directives Awaiting Completion
                </h3>
              </div>
              <button
                onClick={() => setActiveTab('directions')}
                className="text-xs text-emerald-700 dark:text-amber-400 hover:underline font-semibold flex items-center gap-1"
              >
                <span>View All ({directions.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {pendingDirections.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                All directions have been fulfilled and accepted!
              </div>
            ) : (
              <div className="space-y-2">
                {pendingDirections.map(d => (
                  <div
                    key={d.id}
                    onClick={() => {
                      setSelectedDirectionId(d.id);
                      setActiveTab('directions');
                    }}
                    className="p-3 rounded-lg bg-slate-50 dark:bg-[#091220] hover:bg-slate-100 dark:hover:bg-[#111e33] border border-slate-200 dark:border-[#1c2e4b] transition-all cursor-pointer flex items-center justify-between gap-3 group"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs font-bold text-amber-700 dark:text-amber-400">{d.id}</span>
                        <span className={`text-[9px] px-1.5 py-0.2 rounded font-semibold ${
                          d.status === 'Overdue' 
                            ? 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300' 
                            : 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300'
                        }`}>
                          {d.status}
                        </span>
                        <span className="text-[10px] text-slate-500 truncate">{d.responsible_divisions.join(', ')}</span>
                      </div>
                      <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-100 group-hover:text-emerald-700 dark:group-hover:text-amber-300 truncate">
                        {d.title}
                      </h4>
                      <p className="text-[10px] text-slate-500 mt-0.5 truncate">
                        Officer: {d.responsible_officer}
                      </p>
                    </div>

                    <div className="text-right text-xs font-mono flex-shrink-0">
                      <div className="text-[10px] text-slate-400">Deadline</div>
                      <div className={`font-semibold ${d.status === 'Overdue' ? 'text-rose-600 dark:text-rose-400 font-bold' : 'text-slate-700 dark:text-slate-200'}`}>
                        {d.deadline}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Meetings (5 cols) */}
          <div className="lg:col-span-5 bg-white dark:bg-[#0e192c] border border-slate-200 dark:border-[#1e3250] rounded-xl p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-[#1b2d49]">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                  Recent Chaired Meetings
                </h3>
              </div>
              <button
                onClick={() => setActiveTab('meetings')}
                className="text-xs text-emerald-700 dark:text-amber-400 hover:underline font-semibold flex items-center gap-1"
              >
                <span>View All ({meetings.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {recentMeetings.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No meetings recorded yet.
              </div>
            ) : (
              <div className="space-y-2">
                {recentMeetings.map(m => {
                  const relDirs = directions.filter(d => d.meeting_id === m.id && !d.is_archived);

                  return (
                    <div
                      key={m.id}
                      onClick={() => {
                        setSelectedMeetingId(m.id);
                        setActiveTab('meetings');
                      }}
                      className="p-3 rounded-lg bg-slate-50 dark:bg-[#091220] hover:bg-slate-100 dark:hover:bg-[#111e33] border border-slate-200 dark:border-[#1c2e4b] transition-all cursor-pointer group"
                    >
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="font-mono font-bold text-emerald-700 dark:text-amber-400">{m.id}</span>
                        <span className="font-mono text-slate-500">{m.date}</span>
                      </div>
                      <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-100 group-hover:text-emerald-700 dark:group-hover:text-amber-300 truncate">
                        {m.title}
                      </h4>
                      <div className="flex justify-between items-center text-[10px] text-slate-500 mt-1">
                        <span className="truncate max-w-[150px]">{m.chairperson}</span>
                        <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">{relDirs.length} directions</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
};
