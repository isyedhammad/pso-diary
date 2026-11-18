import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Direction, DocumentItem } from '../types';
import { DEPARTMENTAL_DIVISIONS, FIELD_OFFICES, DIRECTION_STATUSES, PRIORITY_LEVELS } from '../data/constants';
import { StorageService } from '../services/storageService';
import { 
  CheckSquare, 
  Search, 
  Filter, 
  AlertTriangle, 
  Clock, 
  Upload, 
  ShieldCheck, 
  RotateCcw, 
  Bell, 
  ChevronRight, 
  FileText, 
  Download, 
  Eye,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowUpRight
} from 'lucide-react';

export const ComplianceView: React.FC = () => {
  const { 
    directions, 
    meetings, 
    submitCompliance, 
    reviewCompliance, 
    logReminder, 
    setSelectedDirectionId, 
    setActiveTab,
    currentUser,
    kpis
  } = useApp();

  const [search, setSearch] = useState('');
  const [divisionFilter, setDivisionFilter] = useState<string>('all');
  const [fieldOfficeFilter, setFieldOfficeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [overdueOnly, setOverdueOnly] = useState<boolean>(false);
  const [approachingOnly, setApproachingOnly] = useState<boolean>(false);
  const [noProgressOnly, setNoProgressOnly] = useState<boolean>(false);
  const [returnedOnly, setReturnedOnly] = useState<boolean>(false);

  // Modals state
  const [activeDirectionForSubmit, setActiveDirectionForSubmit] = useState<Direction | null>(null);
  const [activeDirectionForReview, setActiveDirectionForReview] = useState<Direction | null>(null);
  const [activeSubmissionId, setActiveSubmissionId] = useState<string | null>(null);
  const [activeDirectionForReminder, setActiveDirectionForReminder] = useState<Direction | null>(null);

  // Submission Form State
  const [progressRemarks, setProgressRemarks] = useState('');
  const [completionPercentage, setCompletionPercentage] = useState<number>(100);
  const [remainingAction, setRemainingAction] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<DocumentItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // Review Form State
  const [reviewAction, setReviewAction] = useState<'Accepted' | 'Returned' | 'Under Review'>('Accepted');
  const [reviewRemarks, setReviewRemarks] = useState('');
  const [markCompleted, setMarkCompleted] = useState(true);

  // Reminder Form State
  const [reminderRecipient, setReminderRecipient] = useState('');
  const [reminderNotes, setReminderNotes] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];
  const next7Days = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  // Filtering Directions
  const filteredDirections = directions.filter(d => {
    if (d.is_archived) return false;

    const matchSearch = 
      d.id.toLowerCase().includes(search.toLowerCase()) ||
      d.title.toLowerCase().includes(search.toLowerCase()) ||
      d.description.toLowerCase().includes(search.toLowerCase()) ||
      d.responsible_officer.toLowerCase().includes(search.toLowerCase()) ||
      (d.meeting_title && d.meeting_title.toLowerCase().includes(search.toLowerCase()));

    const matchDivision = divisionFilter === 'all' || d.responsible_divisions.includes(divisionFilter);
    const matchFieldOffice = fieldOfficeFilter === 'all' || 
      (d.responsible_field_offices && d.responsible_field_offices.includes(fieldOfficeFilter));

    const matchStatus = statusFilter === 'all' || d.status === statusFilter;
    const matchPriority = priorityFilter === 'all' || d.priority === priorityFilter;

    const isOverdue = d.status === 'Overdue' || (d.status !== 'Completed' && d.deadline && d.deadline < todayStr);
    const isApproaching = d.status !== 'Completed' && d.deadline && d.deadline >= todayStr && d.deadline <= next7Days;
    const hasNoProgress = d.compliance_submissions.length === 0 && d.status !== 'Completed';
    const isReturned = d.compliance_submissions.some(s => s.review_status === 'Returned') && d.status !== 'Completed';

    if (overdueOnly && !isOverdue) return false;
    if (approachingOnly && !isApproaching) return false;
    if (noProgressOnly && !hasNoProgress) return false;
    if (returnedOnly && !isReturned) return false;

    return matchSearch && matchDivision && matchFieldOffice && matchStatus && matchPriority;
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!activeDirectionForSubmit || !e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setIsUploading(true);

    try {
      const docItem = await StorageService.uploadDocument(file, {
        direction_id: activeDirectionForSubmit.id,
        file_type: 'Compliance Report',
        uploaded_by: currentUser.name,
        description: `Compliance documentation for ${activeDirectionForSubmit.id}`
      });
      setUploadedFiles(prev => [...prev, docItem]);
    } catch (err) {
      console.error('File upload error:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDirectionForSubmit || !progressRemarks.trim()) return;

    await submitCompliance(activeDirectionForSubmit.id, {
      progress_remarks: progressRemarks,
      percentage_of_completion: completionPercentage,
      remaining_action_required: remainingAction,
      files: uploadedFiles
    });

    setActiveDirectionForSubmit(null);
    setProgressRemarks('');
    setRemainingAction('');
    setUploadedFiles([]);
  };

  const handleSaveReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDirectionForReview || !activeSubmissionId || !reviewRemarks.trim()) return;

    await reviewCompliance(
      activeDirectionForReview.id,
      activeSubmissionId,
      reviewAction,
      reviewRemarks,
      reviewAction === 'Accepted' && markCompleted
    );

    setActiveDirectionForReview(null);
    setActiveSubmissionId(null);
    setReviewRemarks('');
  };

  const handleSaveReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDirectionForReminder || !reminderRecipient.trim()) return;

    await logReminder(activeDirectionForReminder.id, reminderRecipient, reminderNotes);
    setActiveDirectionForReminder(null);
    setReminderRecipient('');
    setReminderNotes('');
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-[#1b2d49]">
        <div>
          <h2 className="text-xl font-bold text-slate-100 font-serif">
            Compliance Monitoring Register
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Executive monitoring of direction implementation, progress submissions, and statutory compliance reviews.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono px-3 py-1.5 rounded-lg bg-[#0e192c] border border-[#1e3250] text-slate-300">
            Total Monitored: <strong className="text-amber-400">{directions.length}</strong>
          </span>
        </div>
      </div>

      {/* E. Reminders & Urgency Banner Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={() => {
            setOverdueOnly(!overdueOnly);
            setApproachingOnly(false);
            setNoProgressOnly(false);
            setReturnedOnly(false);
          }}
          className={`p-3 rounded-xl border text-left transition-all ${
            overdueOnly 
              ? 'bg-rose-950/70 border-rose-700 shadow-md' 
              : 'bg-[#0e192c] border-[#1e3250] hover:border-rose-500/50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-300">Overdue Directions</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-xl font-bold font-mono text-rose-400 mt-1">{kpis.overdueDirections}</div>
          <span className="text-[10px] text-slate-400">Click to filter</span>
        </button>

        <button
          onClick={() => {
            setApproachingOnly(!approachingOnly);
            setOverdueOnly(false);
            setNoProgressOnly(false);
            setReturnedOnly(false);
          }}
          className={`p-3 rounded-xl border text-left transition-all ${
            approachingOnly 
              ? 'bg-amber-950/70 border-amber-700 shadow-md' 
              : 'bg-[#0e192c] border-[#1e3250] hover:border-amber-500/50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-300">Approaching (7 Days)</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl font-bold font-mono text-amber-300 mt-1">{kpis.dueThisWeekDirections}</div>
          <span className="text-[10px] text-slate-400">Due soon</span>
        </button>

        <button
          onClick={() => {
            setNoProgressOnly(!noProgressOnly);
            setOverdueOnly(false);
            setApproachingOnly(false);
            setReturnedOnly(false);
          }}
          className={`p-3 rounded-xl border text-left transition-all ${
            noProgressOnly 
              ? 'bg-purple-950/70 border-purple-700 shadow-md' 
              : 'bg-[#0e192c] border-[#1e3250] hover:border-purple-500/50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-purple-300">No Submission Filed</span>
            <AlertTriangle className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-xl font-bold font-mono text-purple-300 mt-1">
            {directions.filter(d => !d.is_archived && d.status !== 'Completed' && d.compliance_submissions.length === 0).length}
          </div>
          <span className="text-[10px] text-slate-400">Requires follow-up</span>
        </button>

        <button
          onClick={() => {
            setReturnedOnly(!returnedOnly);
            setOverdueOnly(false);
            setApproachingOnly(false);
            setNoProgressOnly(false);
          }}
          className={`p-3 rounded-xl border text-left transition-all ${
            returnedOnly 
              ? 'bg-cyan-950/70 border-cyan-700 shadow-md' 
              : 'bg-[#0e192c] border-[#1e3250] hover:border-cyan-500/50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-cyan-300">Returned for Action</span>
            <RotateCcw className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-xl font-bold font-mono text-cyan-300 mt-1">
            {directions.filter(d => !d.is_archived && d.compliance_submissions.some(s => s.review_status === 'Returned') && d.status !== 'Completed').length}
          </div>
          <span className="text-[10px] text-slate-400">Deficiencies noted</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-[#0e192c] border border-[#1e3250] rounded-xl p-3.5 shadow space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by direction ID, title, officer, division, meeting..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#070d18] text-xs text-slate-200 pl-9 pr-4 py-2 rounded-lg border border-[#1e3250] focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <select
              value={divisionFilter}
              onChange={(e) => setDivisionFilter(e.target.value)}
              className="bg-[#070d18] text-slate-300 px-3 py-2 rounded-lg border border-[#1e3250] focus:border-amber-500 focus:outline-none"
            >
              <option value="all">All Divisions (9)</option>
              {DEPARTMENTAL_DIVISIONS.map(div => (
                <option key={div} value={div}>{div}</option>
              ))}
            </select>

            {divisionFilter === 'Field Offices' && (
              <select
                value={fieldOfficeFilter}
                onChange={(e) => setFieldOfficeFilter(e.target.value)}
                className="bg-[#070d18] text-amber-300 px-3 py-2 rounded-lg border border-amber-600/50 focus:border-amber-500 focus:outline-none"
              >
                <option value="all">All 15 Field Formations</option>
                {FIELD_OFFICES.map(fo => (
                  <option key={fo} value={fo}>{fo}</option>
                ))}
              </select>
            )}

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#070d18] text-slate-300 px-3 py-2 rounded-lg border border-[#1e3250] focus:border-amber-500 focus:outline-none"
            >
              <option value="all">All Statuses</option>
              {DIRECTION_STATUSES.map(st => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-[#070d18] text-slate-300 px-3 py-2 rounded-lg border border-[#1e3250] focus:border-amber-500 focus:outline-none"
            >
              <option value="all">All Priorities</option>
              {PRIORITY_LEVELS.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* A. COMPLIANCE REGISTER TABLE */}
      <div className="bg-[#0e192c] border border-[#1e3250] rounded-xl overflow-hidden shadow">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#091220] border-b border-[#1c2e4d] text-slate-400 font-semibold text-[11px] uppercase tracking-wider font-mono">
                <th className="py-3 px-3">Direction ID</th>
                <th className="py-3 px-3">Meeting Title</th>
                <th className="py-3 px-3">Date Issued</th>
                <th className="py-3 px-3">Direction Summary</th>
                <th className="py-3 px-3">Division</th>
                <th className="py-3 px-3">Field Office</th>
                <th className="py-3 px-3">Officer</th>
                <th className="py-3 px-3">Deadline</th>
                <th className="py-3 px-3">Priority</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#15233a]">
              {filteredDirections.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-400">
                    No compliance records found matching the active criteria.
                  </td>
                </tr>
              ) : (
                filteredDirections.map(d => {
                  const latestSubmission = d.compliance_submissions[0];
                  const isAwaitingReview = latestSubmission && latestSubmission.review_status === 'Awaiting Review';

                  return (
                    <tr 
                      key={d.id}
                      className="hover:bg-[#13223b] transition-colors"
                    >
                      {/* Direction ID */}
                      <td className="py-3 px-3 font-mono font-bold text-amber-400 whitespace-nowrap">
                        <button
                          onClick={() => {
                            setSelectedDirectionId(d.id);
                            setActiveTab('directions');
                          }}
                          className="hover:underline flex items-center gap-1"
                        >
                          <span>{d.id}</span>
                          <ArrowUpRight className="w-3 h-3 text-slate-500" />
                        </button>
                      </td>

                      {/* Meeting Title */}
                      <td className="py-3 px-3 max-w-[160px] truncate text-slate-300 font-medium" title={d.meeting_title}>
                        {d.meeting_title || d.meeting_id}
                      </td>

                      {/* Date Issued */}
                      <td className="py-3 px-3 font-mono text-slate-400 whitespace-nowrap">
                        {d.issuance_date}
                      </td>

                      {/* Direction Summary */}
                      <td className="py-3 px-3 max-w-[220px]">
                        <p className="font-semibold text-slate-100 truncate">{d.title}</p>
                        <p className="text-[11px] text-slate-400 truncate">{d.description}</p>
                      </td>

                      {/* Responsible Division */}
                      <td className="py-3 px-3 text-slate-300 whitespace-nowrap">
                        {d.responsible_divisions.join(', ')}
                      </td>

                      {/* Field Office */}
                      <td className="py-3 px-3 text-slate-300 whitespace-nowrap font-mono text-[11px]">
                        {d.responsible_field_offices && d.responsible_field_offices.length > 0 
                          ? d.responsible_field_offices.join(', ')
                          : '-'}
                      </td>

                      {/* Officer */}
                      <td className="py-3 px-3 text-slate-300 whitespace-nowrap font-medium">
                        {d.responsible_officer}
                      </td>

                      {/* Deadline */}
                      <td className={`py-3 px-3 font-mono whitespace-nowrap ${
                        d.status === 'Overdue' ? 'text-rose-400 font-bold' : 'text-slate-300'
                      }`}>
                        {d.deadline}
                      </td>

                      {/* Priority */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                          d.priority === 'High' ? 'bg-rose-950 text-rose-300 border border-rose-800' :
                          d.priority === 'Medium' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                          'bg-slate-800 text-slate-300'
                        }`}>
                          {d.priority}
                        </span>
                      </td>

                      {/* Current Status */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                          d.status === 'Completed' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                          d.status === 'Overdue' ? 'bg-rose-950 text-rose-300 border border-rose-800' :
                          'bg-blue-950 text-blue-300 border border-blue-800'
                        }`}>
                          {d.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Submit Compliance Button */}
                          <button
                            onClick={() => {
                              setActiveDirectionForSubmit(d);
                              setProgressRemarks('');
                              setCompletionPercentage(100);
                              setRemainingAction('');
                              setUploadedFiles([]);
                            }}
                            className="p-1.5 rounded-lg bg-[#11213b] hover:bg-[#1a3359] text-emerald-400 border border-[#1e3458] transition-colors"
                            title="Submit Compliance Report"
                          >
                            <Upload className="w-3.5 h-3.5" />
                          </button>

                          {/* Review Button if submission exists */}
                          {isAwaitingReview && (
                            <button
                              onClick={() => {
                                setActiveDirectionForReview(d);
                                setActiveSubmissionId(latestSubmission.id);
                                setReviewAction('Accepted');
                                setReviewRemarks('');
                              }}
                              className="p-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/30 transition-colors"
                              title="Adjudicate / Review Compliance"
                            >
                              <ShieldCheck className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Reminder Button */}
                          <button
                            onClick={() => {
                              setActiveDirectionForReminder(d);
                              setReminderRecipient(d.responsible_officer);
                              setReminderNotes('');
                            }}
                            className="p-1.5 rounded-lg bg-[#11213b] hover:bg-[#1a3359] text-blue-400 border border-[#1e3458] transition-colors"
                            title="Send Official Reminder"
                          >
                            <Bell className="w-3.5 h-3.5" />
                          </button>

                          {/* Detail Button */}
                          <button
                            onClick={() => {
                              setSelectedDirectionId(d.id);
                              setActiveTab('directions');
                            }}
                            className="p-1.5 rounded-lg bg-[#11213b] hover:bg-[#1a3359] text-slate-300 border border-[#1e3458] transition-colors"
                            title="Open Direction Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Submit Compliance (Section 8.C) */}
      {activeDirectionForSubmit && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0c1626] border border-[#22395d] rounded-xl max-w-lg w-full p-5 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between pb-2 border-b border-[#1b2d49]">
              <div>
                <h3 className="text-sm font-bold text-slate-100 font-serif">
                  Submit Official Compliance Report
                </h3>
                <p className="text-xs text-amber-400 font-mono">
                  {activeDirectionForSubmit.id}: {activeDirectionForSubmit.title}
                </p>
              </div>
              <button onClick={() => setActiveDirectionForSubmit(null)} className="text-slate-400">✕</button>
            </div>

            <form onSubmit={handleSaveSubmission} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Submission Date
                  </label>
                  <input
                    type="date"
                    disabled
                    value={todayStr}
                    className="w-full bg-[#070d18] text-slate-400 p-2.5 rounded-lg border border-[#1e3250]"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Submitted By
                  </label>
                  <input
                    type="text"
                    disabled
                    value={currentUser.name}
                    className="w-full bg-[#070d18] text-slate-400 p-2.5 rounded-lg border border-[#1e3250]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Percentage of Completion (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={completionPercentage}
                  onChange={(e) => setCompletionPercentage(Number(e.target.value))}
                  className="w-full bg-[#070d18] text-slate-100 p-2.5 rounded-lg border border-[#1e3250] focus:border-amber-500 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Progress Remarks & Report *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Detail physical progress, actions taken, dispatch numbers, etc."
                  value={progressRemarks}
                  onChange={(e) => setProgressRemarks(e.target.value)}
                  className="w-full bg-[#070d18] text-slate-100 p-2.5 rounded-lg border border-[#1e3250] focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Remaining Action Required (if any)
                </label>
                <input
                  type="text"
                  placeholder="What remains before complete fulfillment?"
                  value={remainingAction}
                  onChange={(e) => setRemainingAction(e.target.value)}
                  className="w-full bg-[#070d18] text-slate-100 p-2.5 rounded-lg border border-[#1e3250] focus:border-amber-500 focus:outline-none"
                />
              </div>

              {/* Supporting Files Upload */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Attach Official Report / Evidence
                </label>
                <label className="cursor-pointer block p-4 border border-dashed border-[#22395d] hover:border-amber-500/50 rounded-lg text-center bg-[#070d18] transition-colors">
                  <Upload className="w-5 h-5 text-amber-400 mx-auto mb-1" />
                  <span className="text-slate-300 font-medium">Click to select files from device</span>
                  <input 
                    type="file" 
                    className="hidden" 
                    onChange={handleFileUpload} 
                    disabled={isUploading}
                  />
                </label>

                {uploadedFiles.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {uploadedFiles.map(f => (
                      <div key={f.id} className="p-2 rounded bg-[#101e36] text-[11px] flex justify-between items-center text-slate-200">
                        <span className="truncate">{f.name}</span>
                        <span className="font-mono text-emerald-400">Attached</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#1b2d49]">
                <button
                  type="button"
                  onClick={() => setActiveDirectionForSubmit(null)}
                  className="px-3 py-1.5 bg-[#122036] text-slate-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-1.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-slate-100 font-bold rounded-lg shadow"
                >
                  Submit Compliance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Review and Acceptance (Section 8.D) */}
      {activeDirectionForReview && activeSubmissionId && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0c1626] border border-[#22395d] rounded-xl max-w-md w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#1b2d49]">
              <div>
                <h3 className="text-sm font-bold text-slate-100 font-serif">
                  Adjudicate Compliance Report
                </h3>
                <p className="text-xs text-amber-400 font-mono">
                  Direction: {activeDirectionForReview.id}
                </p>
              </div>
              <button onClick={() => setActiveDirectionForReview(null)} className="text-slate-400">✕</button>
            </div>

            <form onSubmit={handleSaveReview} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Adjudication Action *
                </label>
                <select
                  value={reviewAction}
                  onChange={(e) => setReviewAction(e.target.value as any)}
                  className="w-full bg-[#070d18] text-slate-100 p-2.5 rounded-lg border border-[#1e3250] focus:border-amber-500 focus:outline-none"
                >
                  <option value="Accepted">Accept Compliance</option>
                  <option value="Returned">Return for Further Action</option>
                  <option value="Under Review">Keep Under Review</option>
                </select>
              </div>

              {reviewAction === 'Accepted' && (
                <div className="p-2.5 rounded bg-emerald-950/40 border border-emerald-800/40 flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="markDone"
                    checked={markCompleted}
                    onChange={(e) => setMarkCompleted(e.target.checked)}
                    className="rounded bg-[#070d18] text-emerald-600"
                  />
                  <label htmlFor="markDone" className="text-emerald-200 text-xs font-semibold cursor-pointer">
                    Mark Direction status as "Completed"
                  </label>
                </div>
              )}

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Supervisory Remarks *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder={
                    reviewAction === 'Returned'
                      ? "Mandatory: Detail what is missing or what further action is required..."
                      : "Enter DG supervisory notes..."
                  }
                  value={reviewRemarks}
                  onChange={(e) => setReviewRemarks(e.target.value)}
                  className="w-full bg-[#070d18] text-slate-100 p-2.5 rounded-lg border border-[#1e3250] focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="text-[10px] text-slate-400 font-mono bg-[#070d18] p-2 rounded border border-[#15243c]">
                Reviewing Official: {currentUser.name} ({currentUser.role})
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#1b2d49]">
                <button
                  type="button"
                  onClick={() => setActiveDirectionForReview(null)}
                  className="px-3 py-1.5 bg-[#122036] text-slate-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold rounded-lg shadow"
                >
                  Confirm Decision
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Log Reminder */}
      {activeDirectionForReminder && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0c1626] border border-[#22395d] rounded-xl max-w-md w-full p-5 shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-slate-100 font-serif">
              Dispatch / Record Follow-up Reminder
            </h3>
            <form onSubmit={handleSaveReminder} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Recipient *
                </label>
                <input
                  type="text"
                  required
                  value={reminderRecipient}
                  onChange={(e) => setReminderRecipient(e.target.value)}
                  className="w-full bg-[#070d18] text-slate-100 p-2.5 rounded-lg border border-[#1e3250]"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Official Reminder Notes *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g. Compliance report overdue; urgent submission required per DG orders."
                  value={reminderNotes}
                  onChange={(e) => setReminderNotes(e.target.value)}
                  className="w-full bg-[#070d18] text-slate-100 p-2.5 rounded-lg border border-[#1e3250]"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveDirectionForReminder(null)}
                  className="px-3 py-1.5 bg-[#122036] text-slate-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg shadow"
                >
                  Log Reminder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
