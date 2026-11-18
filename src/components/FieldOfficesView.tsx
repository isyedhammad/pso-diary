import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { FIELD_OFFICES } from '../data/constants';
import { 
  MapPin, 
  Compass, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  ArrowRight,
  TrendingUp,
  FileText,
  Search
} from 'lucide-react';

export const FieldOfficesView: React.FC = () => {
  const { 
    fieldOfficePerformances, 
    directions, 
    setSelectedDirectionId, 
    setActiveTab 
  } = useApp();

  const [selectedOffice, setSelectedOffice] = useState<string>(FIELD_OFFICES[0]);
  const [search, setSearch] = useState('');

  const assignedDirections = directions.filter(d => 
    !d.is_archived && 
    d.responsible_divisions.includes('Field Offices') &&
    (d.responsible_field_offices?.includes(selectedOffice) || !d.responsible_field_offices || d.responsible_field_offices.length === 0)
  );

  const filteredOffices = fieldOfficePerformances.filter(f => 
    f.field_office.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Header */}
      <div className="pb-2 border-b border-[#1b2d49] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-100 font-serif">
            Field Formations Compliance Monitoring
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Regional surveillance across all 15 field offices, mining inspectorates, and field operations throughout Punjab.
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search field office..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#070d18] text-xs text-slate-200 pl-9 pr-3 py-1.5 rounded-lg border border-[#1e3250] focus:border-amber-500 focus:outline-none"
          />
        </div>
      </div>

      {/* 15 Field Formations Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {filteredOffices.map(fo => {
          const isSelected = selectedOffice === fo.field_office;

          return (
            <div
              key={fo.field_office}
              onClick={() => setSelectedOffice(fo.field_office)}
              className={`p-3 rounded-xl border transition-all cursor-pointer shadow group ${
                isSelected 
                  ? 'bg-[#13223b] border-amber-500/70 ring-1 ring-amber-500/40' 
                  : 'bg-[#0e192c] border-[#1e3250] hover:bg-[#122036] hover:border-slate-600'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-slate-100 group-hover:text-amber-300 truncate">
                  {fo.field_office}
                </span>
                <MapPin className={`w-3.5 h-3.5 ${isSelected ? 'text-amber-400' : 'text-slate-500'}`} />
              </div>

              <div className="flex justify-between items-center text-xs font-mono py-1 border-t border-[#1a2c47] my-1">
                <span className="text-slate-400 text-[10px]">Total:</span>
                <span className="font-bold text-slate-200">{fo.total_directions}</span>
              </div>

              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-slate-400 text-[10px]">Overdue:</span>
                <span className={`font-bold ${fo.overdue_directions > 0 ? 'text-rose-400' : 'text-slate-400'}`}>
                  {fo.overdue_directions}
                </span>
              </div>

              <div className="mt-2 w-full h-1 bg-[#172740] rounded-full overflow-hidden">
                <div 
                  className={`h-full ${fo.compliance_rate >= 80 ? 'bg-emerald-500' : fo.compliance_rate >= 50 ? 'bg-amber-500' : 'bg-rose-500'}`}
                  style={{ width: `${fo.compliance_rate}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Field Office Detailed Directives */}
      <div className="bg-[#0e192c] border border-[#1e3250] rounded-xl p-5 shadow space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1b2d49]">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="text-base font-bold text-slate-100 font-serif">
                Field Office {selectedOffice} — Active Field Directives
              </h3>
              <p className="text-xs text-slate-400">
                {assignedDirections.length} directions assigned for regional execution in {selectedOffice}
              </p>
            </div>
          </div>
        </div>

        {assignedDirections.length === 0 ? (
          <div className="p-8 rounded-lg bg-[#091220] border border-dashed border-[#1c2e4b] text-center text-xs text-slate-400">
            No active directions assigned directly to Field Office {selectedOffice}.
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
                    Assigned Officer: <strong>{d.responsible_officer}</strong>
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
