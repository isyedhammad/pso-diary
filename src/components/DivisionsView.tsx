import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { DEPARTMENTAL_DIVISIONS } from '../data/constants';
import { 
  Building2, 
  Compass, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  ArrowRight,
  TrendingUp,
  FileText,
  UserCheck
} from 'lucide-react';

export const DivisionsView: React.FC = () => {
  const { 
    divisionPerformances, 
    directions, 
    setSelectedDivisionFilter, 
    setSelectedDirectionId, 
    setActiveTab 
  } = useApp();

  const [selectedDivision, setSelectedDivision] = useState<string>(DEPARTMENTAL_DIVISIONS[0]);

  const activePerf = divisionPerformances.find(d => d.division === selectedDivision) || divisionPerformances[0];
  const assignedDirections = directions.filter(d => 
    !d.is_archived && d.responsible_divisions.includes(selectedDivision)
  );

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Header */}
      <div className="pb-2 border-b border-[#1b2d49]">
        <h2 className="text-xl font-bold text-slate-100 font-serif">
          Departmental Divisions Directory & Performance
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Monitoring compliance, workload allocation, and resolution efficiency across all 9 principal divisions of the Directorate General.
        </p>
      </div>

      {/* 9 Divisions Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {divisionPerformances.map(div => {
          const isSelected = selectedDivision === div.division;

          return (
            <div
              key={div.division}
              onClick={() => setSelectedDivision(div.division)}
              className={`p-4 rounded-xl border transition-all cursor-pointer shadow group ${
                isSelected 
                  ? 'bg-[#13223b] border-amber-500/70 ring-1 ring-amber-500/40' 
                  : 'bg-[#0e192c] border-[#1e3250] hover:bg-[#122036] hover:border-slate-600'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-100 group-hover:text-amber-300 transition-colors">
                  {div.division}
                </span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                  div.compliance_rate >= 80 ? 'bg-emerald-950 text-emerald-300' :
                  div.compliance_rate >= 50 ? 'bg-amber-950 text-amber-300' :
                  'bg-rose-950 text-rose-300'
                }`}>
                  {div.compliance_rate}% Rate
                </span>
              </div>

              {/* Mini Stats Grid */}
              <div className="grid grid-cols-4 gap-1.5 py-2 border-t border-b border-[#1a2c47] my-2 text-center text-xs font-mono">
                <div>
                  <div className="text-[10px] text-slate-400">Total</div>
                  <div className="font-bold text-slate-200">{div.total_directions}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400">Pending</div>
                  <div className="font-bold text-amber-400">{div.pending_directions + div.in_progress_directions}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400">Done</div>
                  <div className="font-bold text-emerald-400">{div.completed_directions}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400">Overdue</div>
                  <div className={`font-bold ${div.overdue_directions > 0 ? 'text-rose-400' : 'text-slate-400'}`}>
                    {div.overdue_directions}
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-2 space-y-1">
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>Compliance Progress</span>
                  <span>{div.completed_directions} / {div.total_directions || 1}</span>
                </div>
                <div className="w-full h-1.5 bg-[#172740] rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${div.compliance_rate >= 80 ? 'bg-emerald-500' : div.compliance_rate >= 50 ? 'bg-amber-500' : 'bg-rose-500'}`}
                    style={{ width: `${div.compliance_rate}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Division Detailed Mandates */}
      <div className="bg-[#0e192c] border border-[#1e3250] rounded-xl p-5 shadow space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1b2d49]">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="text-base font-bold text-slate-100 font-serif">
                {selectedDivision} — Active Directives Ledger
              </h3>
              <p className="text-xs text-slate-400">
                {assignedDirections.length} directions assigned to this division
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setSelectedDivisionFilter(selectedDivision);
              setActiveTab('directions');
            }}
            className="px-3.5 py-1.5 bg-[#12223a] hover:bg-[#1a3254] border border-[#233d66] text-amber-300 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow"
          >
            <span>Open in Directions Manager</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {assignedDirections.length === 0 ? (
          <div className="p-8 rounded-lg bg-[#091220] border border-dashed border-[#1c2e4b] text-center text-xs text-slate-400">
            No active directions assigned to {selectedDivision}.
          </div>
        ) : (
          <div className="space-y-2.5">
            {assignedDirections.map(d => (
              <div
                key={d.id}
                onClick={() => {
                  setSelectedDirectionId(d.id);
                  setActiveTab('directions');
                }}
                className="p-3.5 rounded-lg bg-[#091220] hover:bg-[#111e33] border border-[#1c2e4b] transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-3 group"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-bold text-amber-400">{d.id}</span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                      d.priority === 'High' ? 'bg-rose-950 text-rose-300 border border-rose-800' :
                      d.priority === 'Medium' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                      'bg-slate-800 text-slate-300'
                    }`}>
                      {d.priority} Priority
                    </span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                      d.status === 'Completed' ? 'bg-emerald-950 text-emerald-300' :
                      d.status === 'Overdue' ? 'bg-rose-950 text-rose-300' :
                      'bg-blue-950 text-blue-300'
                    }`}>
                      {d.status}
                    </span>
                  </div>

                  <h4 className="text-xs font-semibold text-slate-100 group-hover:text-amber-300 truncate">
                    {d.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                    Deliverable: {d.expected_deliverable}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Responsible Officer: <strong>{d.responsible_officer}</strong>
                  </p>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-4 text-xs font-mono text-right flex-shrink-0">
                  <div>
                    <div className="text-[10px] text-slate-400">Deadline</div>
                    <div className={d.status === 'Overdue' ? 'text-rose-400 font-bold' : 'text-slate-200'}>
                      {d.deadline}
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
