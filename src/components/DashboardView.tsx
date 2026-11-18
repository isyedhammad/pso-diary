import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Calendar, 
  Compass, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Hourglass, 
  FileWarning, 
  ArrowUpRight,
  TrendingUp,
  AlertTriangle,
  Building,
  ChevronRight,
  ShieldAlert,
  FileText,
  Activity,
  Layers,
  Sparkles
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const { 
    meetings, 
    directions, 
    activityLogs, 
    kpis, 
    divisionPerformances, 
    setActiveTab, 
    setSelectedMeetingId, 
    setSelectedDirectionId,
    setSelectedDivisionFilter 
  } = useApp();

  const [urgencyTab, setUrgencyTab] = useState<'high' | 'overdue' | 'due48' | 'recent' | 'review'>('overdue');

  const todayStr = new Date().toISOString().split('T')[0];
  const in48Hours = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString().split('T')[0];

  // Filter urgent directions
  const highPriorityDirections = directions.filter(d => !d.is_archived && d.priority === 'High' && d.status !== 'Completed');
  const overdueDirections = directions.filter(d => !d.is_archived && d.status !== 'Completed' && d.deadline && d.deadline < todayStr);
  const dueIn48Directions = directions.filter(d => !d.is_archived && d.status !== 'Completed' && d.deadline && d.deadline >= todayStr && d.deadline <= in48Hours);
  const recentlyIssuedDirections = [...directions].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 5);
  const awaitingReviewDirections = directions.filter(d => !d.is_archived && (d.status === 'Compliance Submitted' || d.status === 'Under Review'));

  // Get active list for urgency section
  const currentUrgentList = 
    urgencyTab === 'high' ? highPriorityDirections :
    urgencyTab === 'overdue' ? overdueDirections :
    urgencyTab === 'due48' ? dueIn48Directions :
    urgencyTab === 'recent' ? recentlyIssuedDirections :
    awaitingReviewDirections;

  // Recent meetings calculation with their direction stats
  const recentMeetings = [...meetings]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)
    .map(m => {
      const related = directions.filter(d => d.meeting_id === m.id && !d.is_archived);
      const completed = related.filter(d => d.status === 'Completed').length;
      const pending = related.filter(d => d.status !== 'Completed').length;
      return {
        ...m,
        directionsIssued: related.length,
        completed,
        pending
      };
    });

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#0d1c33] via-[#091b2c] to-[#0a2318] border border-[#1d3558] rounded-xl p-5 shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] uppercase font-bold tracking-widest text-amber-400 font-mono bg-amber-950/70 border border-amber-600/40 px-2 py-0.5 rounded">
                Executive Overview
              </span>
              <span className="text-xs text-slate-400">
                Poonch House, Multan Road, Lahore
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-100 font-serif tracking-tight">
              DG Directions & Compliance Management Dashboard
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              Centralised supervisory register tracking meetings chaired by the Director General, compliance across 9 departmental divisions, 15 field formations, and pending recovery directives.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('meetings')}
              className="px-3 py-2 bg-[#12223c] hover:bg-[#1a3055] border border-[#233d66] text-slate-200 text-xs font-semibold rounded-lg shadow transition-colors flex items-center gap-1.5"
            >
              <Calendar className="w-4 h-4 text-emerald-400" />
              <span>Meetings Register</span>
            </button>
            <button
              onClick={() => setActiveTab('directions')}
              className="px-3.5 py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-slate-950 text-xs font-bold rounded-lg shadow transition-all flex items-center gap-1.5"
            >
              <Compass className="w-4 h-4 text-slate-950" />
              <span>Issue Direction</span>
            </button>
          </div>
        </div>
      </div>

      {/* A. SUMMARY CARDS (8 dynamic metrics) */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        
        {/* Total Meetings */}
        <div 
          onClick={() => setActiveTab('meetings')}
          className="bg-[#0e192c] hover:bg-[#13223b] border border-[#1e3250] hover:border-amber-500/50 rounded-xl p-4 transition-all cursor-pointer shadow group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold text-slate-300">Total Meetings</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-100 font-mono">{kpis.totalMeetings}</div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
            <span>Official Records</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400 transition-colors" />
          </div>
        </div>

        {/* Total Directions Issued */}
        <div 
          onClick={() => setActiveTab('directions')}
          className="bg-[#0e192c] hover:bg-[#13223b] border border-[#1e3250] hover:border-amber-500/50 rounded-xl p-4 transition-all cursor-pointer shadow group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold text-slate-300">Directions Issued</span>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Compass className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-100 font-mono">{kpis.totalDirections}</div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
            <span>Active Mandates</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400 transition-colors" />
          </div>
        </div>

        {/* Pending Directions */}
        <div 
          onClick={() => setActiveTab('directions')}
          className="bg-[#0e192c] hover:bg-[#13223b] border border-[#1e3250] hover:border-amber-500/50 rounded-xl p-4 transition-all cursor-pointer shadow group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold text-slate-300">Pending Directions</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Hourglass className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-amber-300 font-mono">{kpis.pendingDirections}</div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
            <span>Work in Progress: {kpis.inProgressDirections}</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400 transition-colors" />
          </div>
        </div>

        {/* Completed Directions */}
        <div 
          onClick={() => setActiveTab('compliance')}
          className="bg-[#0e192c] hover:bg-[#13223b] border border-[#1e3250] hover:border-emerald-500/50 rounded-xl p-4 transition-all cursor-pointer shadow group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold text-slate-300">Completed Directions</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-400 font-mono">{kpis.completedDirections}</div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
            <span>Accepted & Verified</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 transition-colors" />
          </div>
        </div>

        {/* Overdue Directions (Critical dynamic metric) */}
        <div 
          onClick={() => { setActiveTab('compliance'); }}
          className={`border rounded-xl p-4 transition-all cursor-pointer shadow group ${
            kpis.overdueDirections > 0 
              ? 'bg-rose-950/30 hover:bg-rose-950/50 border-rose-800/60' 
              : 'bg-[#0e192c] hover:bg-[#13223b] border-[#1e3250]'
          }`}
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold text-rose-300">Overdue Directions</span>
            <div className="p-2 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/30">
              <AlertTriangle className="w-4 h-4 animate-pulse" />
            </div>
          </div>
          <div className="text-2xl font-bold text-rose-400 font-mono">{kpis.overdueDirections}</div>
          <div className="text-[11px] text-rose-300/80 mt-1 flex items-center justify-between">
            <span>Deadline Passed</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-rose-400" />
          </div>
        </div>

        {/* Directions Due This Week */}
        <div 
          onClick={() => setActiveTab('directions')}
          className="bg-[#0e192c] hover:bg-[#13223b] border border-[#1e3250] hover:border-amber-500/50 rounded-xl p-4 transition-all cursor-pointer shadow group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold text-slate-300">Due This Week</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-amber-400 font-mono">{kpis.dueThisWeekDirections}</div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
            <span>Within 48h: {kpis.dueIn48HoursDirections}</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400 transition-colors" />
          </div>
        </div>

        {/* Compliance Awaited */}
        <div 
          onClick={() => setActiveTab('compliance')}
          className="bg-[#0e192c] hover:bg-[#13223b] border border-[#1e3250] hover:border-amber-500/50 rounded-xl p-4 transition-all cursor-pointer shadow group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold text-slate-300">Compliance Awaited</span>
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <FileWarning className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-purple-300 font-mono">{kpis.complianceAwaitedDirections}</div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
            <span>Awaiting Report</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-purple-400 transition-colors" />
          </div>
        </div>

        {/* Meetings Requiring Follow-up */}
        <div 
          onClick={() => setActiveTab('meetings')}
          className="bg-[#0e192c] hover:bg-[#13223b] border border-[#1e3250] hover:border-amber-500/50 rounded-xl p-4 transition-all cursor-pointer shadow group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold text-slate-300">Meetings Follow-up</span>
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-cyan-300 font-mono">{kpis.meetingsRequiringFollowUp}</div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
            <span>Active Directives</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 transition-colors" />
          </div>
        </div>

      </div>

      {/* B & C. STATUS OVERVIEW & DIVISION PERFORMANCE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* B. Direction Status Overview (5 cols) */}
        <div className="lg:col-span-5 bg-[#0e192c] border border-[#1e3250] rounded-xl p-4 shadow flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#1b2d49]">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-slate-100">Direction Status Distribution</h3>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Dynamic Status</span>
            </div>

            <p className="text-[11px] text-slate-400 mt-2 mb-4">
              Real-time progression of directions across statutory review stages. Overdue is evaluated continuously against calendar deadlines.
            </p>

            {/* Status Bars */}
            <div className="space-y-3">
              {[
                { label: 'Pending', count: kpis.pendingDirections, color: 'bg-slate-400', textColor: 'text-slate-300' },
                { label: 'In Progress', count: kpis.inProgressDirections, color: 'bg-blue-500', textColor: 'text-blue-300' },
                { label: 'Compliance Submitted', count: kpis.complianceSubmittedDirections, color: 'bg-amber-500', textColor: 'text-amber-300' },
                { label: 'Under Review', count: kpis.underReviewDirections, color: 'bg-purple-500', textColor: 'text-purple-300' },
                { label: 'Completed', count: kpis.completedDirections, color: 'bg-emerald-500', textColor: 'text-emerald-300' },
                { label: 'Overdue', count: kpis.overdueDirections, color: 'bg-rose-500', textColor: 'text-rose-400' },
              ].map(st => {
                const total = kpis.totalDirections || 1;
                const percent = Math.round((st.count / total) * 100);

                return (
                  <div key={st.label} className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-300 font-medium">{st.label}</span>
                      <span className={`font-mono font-bold ${st.textColor}`}>
                        {st.count} <span className="text-[10px] text-slate-500 font-normal">({percent}%)</span>
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-[#14233c] overflow-hidden">
                      <div 
                        className={`h-full ${st.color} transition-all duration-500`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#182842] flex items-center justify-between text-[11px] text-slate-400">
            <span>Completed Rate:</span>
            <span className="font-mono font-bold text-emerald-400">
              {kpis.totalDirections > 0 ? Math.round((kpis.completedDirections / kpis.totalDirections) * 100) : 100}%
            </span>
          </div>
        </div>

        {/* C. Division-wise Performance (7 cols) */}
        <div className="lg:col-span-7 bg-[#0e192c] border border-[#1e3250] rounded-xl p-4 shadow">
          <div className="flex items-center justify-between pb-3 border-b border-[#1b2d49]">
            <div className="flex items-center gap-2">
              <Building className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-slate-100">Division-wise Performance</h3>
            </div>
            <button
              onClick={() => setActiveTab('divisions')}
              className="text-[11px] text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1"
            >
              <span>View All 9 Divisions</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#1c2e4d] text-slate-400 font-semibold text-[11px]">
                  <th className="py-2 px-2">Division</th>
                  <th className="py-2 px-2 text-center">Total</th>
                  <th className="py-2 px-2 text-center">Pending</th>
                  <th className="py-2 px-2 text-center">Completed</th>
                  <th className="py-2 px-2 text-center">Overdue</th>
                  <th className="py-2 px-2 text-right">Compliance Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#15233a]">
                {divisionPerformances.slice(0, 6).map(div => (
                  <tr 
                    key={div.division}
                    onClick={() => {
                      setSelectedDivisionFilter(div.division);
                      setActiveTab('directions');
                    }}
                    className="hover:bg-[#13223b] cursor-pointer transition-colors"
                  >
                    <td className="py-2 px-2 font-medium text-slate-200">
                      {div.division}
                    </td>
                    <td className="py-2 px-2 text-center font-mono text-slate-300">
                      {div.total_directions}
                    </td>
                    <td className="py-2 px-2 text-center font-mono text-amber-400">
                      {div.pending_directions + div.in_progress_directions}
                    </td>
                    <td className="py-2 px-2 text-center font-mono text-emerald-400">
                      {div.completed_directions}
                    </td>
                    <td className="py-2 px-2 text-center font-mono font-bold text-rose-400">
                      {div.overdue_directions > 0 ? div.overdue_directions : '-'}
                    </td>
                    <td className="py-2 px-2 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <span className="font-mono text-xs font-semibold text-slate-200">
                          {div.compliance_rate}%
                        </span>
                        <div className="w-12 h-1.5 rounded-full bg-[#172742] overflow-hidden">
                          <div 
                            className={`h-full ${div.compliance_rate >= 80 ? 'bg-emerald-500' : div.compliance_rate >= 50 ? 'bg-amber-500' : 'bg-rose-500'}`}
                            style={{ width: `${div.compliance_rate}%` }}
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* D. PRIORITY AND URGENCY SECTION */}
      <div className="bg-[#0e192c] border border-[#1e3250] rounded-xl p-4 shadow">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-[#1b2d49]">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-slate-100">Priority & Operational Urgency</h3>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            {[
              { id: 'overdue', label: `Overdue (${overdueDirections.length})`, count: overdueDirections.length, activeClass: 'bg-rose-950 text-rose-300 border-rose-700' },
              { id: 'high', label: `High Priority (${highPriorityDirections.length})`, count: highPriorityDirections.length, activeClass: 'bg-amber-950 text-amber-300 border-amber-700' },
              { id: 'due48', label: `Due in 48h (${dueIn48Directions.length})`, count: dueIn48Directions.length, activeClass: 'bg-yellow-950 text-yellow-300 border-yellow-700' },
              { id: 'review', label: `Awaiting Review (${awaitingReviewDirections.length})`, count: awaitingReviewDirections.length, activeClass: 'bg-blue-950 text-blue-300 border-blue-700' },
              { id: 'recent', label: 'Recently Issued', count: null, activeClass: 'bg-slate-800 text-slate-200 border-slate-600' },
            ].map(pill => (
              <button
                key={pill.id}
                onClick={() => setUrgencyTab(pill.id as any)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                  urgencyTab === pill.id
                    ? `${pill.activeClass} font-semibold shadow-sm`
                    : 'bg-[#121f35] border-[#1c2e4d] text-slate-400 hover:text-slate-200 hover:bg-[#162744]'
                }`}
              >
                {pill.label}
              </button>
            ))}
          </div>
        </div>

        {/* Urgent List */}
        <div className="mt-3">
          {currentUrgentList.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No directions currently in this urgency bracket.
            </div>
          ) : (
            <div className="space-y-2">
              {currentUrgentList.map(d => (
                <div
                  key={d.id}
                  onClick={() => {
                    setSelectedDirectionId(d.id);
                    setActiveTab('directions');
                  }}
                  className="p-3 rounded-lg bg-[#111e33] hover:bg-[#162742] border border-[#1d3150] transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-3 group"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs font-bold text-amber-400">{d.id}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                        d.priority === 'High' ? 'bg-rose-950 text-rose-300 border border-rose-800' :
                        d.priority === 'Medium' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                        'bg-slate-800 text-slate-300'
                      }`}>
                        {d.priority} Priority
                      </span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                        d.status === 'Completed' ? 'bg-emerald-950 text-emerald-300' :
                        d.status === 'Overdue' ? 'bg-rose-950 text-rose-300' :
                        'bg-blue-950 text-blue-300'
                      }`}>
                        {d.status}
                      </span>
                    </div>

                    <h4 className="text-xs font-semibold text-slate-100 group-hover:text-amber-300 transition-colors truncate">
                      {d.title}
                    </h4>
                    
                    <div className="text-[11px] text-slate-400 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span>Divisions: <strong className="text-slate-300">{d.responsible_divisions.join(', ')}</strong></span>
                      {d.responsible_field_offices && d.responsible_field_offices.length > 0 && (
                        <span>Field: <strong className="text-slate-300">{d.responsible_field_offices.join(', ')}</strong></span>
                      )}
                      <span>Officer: <strong className="text-slate-300">{d.responsible_officer}</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-4 text-xs font-mono">
                    <div className="text-right">
                      <div className="text-[10px] text-slate-400">Deadline</div>
                      <div className={`font-semibold ${d.status === 'Overdue' ? 'text-rose-400 font-bold' : 'text-slate-200'}`}>
                        {d.deadline}
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* E & F. RECENT MEETINGS & RECENT ACTIVITY FEED */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* E. Recent Meetings (7 cols) */}
        <div className="lg:col-span-7 bg-[#0e192c] border border-[#1e3250] rounded-xl p-4 shadow">
          <div className="flex items-center justify-between pb-3 border-b border-[#1b2d49]">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-slate-100">Latest Chaired Meetings</h3>
            </div>
            <button
              onClick={() => setActiveTab('meetings')}
              className="text-[11px] text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1"
            >
              <span>View All Meetings</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="mt-3 space-y-2.5">
            {recentMeetings.map(m => (
              <div
                key={m.id}
                onClick={() => {
                  setSelectedMeetingId(m.id);
                  setActiveTab('meetings');
                }}
                className="p-3 rounded-lg bg-[#111e33] hover:bg-[#152540] border border-[#1c2f4e] transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs font-bold text-amber-400">{m.id}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{m.date}</span>
                      <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.2 rounded">
                        {m.category}
                      </span>
                    </div>
                    <h4 className="text-xs font-semibold text-slate-100 group-hover:text-amber-300 transition-colors">
                      {m.title}
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">{m.subject}</p>
                  </div>
                  
                  <div className="text-right flex-shrink-0 font-mono text-[11px]">
                    <div className="text-slate-300">
                      <strong>{m.directionsIssued}</strong> directions
                    </div>
                    <div className="text-[10px] text-emerald-400">
                      {m.completed} completed
                    </div>
                    <div className="text-[10px] text-amber-400">
                      {m.pending} pending
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* F. Recent Chronological Activity Feed (5 cols) */}
        <div className="lg:col-span-5 bg-[#0e192c] border border-[#1e3250] rounded-xl p-4 shadow flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#1b2d49]">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-slate-100">Audit & Activity Log</h3>
              </div>
              <button
                onClick={() => setActiveTab('settings')}
                className="text-[10px] text-slate-400 hover:text-amber-400 font-mono"
              >
                Full Trail
              </button>
            </div>

            <div className="mt-3 space-y-3 max-h-96 overflow-y-auto pr-1">
              {activityLogs.slice(0, 7).map(act => (
                <div key={act.id} className="flex items-start gap-2.5 text-xs">
                  <div className="w-2 h-2 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-semibold text-slate-200 text-[11px]">{act.action}</span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {act.timestamp.includes('T') ? act.timestamp.split('T')[0] : act.timestamp}
                      </span>
                    </div>
                    <p className="text-[11px] text-amber-300/90 truncate font-mono">{act.entity_title}</p>
                    {act.remarks && (
                      <p className="text-[10px] text-slate-400 line-clamp-1">{act.remarks}</p>
                    )}
                    <div className="text-[9px] text-slate-500 mt-0.5">
                      By: {act.user_name}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-[#182842] text-[10px] text-slate-500 font-mono flex items-center justify-between">
            <span>Immutable Audit Trail Active</span>
            <span className="text-emerald-400">Logging 100% Actions</span>
          </div>
        </div>

      </div>

    </div>
  );
};
