import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { DEPARTMENTAL_DIVISIONS, FIELD_OFFICES } from '../data/constants';
import { 
  BarChart3, 
  Download, 
  Printer, 
  Calendar, 
  Building2, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  FileSpreadsheet,
  Layers,
  ChevronRight
} from 'lucide-react';

export const ReportsView: React.FC = () => {
  const { 
    meetings, 
    directions, 
    divisionPerformances, 
    fieldOfficePerformances,
    kpis 
  } = useApp();

  const [activeReport, setActiveReport] = useState<'meeting' | 'division' | 'field' | 'pending' | 'monthly'>('meeting');
  const [dateFrom, setDateFrom] = useState('2026-01-01');
  const [dateTo, setDateTo] = useState('2026-12-31');

  const todayStr = new Date().toISOString().split('T')[0];

  // A. Meeting-wise Report
  const meetingReportData = useMemo(() => {
    return meetings
      .filter(m => !m.is_archived && m.date >= dateFrom && m.date <= dateTo)
      .map(m => {
        const rel = directions.filter(d => d.meeting_id === m.id && !d.is_archived);
        const completed = rel.filter(d => d.status === 'Completed').length;
        const overdue = rel.filter(d => d.status === 'Overdue' || (d.status !== 'Completed' && d.deadline && d.deadline < todayStr)).length;
        const pending = rel.length - completed;

        return {
          id: m.id,
          title: m.title,
          date: m.date,
          chairperson: m.chairperson,
          category: m.category,
          total_directions: rel.length,
          completed,
          pending,
          overdue,
          rate: rel.length > 0 ? Math.round((completed / rel.length) * 100) : 100
        };
      });
  }, [meetings, directions, dateFrom, dateTo]);

  // D. Pending Directions Consolidated List
  const pendingReportData = useMemo(() => {
    return directions
      .filter(d => !d.is_archived && d.status !== 'Completed')
      .map(d => ({
        id: d.id,
        meeting_id: d.meeting_id,
        title: d.title,
        division: d.responsible_divisions.join(', '),
        field_office: d.responsible_field_offices?.join(', ') || '-',
        officer: d.responsible_officer,
        priority: d.priority,
        deadline: d.deadline,
        status: d.status,
        submissions_count: d.compliance_submissions.length
      }));
  }, [directions]);

  // E. Monthly Performance Calculation
  const monthlyData = useMemo(() => {
    const months = ['2026-09', '2026-10', '2026-11'];
    return months.map(month => {
      const mtgs = meetings.filter(m => m.date.startsWith(month));
      const dirs = directions.filter(d => d.issuance_date.startsWith(month));
      const completed = dirs.filter(d => d.status === 'Completed').length;
      const overdue = dirs.filter(d => d.status === 'Overdue' || (d.status !== 'Completed' && d.deadline && d.deadline < todayStr)).length;
      const pending = dirs.length - completed;
      const rate = dirs.length > 0 ? Math.round((completed / dirs.length) * 100) : 100;

      return {
        month,
        meetings_held: mtgs.length,
        directions_issued: dirs.length,
        completed,
        pending,
        overdue,
        compliance_rate: rate
      };
    });
  }, [meetings, directions]);

  // Export to CSV Function
  const exportToCsv = () => {
    let headers: string[] = [];
    let rows: string[][] = [];
    let filename = `DGMM_Report_${activeReport}_${todayStr}.csv`;

    if (activeReport === 'meeting') {
      headers = ['Meeting ID', 'Title', 'Date', 'Chairperson', 'Category', 'Directions Issued', 'Completed', 'Pending', 'Overdue', 'Compliance Rate (%)'];
      rows = meetingReportData.map(m => [
        `"${m.id}"`, `"${m.title}"`, `"${m.date}"`, `"${m.chairperson}"`, `"${m.category}"`,
        m.total_directions.toString(), m.completed.toString(), m.pending.toString(), m.overdue.toString(), `${m.rate}%`
      ]);
    } else if (activeReport === 'division') {
      headers = ['Division', 'Total Directions', 'Pending', 'Completed', 'Overdue', 'Compliance Rate (%)'];
      rows = divisionPerformances.map(d => [
        `"${d.division}"`, d.total_directions.toString(), (d.pending_directions + d.in_progress_directions).toString(),
        d.completed_directions.toString(), d.overdue_directions.toString(), `${d.compliance_rate}%`
      ]);
    } else if (activeReport === 'field') {
      headers = ['Field Formation', 'Total Directions', 'Pending', 'Completed', 'Overdue', 'Compliance Rate (%)'];
      rows = fieldOfficePerformances.map(f => [
        `"${f.field_office}"`, f.total_directions.toString(), f.pending_directions.toString(),
        f.completed_directions.toString(), f.overdue_directions.toString(), `${f.compliance_rate}%`
      ]);
    } else if (activeReport === 'pending') {
      headers = ['Direction ID', 'Meeting Reference', 'Title', 'Division', 'Field Office', 'Officer', 'Priority', 'Deadline', 'Status'];
      rows = pendingReportData.map(p => [
        `"${p.id}"`, `"${p.meeting_id}"`, `"${p.title}"`, `"${p.division}"`, `"${p.field_office}"`,
        `"${p.officer}"`, `"${p.priority}"`, `"${p.deadline}"`, `"${p.status}"`
      ]);
    } else if (activeReport === 'monthly') {
      headers = ['Month', 'Meetings Held', 'Directions Issued', 'Completed', 'Pending', 'Overdue', 'Compliance Rate (%)'];
      rows = monthlyData.map(m => [
        `"${m.month}"`, m.meetings_held.toString(), m.directions_issued.toString(),
        m.completed.toString(), m.pending.toString(), m.overdue.toString(), `${m.compliance_rate}%`
      ]);
    }

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Executive Print View
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Header */}
      <div className="pb-2 border-b border-[#1b2d49] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 font-serif">
            Executive Reports & Analytics
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Statistical monitoring reports, division compliance metrics, and downloadable executive summaries.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportToCsv}
            className="px-3.5 py-2 bg-[#12223a] hover:bg-[#1a3254] border border-[#233d66] text-amber-300 text-xs font-semibold rounded-lg shadow transition-colors flex items-center gap-1.5"
          >
            <Download className="w-4 h-4 text-amber-400" />
            <span>Export to Excel/CSV</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-3.5 py-2 bg-[#12223a] hover:bg-[#1a3254] border border-[#233d66] text-slate-200 text-xs font-semibold rounded-lg shadow transition-colors flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4 text-emerald-400" />
            <span>Print / PDF View</span>
          </button>
        </div>
      </div>

      {/* Report Selection Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto p-1.5 bg-[#0e192c] border border-[#1e3250] rounded-xl text-xs font-medium">
        {[
          { id: 'meeting', label: 'Meeting-wise Report', icon: Calendar },
          { id: 'division', label: 'Division-wise Compliance (9)', icon: Building2 },
          { id: 'field', label: 'Field Formations (15)', icon: MapPin },
          { id: 'pending', label: `Pending & Overdue Directives (${kpis.pendingDirections})`, icon: Clock },
          { id: 'monthly', label: 'Monthly Performance Rollup', icon: BarChart3 },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeReport === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveReport(tab.id as any)}
              className={`px-3 py-2 rounded-lg flex items-center gap-2 whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-amber-600/20 text-amber-300 border border-amber-600/50 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#132238]'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Date Filter Bar for Meeting Report */}
      {activeReport === 'meeting' && (
        <div className="p-3 bg-[#0e192c] border border-[#1e3250] rounded-xl flex items-center gap-3 text-xs">
          <span className="text-slate-400 font-semibold">Reporting Period:</span>
          <div className="flex items-center gap-2">
            <span className="text-slate-400">From</span>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="bg-[#070d18] text-slate-200 px-2.5 py-1.5 rounded border border-[#1e3250] focus:border-amber-500 focus:outline-none"
            />
            <span className="text-slate-400">To</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="bg-[#070d18] text-slate-200 px-2.5 py-1.5 rounded border border-[#1e3250] focus:border-amber-500 focus:outline-none"
            />
          </div>
        </div>
      )}

      {/* REPORT CONTENT TABLES */}
      <div className="bg-[#0e192c] border border-[#1e3250] rounded-xl overflow-hidden shadow">
        
        {/* A. Meeting-wise Report Table */}
        {activeReport === 'meeting' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#091220] border-b border-[#1c2e4d] text-slate-400 font-semibold text-[11px] uppercase tracking-wider font-mono">
                  <th className="py-3 px-3">Meeting ID</th>
                  <th className="py-3 px-3">Meeting Title</th>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3 text-center">Issued</th>
                  <th className="py-3 px-3 text-center">Completed</th>
                  <th className="py-3 px-3 text-center">Pending</th>
                  <th className="py-3 px-3 text-center">Overdue</th>
                  <th className="py-3 px-3 text-right">Compliance Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#15233a]">
                {meetingReportData.map(m => (
                  <tr key={m.id} className="hover:bg-[#13223b] transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-amber-400">{m.id}</td>
                    <td className="py-3 px-3 font-semibold text-slate-100">{m.title}</td>
                    <td className="py-3 px-3 font-mono text-slate-400">{m.date}</td>
                    <td className="py-3 px-3 text-slate-300">{m.category}</td>
                    <td className="py-3 px-3 text-center font-mono font-bold text-slate-200">{m.total_directions}</td>
                    <td className="py-3 px-3 text-center font-mono font-bold text-emerald-400">{m.completed}</td>
                    <td className="py-3 px-3 text-center font-mono font-bold text-amber-400">{m.pending}</td>
                    <td className="py-3 px-3 text-center font-mono font-bold text-rose-400">{m.overdue > 0 ? m.overdue : '-'}</td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-emerald-400">{m.rate}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* B. Division-wise Compliance Report Table */}
        {activeReport === 'division' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#091220] border-b border-[#1c2e4d] text-slate-400 font-semibold text-[11px] uppercase tracking-wider font-mono">
                  <th className="py-3 px-3">Departmental Division</th>
                  <th className="py-3 px-3 text-center">Total Assigned</th>
                  <th className="py-3 px-3 text-center">Pending</th>
                  <th className="py-3 px-3 text-center">In Progress</th>
                  <th className="py-3 px-3 text-center">Completed</th>
                  <th className="py-3 px-3 text-center">Overdue</th>
                  <th className="py-3 px-3 text-right">Compliance Rate (%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#15233a]">
                {divisionPerformances.map(div => (
                  <tr key={div.division} className="hover:bg-[#13223b] transition-colors">
                    <td className="py-3 px-3 font-bold text-slate-100">{div.division}</td>
                    <td className="py-3 px-3 text-center font-mono font-bold text-slate-200">{div.total_directions}</td>
                    <td className="py-3 px-3 text-center font-mono text-slate-300">{div.pending_directions}</td>
                    <td className="py-3 px-3 text-center font-mono text-blue-400">{div.in_progress_directions}</td>
                    <td className="py-3 px-3 text-center font-mono text-emerald-400 font-bold">{div.completed_directions}</td>
                    <td className="py-3 px-3 text-center font-mono text-rose-400 font-bold">{div.overdue_directions > 0 ? div.overdue_directions : '-'}</td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-emerald-400">{div.compliance_rate}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* C. Field Office Compliance Report Table */}
        {activeReport === 'field' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#091220] border-b border-[#1c2e4d] text-slate-400 font-semibold text-[11px] uppercase tracking-wider font-mono">
                  <th className="py-3 px-3">Field Formation</th>
                  <th className="py-3 px-3 text-center">Total Mandates</th>
                  <th className="py-3 px-3 text-center">Pending</th>
                  <th className="py-3 px-3 text-center">Completed</th>
                  <th className="py-3 px-3 text-center">Overdue</th>
                  <th className="py-3 px-3 text-right">Compliance Rate (%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#15233a]">
                {fieldOfficePerformances.map(fo => (
                  <tr key={fo.field_office} className="hover:bg-[#13223b] transition-colors">
                    <td className="py-3 px-3 font-bold text-slate-100">{fo.field_office}</td>
                    <td className="py-3 px-3 text-center font-mono font-bold text-slate-200">{fo.total_directions}</td>
                    <td className="py-3 px-3 text-center font-mono text-amber-400">{fo.pending_directions}</td>
                    <td className="py-3 px-3 text-center font-mono text-emerald-400 font-bold">{fo.completed_directions}</td>
                    <td className="py-3 px-3 text-center font-mono text-rose-400 font-bold">{fo.overdue_directions > 0 ? fo.overdue_directions : '-'}</td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-emerald-400">{fo.compliance_rate}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* D. Pending Directions Consolidated List */}
        {activeReport === 'pending' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#091220] border-b border-[#1c2e4d] text-slate-400 font-semibold text-[11px] uppercase tracking-wider font-mono">
                  <th className="py-3 px-3">Direction ID</th>
                  <th className="py-3 px-3">Title</th>
                  <th className="py-3 px-3">Division</th>
                  <th className="py-3 px-3">Field Office</th>
                  <th className="py-3 px-3">Responsible Officer</th>
                  <th className="py-3 px-3">Priority</th>
                  <th className="py-3 px-3">Deadline</th>
                  <th className="py-3 px-3">Current Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#15233a]">
                {pendingReportData.map(p => (
                  <tr key={p.id} className="hover:bg-[#13223b] transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-amber-400">{p.id}</td>
                    <td className="py-3 px-3 font-semibold text-slate-100 max-w-xs truncate">{p.title}</td>
                    <td className="py-3 px-3 text-slate-300">{p.division}</td>
                    <td className="py-3 px-3 font-mono text-slate-400">{p.field_office}</td>
                    <td className="py-3 px-3 text-slate-300">{p.officer}</td>
                    <td className="py-3 px-3 font-mono">{p.priority}</td>
                    <td className={`py-3 px-3 font-mono font-bold ${p.status === 'Overdue' ? 'text-rose-400' : 'text-slate-200'}`}>
                      {p.deadline}
                    </td>
                    <td className="py-3 px-3 font-semibold">{p.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* E. Monthly Performance Rollup */}
        {activeReport === 'monthly' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#091220] border-b border-[#1c2e4d] text-slate-400 font-semibold text-[11px] uppercase tracking-wider font-mono">
                  <th className="py-3 px-3">Calendar Month</th>
                  <th className="py-3 px-3 text-center">Meetings Held</th>
                  <th className="py-3 px-3 text-center">Directions Issued</th>
                  <th className="py-3 px-3 text-center">Completed</th>
                  <th className="py-3 px-3 text-center">Pending</th>
                  <th className="py-3 px-3 text-center">Overdue</th>
                  <th className="py-3 px-3 text-right">Compliance Rate (%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#15233a]">
                {monthlyData.map(m => (
                  <tr key={m.month} className="hover:bg-[#13223b] transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-slate-100">{m.month}</td>
                    <td className="py-3 px-3 text-center font-mono font-bold text-slate-200">{m.meetings_held}</td>
                    <td className="py-3 px-3 text-center font-mono font-bold text-amber-400">{m.directions_issued}</td>
                    <td className="py-3 px-3 text-center font-mono font-bold text-emerald-400">{m.completed}</td>
                    <td className="py-3 px-3 text-center font-mono text-slate-300">{m.pending}</td>
                    <td className="py-3 px-3 text-center font-mono font-bold text-rose-400">{m.overdue > 0 ? m.overdue : '-'}</td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-emerald-400">{m.compliance_rate}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>

    </div>
  );
};
