import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Direction, DocumentItem } from '../types';
import { 
  DEPARTMENTAL_DIVISIONS, 
  FIELD_OFFICES, 
  PRIORITY_LEVELS, 
  DIRECTION_STATUSES 
} from '../data/constants';
import { StorageService } from '../services/storageService';
import { 
  Compass, 
  Plus, 
  Search, 
  Clock, 
  AlertTriangle, 
  FileText, 
  Upload, 
  ArrowLeft, 
  Bell, 
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  Download,
  CheckCircle2
} from 'lucide-react';

export const DirectionsView: React.FC = () => {
  const { 
    directions, 
    meetings, 
    createDirection, 
    reviseDeadline, 
    submitCompliance, 
    reviewCompliance, 
    logReminder,
    selectedDirectionId, 
    setSelectedDirectionId,
    setSelectedMeetingId,
    selectedDivisionFilter,
    setSelectedDivisionFilter,
    setActiveTab,
    activityLogs,
    currentUser
  } = useApp();

  const [search, setSearch] = useState('');
  const [divisionFilter, setDivisionFilter] = useState<string>(selectedDivisionFilter || 'all');
  const [fieldOfficeFilter, setFieldOfficeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [overdueOnly, setOverdueOnly] = useState<boolean>(false);

  // Modals state
  const [isNewDirectionModalOpen, setIsNewDirectionModalOpen] = useState(false);
  const [isReviseDeadlineModalOpen, setIsReviseDeadlineModalOpen] = useState(false);
  const [isSubmitComplianceModalOpen, setIsSubmitComplianceModalOpen] = useState(false);
  const [isReviewComplianceModalOpen, setIsReviewComplianceModalOpen] = useState(false);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);

  // Active Direction & target submission
  const currentDirection = directions.find(d => d.id === selectedDirectionId);
  const [targetSubmissionId, setTargetSubmissionId] = useState<string | null>(null);

  // Form states for New Direction
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newMeetingId, setNewMeetingId] = useState(meetings[0]?.id || '');
  const [newDivisions, setNewDivisions] = useState<string[]>(['Administration']);
  const [newFieldOffices, setNewFieldOffices] = useState<string[]>([]);
  const [newOfficer, setNewOfficer] = useState('');
  const [newPriority, setNewPriority] = useState<Direction['priority']>('Normal');
  const [newDeadline, setNewDeadline] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [newDeliverable, setNewDeliverable] = useState('');
  const [newRemarks, setNewRemarks] = useState('');

  // Form states for Revise Deadline
  const [revisedDeadline, setRevisedDeadline] = useState('');
  const [revisedReason, setRevisedReason] = useState('');

  // Form states for Submit Compliance
  const [compRemarks, setCompRemarks] = useState('');
  const [compPercent, setCompPercent] = useState<number>(100);
  const [compRemaining, setCompRemaining] = useState('');
  const [compFiles, setCompFiles] = useState<DocumentItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // Form states for Review Compliance
  const [reviewAction, setReviewAction] = useState<'Accepted' | 'Returned' | 'Under Review'>('Accepted');
  const [reviewRemarks, setReviewRemarks] = useState('');
  const [markCompleteChecked, setMarkCompleteChecked] = useState(true);

  // Form states for Reminder
  const [remRecipient, setRemRecipient] = useState('');
  const [remNotes, setRemNotes] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];

  // Filtered Directions
  const filteredDirections = directions.filter(d => {
    if (d.is_archived) return false;

    const matchSearch = 
      d.id.toLowerCase().includes(search.toLowerCase()) ||
      d.title.toLowerCase().includes(search.toLowerCase()) ||
      d.description.toLowerCase().includes(search.toLowerCase()) ||
      d.responsible_officer.toLowerCase().includes(search.toLowerCase());

    const matchDivision = 
      divisionFilter === 'all' || d.responsible_divisions.includes(divisionFilter);

    const matchFieldOffice = 
      fieldOfficeFilter === 'all' || 
      (d.responsible_field_offices && d.responsible_field_offices.includes(fieldOfficeFilter));

    const matchStatus = statusFilter === 'all' || d.status === statusFilter;
    const matchPriority = priorityFilter === 'all' || d.priority === priorityFilter;
    const matchOverdue = !overdueOnly || (d.status === 'Overdue' || (d.status !== 'Completed' && d.deadline && d.deadline < todayStr));

    return matchSearch && matchDivision && matchFieldOffice && matchStatus && matchPriority && matchOverdue;
  });

  const handleCreateDirection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const created = await createDirection({
      title: newTitle,
      description: newDescription,
      meeting_id: newMeetingId,
      responsible_divisions: newDivisions,
      responsible_field_offices: newFieldOffices,
      responsible_officer: newOfficer,
      priority: newPriority,
      deadline: newDeadline,
      expected_deliverable: newDeliverable,
      remarks: newRemarks
    });

    setIsNewDirectionModalOpen(false);
    setSelectedDirectionId(created.id);
    
    // reset form
    setNewTitle('');
    setNewDescription('');
    setNewDeliverable('');
    setNewOfficer('');
    setNewRemarks('');
  };

  const handleReviseDeadline = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentDirection || !revisedDeadline || !revisedReason.trim()) return;

    await reviseDeadline(currentDirection.id, revisedDeadline, revisedReason);
    setIsReviseDeadlineModalOpen(false);
    setRevisedDeadline('');
    setRevisedReason('');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!currentDirection || !e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setIsUploading(true);

    try {
      const docItem = await StorageService.uploadDocument(file, {
        direction_id: currentDirection.id,
        file_type: 'Compliance Report',
        uploaded_by: currentUser.name,
        description: `Compliance Report for ${currentDirection.id}`
      });

      setCompFiles(prev => [...prev, docItem]);
    } catch (err) {
      console.error('Error uploading file:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmitCompliance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentDirection || !compRemarks.trim()) return;

    await submitCompliance(currentDirection.id, {
      progress_remarks: compRemarks,
      percentage_of_completion: compPercent,
      remaining_action_required: compRemaining,
      files: compFiles
    });

    setIsSubmitComplianceModalOpen(false);
    setCompRemarks('');
    setCompRemaining('');
    setCompFiles([]);
  };

  const handleReviewCompliance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentDirection || !targetSubmissionId) return;

    await reviewCompliance(
      currentDirection.id,
      targetSubmissionId,
      reviewAction,
      reviewRemarks,
      reviewAction === 'Accepted' && markCompleteChecked
    );

    setIsReviewComplianceModalOpen(false);
    setTargetSubmissionId(null);
    setReviewRemarks('');
  };

  const handleLogReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentDirection || !remRecipient.trim()) return;

    await logReminder(currentDirection.id, remRecipient, remNotes);
    setIsReminderModalOpen(false);
    setRemRecipient('');
    setRemNotes('');
  };

  // ==================== VIEW 1: DIRECTION DETAIL PAGE ====================
  if (currentDirection) {
    const parentMeeting = meetings.find(m => m.id === currentDirection.meeting_id);

    return (
      <div className="space-y-6 pb-12">
        
        {/* Back navigation */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-[#1b2d49]">
          <button
            onClick={() => setSelectedDirectionId(null)}
            className="text-xs text-emerald-700 dark:text-amber-400 hover:underline flex items-center gap-1.5 font-semibold transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All DG Directions</span>
          </button>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                setRevisedDeadline(currentDirection.deadline);
                setIsReviseDeadlineModalOpen(true);
              }}
              className="px-3 py-1.5 bg-slate-100 dark:bg-[#122036] hover:bg-slate-200 dark:hover:bg-[#1a3055] border border-slate-300 dark:border-[#22395d] text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>Change Deadline</span>
            </button>

            <button
              onClick={() => {
                setRemRecipient(currentDirection.responsible_officer);
                setIsReminderModalOpen(true);
              }}
              className="px-3 py-1.5 bg-slate-100 dark:bg-[#122036] hover:bg-slate-200 dark:hover:bg-[#1a3055] border border-slate-300 dark:border-[#22395d] text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Bell className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Log Reminder</span>
            </button>

            <button
              onClick={() => setIsSubmitComplianceModalOpen(true)}
              className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg shadow-sm transition-all flex items-center gap-1.5"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Submit Compliance</span>
            </button>
          </div>
        </div>

        {/* Direction Master Dossier Card */}
        <div className="bg-white dark:bg-[#0e192c] border border-slate-200 dark:border-[#1e3250] rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="font-mono text-xs font-bold text-emerald-800 dark:text-amber-400 bg-emerald-50 dark:bg-amber-950/70 border border-emerald-300 dark:border-amber-600/40 px-2 py-0.5 rounded">
                  {currentDirection.id}
                </span>
                <span className={`text-xs px-2.5 py-0.5 rounded font-semibold ${
                  currentDirection.priority === 'High' ? 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800' :
                  currentDirection.priority === 'Medium' ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800' :
                  'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700'
                }`}>
                  {currentDirection.priority} Priority
                </span>
                <span className={`text-xs px-2.5 py-0.5 rounded font-semibold ${
                  currentDirection.status === 'Completed' ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800' :
                  currentDirection.status === 'Overdue' ? 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800' :
                  'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-800'
                }`}>
                  Status: {currentDirection.status}
                </span>
              </div>

              <h2 className="text-lg md:text-xl font-bold text-slate-900 dark:text-slate-100 font-serif">
                {currentDirection.title}
              </h2>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#08111e] border border-slate-200 dark:border-[#1b2d49] text-xs font-mono space-y-1 text-right flex-shrink-0">
              <div className="text-slate-600 dark:text-slate-400">
                Issued on: <strong className="text-slate-800 dark:text-slate-200">{currentDirection.issuance_date}</strong>
              </div>
              <div className="text-slate-600 dark:text-slate-400">
                Deadline: <strong className={currentDirection.status === 'Overdue' ? 'text-rose-600 dark:text-rose-400 font-bold' : 'text-slate-800 dark:text-slate-200'}>
                  {currentDirection.deadline}
                </strong>
              </div>
              {parentMeeting && (
                <div 
                  onClick={() => {
                    setSelectedMeetingId(parentMeeting.id);
                    setActiveTab('meetings');
                  }}
                  className="pt-1 border-t border-slate-200 dark:border-[#1a2d48] text-emerald-700 dark:text-amber-400 hover:underline cursor-pointer flex items-center justify-end gap-1 text-[11px]"
                >
                  <span>Meeting: {parentMeeting.id}</span>
                  <ExternalLink className="w-3 h-3" />
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="p-4 rounded-lg bg-slate-50 dark:bg-[#091220] border border-slate-200 dark:border-[#1c2e4b] text-xs space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 font-mono tracking-wider">
              Operative Instructions / Detailed Mandate
            </span>
            <p className="text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
              {currentDirection.description}
            </p>
          </div>

          {/* Key Attributes Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#091220] border border-slate-200 dark:border-[#1c2e4b]">
              <span className="text-[10px] uppercase text-slate-400 font-mono">Division</span>
              <p className="text-slate-800 dark:text-slate-200 font-semibold mt-0.5">
                {currentDirection.responsible_divisions.join(', ')}
              </p>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#091220] border border-slate-200 dark:border-[#1c2e4b]">
              <span className="text-[10px] uppercase text-slate-400 font-mono">Field Office</span>
              <p className="text-slate-800 dark:text-slate-200 font-semibold mt-0.5">
                {currentDirection.responsible_field_offices && currentDirection.responsible_field_offices.length > 0 
                  ? currentDirection.responsible_field_offices.join(', ')
                  : 'Central Office'}
              </p>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#091220] border border-slate-200 dark:border-[#1c2e4b]">
              <span className="text-[10px] uppercase text-slate-400 font-mono">Responsible Officer</span>
              <p className="text-slate-800 dark:text-slate-200 font-semibold mt-0.5">
                {currentDirection.responsible_officer}
              </p>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#091220] border border-slate-200 dark:border-[#1c2e4b]">
              <span className="text-[10px] uppercase text-slate-400 font-mono">Expected Deliverable</span>
              <p className="text-slate-800 dark:text-slate-200 font-semibold mt-0.5">
                {currentDirection.expected_deliverable}
              </p>
            </div>
          </div>
        </div>

        {/* Compliance History & Submission Ledger */}
        <div className="bg-white dark:bg-[#0e192c] border border-slate-200 dark:border-[#1e3250] rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-[#1b2d49]">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 font-serif">
                Compliance Reports &amp; Review History
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Progress updates submitted by the responsible division
              </p>
            </div>

            <button
              onClick={() => setIsSubmitComplianceModalOpen(true)}
              className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Submit Progress</span>
            </button>
          </div>

          {currentDirection.compliance_submissions.length === 0 ? (
            <div className="p-8 rounded-lg bg-slate-50 dark:bg-[#091220] border border-dashed border-slate-300 dark:border-[#1c2e4b] text-center text-xs text-slate-500 dark:text-slate-400">
              No compliance reports submitted yet.
            </div>
          ) : (
            <div className="space-y-3">
              {currentDirection.compliance_submissions.map(sub => (
                <div 
                  key={sub.id}
                  className="p-4 rounded-lg bg-slate-50 dark:bg-[#091220] border border-slate-200 dark:border-[#1c2e4b] space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200 dark:border-[#162740]">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold font-mono text-emerald-800 dark:text-amber-400">{sub.id}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded font-semibold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {sub.percentage_of_completion}% Completed
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                        sub.review_status === 'Accepted' ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300' :
                        sub.review_status === 'Returned' ? 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300' :
                        'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300'
                      }`}>
                        Review: {sub.review_status}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-500 font-mono">
                      {sub.submission_date} by {sub.submitted_by}
                    </div>
                  </div>

                  <div className="text-xs text-slate-800 dark:text-slate-200">
                    <strong className="text-slate-500 dark:text-slate-400 block mb-0.5 text-[11px]">Progress Remarks:</strong>
                    <p className="whitespace-pre-wrap bg-white dark:bg-[#070e1a] p-2.5 rounded border border-slate-200 dark:border-[#142338]">
                      {sub.progress_remarks}
                    </p>
                  </div>

                  {sub.remaining_action_required && (
                    <div className="text-xs text-slate-600 dark:text-slate-300">
                      <strong className="text-slate-500 dark:text-slate-400 block mb-0.5 text-[11px]">Remaining Action:</strong>
                      <p>{sub.remaining_action_required}</p>
                    </div>
                  )}

                  {/* Supporting Files */}
                  {sub.supporting_files && sub.supporting_files.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {sub.supporting_files.map(f => (
                        <a
                          key={f.id}
                          href={f.url || f.content_base64}
                          download={f.name}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-200 dark:bg-[#11213b] text-xs text-slate-800 dark:text-amber-300"
                        >
                          <FileText className="w-3.5 h-3.5 text-emerald-600 dark:text-amber-400" />
                          <span>{f.name}</span>
                          <Download className="w-3 h-3 text-emerald-600 ml-1" />
                        </a>
                      ))}
                    </div>
                  )}

                  {/* Review Actions */}
                  {sub.review_status !== 'Awaiting Review' ? (
                    <div className="p-3 rounded bg-white dark:bg-[#0b1626] border border-slate-200 dark:border-[#1b2f4e] text-xs">
                      <span className="font-bold text-emerald-700 dark:text-amber-400">Decision: {sub.review_status}</span>
                      {sub.review_remarks && <p className="text-slate-600 dark:text-slate-300 mt-1">{sub.review_remarks}</p>}
                    </div>
                  ) : (
                    <div className="flex justify-end pt-2">
                      <button
                        onClick={() => {
                          setTargetSubmissionId(sub.id);
                          setIsReviewComplianceModalOpen(true);
                        }}
                        className="px-3 py-1 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Review Compliance</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal: Revise Deadline */}
        {isReviseDeadlineModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#0c1626] border border-slate-200 dark:border-[#22395d] rounded-xl max-w-md w-full p-5 shadow-2xl space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 font-serif">Revise Compliance Deadline</h3>
              <form onSubmit={handleReviseDeadline} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">New Deadline *</label>
                  <input
                    type="date"
                    required
                    value={revisedDeadline}
                    onChange={(e) => setRevisedDeadline(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#070d18] text-slate-900 dark:text-slate-100 p-2.5 rounded-lg border border-slate-300 dark:border-[#1e3250]"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Recorded Reason *</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Provide justification for deadline extension..."
                    value={revisedReason}
                    onChange={(e) => setRevisedReason(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#070d18] text-slate-900 dark:text-slate-100 p-2.5 rounded-lg border border-slate-300 dark:border-[#1e3250]"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setIsReviseDeadlineModalOpen(false)} className="px-3 py-1.5 bg-slate-100 dark:bg-[#122036] text-slate-700 dark:text-slate-300 rounded-lg">Cancel</button>
                  <button type="submit" className="px-4 py-1.5 bg-emerald-700 dark:bg-amber-600 text-white dark:text-slate-950 font-bold rounded-lg shadow-sm">Save Revision</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Submit Compliance */}
        {isSubmitComplianceModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white dark:bg-[#0c1626] border border-slate-200 dark:border-[#22395d] rounded-xl max-w-lg w-full p-5 shadow-2xl space-y-4 my-8">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-[#1b2d49]">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 font-serif">Submit Official Compliance Report</h3>
                <button onClick={() => setIsSubmitComplianceModalOpen(false)} className="text-slate-500">✕</button>
              </div>

              <form onSubmit={handleSubmitCompliance} className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Completion Percentage (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={compPercent}
                    onChange={(e) => setCompPercent(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-[#070d18] text-slate-900 dark:text-slate-100 p-2.5 rounded-lg border border-slate-300 dark:border-[#1e3250]"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Progress Remarks *</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Enter compliance details..."
                    value={compRemarks}
                    onChange={(e) => setCompRemarks(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#070d18] text-slate-900 dark:text-slate-100 p-2.5 rounded-lg border border-slate-300 dark:border-[#1e3250]"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Remaining Action (if any)</label>
                  <input
                    type="text"
                    value={compRemaining}
                    onChange={(e) => setCompRemaining(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#070d18] text-slate-900 dark:text-slate-100 p-2.5 rounded-lg border border-slate-300 dark:border-[#1e3250]"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Attach Supporting Files</label>
                  <label className="cursor-pointer block p-4 border border-dashed border-slate-300 dark:border-[#22395d] rounded-lg text-center bg-slate-50 dark:bg-[#070d18]">
                    <Upload className="w-5 h-5 text-emerald-600 dark:text-amber-400 mx-auto mb-1" />
                    <span className="text-slate-600 dark:text-slate-300 font-medium">Select file to attach</span>
                    <input type="file" className="hidden" onChange={handleFileUpload} disabled={isUploading} />
                  </label>

                  {compFiles.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {compFiles.map(f => (
                        <div key={f.id} className="p-2 rounded bg-slate-100 dark:bg-[#101e36] text-[11px] flex justify-between">
                          <span>{f.name}</span>
                          <span className="text-emerald-600 font-semibold">Attached</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-[#1b2d49]">
                  <button type="button" onClick={() => setIsSubmitComplianceModalOpen(false)} className="px-3 py-1.5 bg-slate-100 dark:bg-[#122036] text-slate-700 dark:text-slate-300 rounded-lg">Cancel</button>
                  <button type="submit" className="px-4 py-1.5 bg-emerald-700 text-white font-bold rounded-lg shadow-sm">Submit Report</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Review Compliance */}
        {isReviewComplianceModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#0c1626] border border-slate-200 dark:border-[#22395d] rounded-xl max-w-md w-full p-5 shadow-2xl space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 font-serif">Review Compliance</h3>
              <form onSubmit={handleReviewCompliance} className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Adjudication Action *</label>
                  <select
                    value={reviewAction}
                    onChange={(e) => setReviewAction(e.target.value as any)}
                    className="w-full bg-slate-50 dark:bg-[#070d18] text-slate-900 dark:text-slate-100 p-2.5 rounded-lg border border-slate-300 dark:border-[#1e3250]"
                  >
                    <option value="Accepted">Accept Compliance</option>
                    <option value="Returned">Return for Further Action</option>
                    <option value="Under Review">Keep Under Review</option>
                  </select>
                </div>

                {reviewAction === 'Accepted' && (
                  <div className="p-2.5 rounded bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="markDone"
                      checked={markCompleteChecked}
                      onChange={(e) => setMarkCompleteChecked(e.target.checked)}
                      className="rounded"
                    />
                    <label htmlFor="markDone" className="text-emerald-900 dark:text-emerald-200 text-xs font-semibold cursor-pointer">
                      Mark Direction status as "Completed"
                    </label>
                  </div>
                )}

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Remarks *</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Enter review remarks..."
                    value={reviewRemarks}
                    onChange={(e) => setReviewRemarks(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#070d18] text-slate-900 dark:text-slate-100 p-2.5 rounded-lg border border-slate-300 dark:border-[#1e3250]"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setIsReviewComplianceModalOpen(false)} className="px-3 py-1.5 bg-slate-100 dark:bg-[#122036] text-slate-700 dark:text-slate-300 rounded-lg">Cancel</button>
                  <button type="submit" className="px-4 py-1.5 bg-emerald-700 dark:bg-amber-600 text-white dark:text-slate-950 font-bold rounded-lg shadow-sm">Save Decision</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Log Reminder */}
        {isReminderModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#0c1626] border border-slate-200 dark:border-[#22395d] rounded-xl max-w-md w-full p-5 shadow-2xl space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 font-serif">Log Reminder</h3>
              <form onSubmit={handleLogReminder} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Recipient *</label>
                  <input
                    type="text"
                    required
                    value={remRecipient}
                    onChange={(e) => setRemRecipient(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#070d18] text-slate-900 dark:text-slate-100 p-2.5 rounded-lg border border-slate-300 dark:border-[#1e3250]"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Notes *</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Reminder details..."
                    value={remNotes}
                    onChange={(e) => setRemNotes(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#070d18] text-slate-900 dark:text-slate-100 p-2.5 rounded-lg border border-slate-300 dark:border-[#1e3250]"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setIsReminderModalOpen(false)} className="px-3 py-1.5 bg-slate-100 dark:bg-[#122036] text-slate-700 dark:text-slate-300 rounded-lg">Cancel</button>
                  <button type="submit" className="px-4 py-1.5 bg-blue-600 text-white font-bold rounded-lg shadow-sm">Save Reminder</button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    );
  }

  // ==================== VIEW 2: ALL DIRECTIONS REGISTER ====================
  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-[#1b2d49]">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 font-serif">
            DG Directions &amp; Compliance Register
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Track directives issued by the Director General, departmental responsibilities, and field compliance.
          </p>
        </div>

        <button
          onClick={() => setIsNewDirectionModalOpen(true)}
          className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 dark:bg-amber-600 dark:hover:bg-amber-500 text-white dark:text-slate-950 text-xs font-bold rounded-lg shadow-sm transition-all flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Issue New Direction</span>
        </button>
      </div>

      {/* Filter Bar with Division & Dependent Field Office Dropdown */}
      <div className="bg-white dark:bg-[#0e192c] border border-slate-200 dark:border-[#1e3250] rounded-xl p-3.5 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search directions by ID, title, officer, keywords..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 dark:bg-[#070d18] text-xs text-slate-900 dark:text-slate-200 pl-9 pr-4 py-2 rounded-lg border border-slate-300 dark:border-[#1e3250] focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Division Dropdown */}
            <select
              value={divisionFilter}
              onChange={(e) => {
                setDivisionFilter(e.target.value);
                setSelectedDivisionFilter(e.target.value === 'all' ? null : e.target.value);
              }}
              className="bg-slate-50 dark:bg-[#070d18] text-slate-700 dark:text-slate-300 px-3 py-2 rounded-lg border border-slate-300 dark:border-[#1e3250]"
            >
              <option value="all">All Divisions (9)</option>
              {DEPARTMENTAL_DIVISIONS.map(div => <option key={div} value={div}>{div}</option>)}
            </select>

            {/* Dependent Field Office Dropdown */}
            {divisionFilter === 'Field Offices' && (
              <select
                value={fieldOfficeFilter}
                onChange={(e) => setFieldOfficeFilter(e.target.value)}
                className="bg-slate-50 dark:bg-[#070d18] text-emerald-800 dark:text-amber-300 px-3 py-2 rounded-lg border border-emerald-300 dark:border-amber-600/50"
              >
                <option value="all">All 15 Field Formations</option>
                {FIELD_OFFICES.map(fo => <option key={fo} value={fo}>{fo}</option>)}
              </select>
            )}

            {/* Status Dropdown */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 dark:bg-[#070d18] text-slate-700 dark:text-slate-300 px-3 py-2 rounded-lg border border-slate-300 dark:border-[#1e3250]"
            >
              <option value="all">All Statuses</option>
              {DIRECTION_STATUSES.map(st => <option key={st} value={st}>{st}</option>)}
            </select>

            {/* Priority Dropdown */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-slate-50 dark:bg-[#070d18] text-slate-700 dark:text-slate-300 px-3 py-2 rounded-lg border border-slate-300 dark:border-[#1e3250]"
            >
              <option value="all">All Priorities</option>
              {PRIORITY_LEVELS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>

            {/* Overdue Only Toggle */}
            <button
              onClick={() => setOverdueOnly(!overdueOnly)}
              className={`px-3 py-2 rounded-lg font-semibold border transition-colors ${
                overdueOnly
                  ? 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-700'
                  : 'bg-slate-50 dark:bg-[#070d18] text-slate-600 dark:text-slate-400 border-slate-300 dark:border-[#1e3250]'
              }`}
            >
              Overdue Only
            </button>
          </div>
        </div>
      </div>

      {/* Directions Register Cards */}
      <div className="space-y-3">
        {filteredDirections.length === 0 ? (
          <div className="bg-white dark:bg-[#0e192c] border border-slate-200 dark:border-[#1e3250] rounded-xl p-12 text-center text-xs text-slate-400">
            {directions.length === 0 ? (
              <div className="space-y-3">
                <p className="text-slate-500 dark:text-slate-400">No directions issued yet.</p>
                <button
                  onClick={() => setIsNewDirectionModalOpen(true)}
                  className="px-4 py-2 bg-emerald-700 text-white rounded-lg font-bold"
                >
                  Issue First Direction
                </button>
              </div>
            ) : (
              'No directions found matching the selected filters.'
            )}
          </div>
        ) : (
          filteredDirections.map(d => (
            <div
              key={d.id}
              onClick={() => setSelectedDirectionId(d.id)}
              className="bg-white dark:bg-[#0e192c] hover:bg-slate-50 dark:hover:bg-[#13223b] border border-slate-200 dark:border-[#1e3250] rounded-xl p-4 transition-all cursor-pointer shadow-sm group"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span className="font-mono text-xs font-bold text-emerald-800 dark:text-amber-400 bg-emerald-50 dark:bg-amber-950/70 border border-emerald-300 dark:border-amber-600/40 px-2 py-0.5 rounded">
                      {d.id}
                    </span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                      d.priority === 'High' ? 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300' :
                      d.priority === 'Medium' ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300' :
                      'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}>
                      {d.priority} Priority
                    </span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                      d.status === 'Completed' ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300' :
                      d.status === 'Overdue' ? 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300' :
                      'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300'
                    }`}>
                      {d.status}
                    </span>
                    {d.meeting_title && (
                      <span className="text-[10px] text-slate-400 truncate max-w-xs font-mono">
                        From: {d.meeting_title}
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-emerald-700 dark:group-hover:text-amber-300 transition-colors">
                    {d.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 line-clamp-1">
                    {d.description}
                  </p>

                  <div className="text-[11px] text-slate-500 mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
                    <span>Division: <strong className="text-slate-700 dark:text-slate-200">{d.responsible_divisions.join(', ')}</strong></span>
                    {d.responsible_field_offices && d.responsible_field_offices.length > 0 && (
                      <span>Field: <strong className="text-slate-700 dark:text-slate-200">{d.responsible_field_offices.join(', ')}</strong></span>
                    )}
                    <span>Officer: <strong className="text-slate-700 dark:text-slate-200">{d.responsible_officer}</strong></span>
                    <span>Submissions: <strong className="text-emerald-700 dark:text-amber-400">{d.compliance_submissions.length}</strong></span>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-5 text-xs font-mono border-t md:border-t-0 pt-2 md:pt-0 border-slate-200 dark:border-[#1a2c47]">
                  <div className="text-right">
                    <div className="text-[10px] text-slate-400">Deadline</div>
                    <div className={d.status === 'Overdue' ? 'text-rose-600 dark:text-rose-400 font-bold' : 'text-slate-700 dark:text-slate-200 font-semibold'}>
                      {d.deadline}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-700 dark:group-hover:text-amber-400 transition-all" />
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal: Issue New DG Direction */}
      {isNewDirectionModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#0c1626] border border-slate-200 dark:border-[#22395d] rounded-xl max-w-xl w-full p-5 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-[#1b2d49]">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 font-serif">
                  Issue New DG Direction
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Assign official responsibility, priority, and deadline
                </p>
              </div>
              <button onClick={() => setIsNewDirectionModalOpen(false)} className="text-slate-500 hover:text-slate-800 dark:text-slate-400">✕</button>
            </div>

            <form onSubmit={handleCreateDirection} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Originating Meeting (Optional)
                </label>
                <select
                  value={newMeetingId}
                  onChange={(e) => setNewMeetingId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#070d18] text-slate-900 dark:text-slate-100 p-2.5 rounded-lg border border-slate-300 dark:border-[#1e3250]"
                >
                  <option value="">-- Standalone Direction (Direct DG Mandate) --</option>
                  {meetings.map(m => (
                    <option key={m.id} value={m.id}>{m.id} - {m.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Direction Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Conduct Inspection of Mining Concession"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#070d18] text-slate-900 dark:text-slate-100 p-2.5 rounded-lg border border-slate-300 dark:border-[#1e3250]"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Detailed Description *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Enter detailed executive instructions..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#070d18] text-slate-900 dark:text-slate-100 p-2.5 rounded-lg border border-slate-300 dark:border-[#1e3250]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Responsible Division *
                  </label>
                  <select
                    value={newDivisions[0]}
                    onChange={(e) => {
                      setNewDivisions([e.target.value]);
                      if (e.target.value !== 'Field Offices') {
                        setNewFieldOffices([]);
                      }
                    }}
                    className="w-full bg-slate-50 dark:bg-[#070d18] text-slate-900 dark:text-slate-100 p-2.5 rounded-lg border border-slate-300 dark:border-[#1e3250]"
                  >
                    {DEPARTMENTAL_DIVISIONS.map(div => <option key={div} value={div}>{div}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Priority Level *
                  </label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as any)}
                    className="w-full bg-slate-50 dark:bg-[#070d18] text-slate-900 dark:text-slate-100 p-2.5 rounded-lg border border-slate-300 dark:border-[#1e3250]"
                  >
                    {PRIORITY_LEVELS.map(p => <option key={p} value={p}>{p} Priority</option>)}
                  </select>
                </div>
              </div>

              {/* Dependent Field Offices Selection */}
              {newDivisions.includes('Field Offices') && (
                <div className="p-3 rounded-lg bg-emerald-50 dark:bg-amber-950/20 border border-emerald-200 dark:border-amber-800/40 space-y-2">
                  <label className="block text-emerald-900 dark:text-amber-300 font-semibold text-xs">
                    Select Field Office Formation(s) *
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5 max-h-36 overflow-y-auto p-1 bg-white dark:bg-[#070d18] rounded border border-slate-200 dark:border-[#1b2d49]">
                    {FIELD_OFFICES.map(fo => {
                      const isSelected = newFieldOffices.includes(fo);
                      return (
                        <button
                          type="button"
                          key={fo}
                          onClick={() => {
                            if (isSelected) {
                              setNewFieldOffices(newFieldOffices.filter(item => item !== fo));
                            } else {
                              setNewFieldOffices([...newFieldOffices, fo]);
                            }
                          }}
                          className={`text-[10px] p-1 rounded text-left transition-colors truncate ${
                            isSelected
                              ? 'bg-emerald-700 dark:bg-amber-600 text-white dark:text-slate-950 font-bold'
                              : 'hover:bg-slate-100 dark:hover:bg-[#14233c] text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {fo}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Responsible Officer *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Director (SSM)"
                    value={newOfficer}
                    onChange={(e) => setNewOfficer(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#070d18] text-slate-900 dark:text-slate-100 p-2.5 rounded-lg border border-slate-300 dark:border-[#1e3250]"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Compliance Deadline *
                  </label>
                  <input
                    type="date"
                    required
                    value={newDeadline}
                    onChange={(e) => setNewDeadline(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#070d18] text-slate-900 dark:text-slate-100 p-2.5 rounded-lg border border-slate-300 dark:border-[#1e3250]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Expected Deliverable *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Field inspection report"
                  value={newDeliverable}
                  onChange={(e) => setNewDeliverable(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#070d18] text-slate-900 dark:text-slate-100 p-2.5 rounded-lg border border-slate-300 dark:border-[#1e3250]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-[#1b2d49]">
                <button
                  type="button"
                  onClick={() => setIsNewDirectionModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-[#122036] text-slate-700 dark:text-slate-300 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 dark:bg-amber-600 dark:hover:bg-amber-500 text-white dark:text-slate-950 rounded-lg font-bold shadow-sm"
                >
                  Issue Direction Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
