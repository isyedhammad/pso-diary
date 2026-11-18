import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Meeting, DocumentItem, DocumentType } from '../types';
import { MEETING_CATEGORIES, MEETING_STATUSES } from '../data/constants';
import { StorageService } from '../services/storageService';
import { 
  Calendar, 
  Plus, 
  Search, 
  FileText, 
  Upload, 
  Clock, 
  MapPin, 
  User, 
  Users, 
  Download, 
  ArrowLeft, 
  Compass, 
  ChevronRight,
  CalendarClock,
  Trash2,
  AlertTriangle,
  Printer
} from 'lucide-react';

export const MeetingsView: React.FC = () => {
  const { 
    meetings, 
    directions, 
    createMeeting, 
    updateMeeting,
    deleteMeeting,
    rescheduleMeeting,
    createDirection,
    addDocumentToMeeting,
    selectedMeetingId, 
    setSelectedMeetingId,
    setSelectedDirectionId,
    setActiveTab,
    activityLogs,
    currentUser,
    setIsPrintDocketOpen
  } = useApp();

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Modals state
  const [isNewMeetingModalOpen, setIsNewMeetingModalOpen] = useState(false);
  const [isAddDirectionModalOpen, setIsAddDirectionModalOpen] = useState(false);
  const [activeMeetingTab, setActiveMeetingTab] = useState<'overview' | 'agenda' | 'directions' | 'supporting' | 'minutes' | 'compliance' | 'activity'>('overview');

  // Reschedule state
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [meetingToReschedule, setMeetingToReschedule] = useState<Meeting | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('');
  const [rescheduleVenue, setRescheduleVenue] = useState('');
  const [rescheduleReason, setRescheduleReason] = useState('');

  // Delete state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [meetingToDelete, setMeetingToDelete] = useState<Meeting | null>(null);

  // New Meeting Form state
  const [newTitle, setNewTitle] = useState('');
  const [newSubject, setNewSubject] = useState('');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [newTime, setNewTime] = useState('11:00 AM');
  const [newVenue, setNewVenue] = useState('Committee Room No. 1, DG Office, Poonch House, Multan Road, Lahore');
  const [newChairperson, setNewChairperson] = useState('Director General, Mines & Minerals, Punjab');
  const [newParticipants, setNewParticipants] = useState('Director LSM, Director SSM, Director Minor Minerals, Staff Officer to DG');
  const [newCategory, setNewCategory] = useState<Meeting['category']>('Administrative');
  const [newStatus, setNewStatus] = useState<Meeting['status']>('Scheduled');
  const [newRemarks, setNewRemarks] = useState('');

  // Add Direction directly from Meeting Form state
  const [dirTitle, setDirTitle] = useState('');
  const [dirDescription, setDirDescription] = useState('');
  const [dirDivisions, setDirDivisions] = useState<string[]>(['Administration']);
  const [dirFieldOffices, setDirFieldOffices] = useState<string[]>([]);
  const [dirOfficer, setDirOfficer] = useState('Director / In-Charge Officer');
  const [dirPriority, setDirPriority] = useState<'High' | 'Medium' | 'Normal'>('Normal');
  const [dirDeadline, setDirDeadline] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [dirDeliverable, setDirDeliverable] = useState('');
  const [dirRemarks, setDirRemarks] = useState('');

  // Uploading document state
  const [uploadDescription, setUploadDescription] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // Selected meeting object
  const currentMeeting = meetings.find(m => m.id === selectedMeetingId);
  const relatedDirections = directions.filter(d => d.meeting_id === selectedMeetingId && !d.is_archived);
  const meetingActivities = activityLogs.filter(a => a.entity_id === selectedMeetingId || (a.entity_type === 'meeting' && a.entity_id === selectedMeetingId));

  // Filtered meetings
  const filteredMeetings = meetings.filter(m => {
    if (m.is_archived) return false;
    const matchSearch = 
      m.title.toLowerCase().includes(search.toLowerCase()) ||
      m.subject.toLowerCase().includes(search.toLowerCase()) ||
      m.id.toLowerCase().includes(search.toLowerCase()) ||
      m.chairperson.toLowerCase().includes(search.toLowerCase());
    const matchCategory = categoryFilter === 'all' || m.category === categoryFilter;
    const matchStatus = statusFilter === 'all' || m.status === statusFilter;
    return matchSearch && matchCategory && matchStatus;
  });

  const handleCreateMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const created = await createMeeting({
      title: newTitle,
      subject: newSubject,
      date: newDate,
      time: newTime,
      venue: newVenue,
      chairperson: newChairperson,
      participating_officers: newParticipants,
      category: newCategory,
      status: newStatus,
      general_remarks: newRemarks
    });

    setIsNewMeetingModalOpen(false);
    setSelectedMeetingId(created.id);
    setActiveMeetingTab('overview');
    
    // reset form
    setNewTitle('');
    setNewSubject('');
    setNewRemarks('');
  };

  const openRescheduleModal = (m: Meeting) => {
    setMeetingToReschedule(m);
    setRescheduleDate(m.date);
    setRescheduleTime(m.time);
    setRescheduleVenue(m.venue);
    setRescheduleReason('');
    setIsRescheduleModalOpen(true);
  };

  const handleConfirmReschedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!meetingToReschedule || !rescheduleDate || !rescheduleReason.trim()) return;
    await rescheduleMeeting(
      meetingToReschedule.id,
      rescheduleDate,
      rescheduleTime || '11:00 AM',
      rescheduleReason.trim(),
      rescheduleVenue.trim() || undefined
    );
    setIsRescheduleModalOpen(false);
    setMeetingToReschedule(null);
  };

  const openDeleteModal = (m: Meeting) => {
    setMeetingToDelete(m);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!meetingToDelete) return;
    await deleteMeeting(meetingToDelete.id);
    setIsDeleteModalOpen(false);
    setMeetingToDelete(null);
  };

  const handleAddDirectionFromMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentMeeting || !dirTitle.trim()) return;

    await createDirection({
      title: dirTitle,
      description: dirDescription,
      meeting_id: currentMeeting.id,
      meeting_title: currentMeeting.title,
      responsible_divisions: dirDivisions,
      responsible_field_offices: dirFieldOffices,
      responsible_officer: dirOfficer,
      priority: dirPriority,
      deadline: dirDeadline,
      expected_deliverable: dirDeliverable,
      remarks: dirRemarks
    });

    setIsAddDirectionModalOpen(false);
    // reset form
    setDirTitle('');
    setDirDescription('');
    setDirDeliverable('');
    setDirRemarks('');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, section: DocumentType) => {
    if (!currentMeeting || !e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setIsUploading(true);

    try {
      const docItem = await StorageService.uploadDocument(file, {
        meeting_id: currentMeeting.id,
        file_type: section,
        uploaded_by: currentUser.name,
        description: uploadDescription || `Uploaded to ${section}`
      });

      await addDocumentToMeeting(currentMeeting.id, docItem);
      setUploadDescription('');
    } catch (err) {
      console.error('File upload error:', err);
    } finally {
      setIsUploading(false);
    }
  };

  // Render Document List Helper
  const renderDocsList = (docs: DocumentItem[] | undefined, emptyLabel: string, sectionType: DocumentType) => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider font-mono">
          {sectionType} Documents ({docs?.length || 0})
        </h4>
        
        {/* Upload Button */}
        <label className="cursor-pointer px-2.5 py-1 bg-slate-100 dark:bg-[#12243d] hover:bg-slate-200 dark:hover:bg-[#1a3357] border border-slate-300 dark:border-[#213a60] text-emerald-800 dark:text-amber-300 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-sm">
          <Upload className="w-3.5 h-3.5 text-emerald-600 dark:text-amber-400" />
          <span>Upload {sectionType}</span>
          <input 
            type="file" 
            className="hidden" 
            disabled={isUploading}
            onChange={(e) => handleFileUpload(e, sectionType)} 
          />
        </label>
      </div>

      {!docs || docs.length === 0 ? (
        <div className="p-6 rounded-lg bg-slate-50 dark:bg-[#0c1626] border border-dashed border-slate-300 dark:border-[#1e3250] text-center text-xs text-slate-500 dark:text-slate-400">
          {emptyLabel}
        </div>
      ) : (
        <div className="space-y-2">
          {docs.map(doc => (
            <div 
              key={doc.id}
              className="p-3 rounded-lg bg-white dark:bg-[#0e192c] border border-slate-200 dark:border-[#1e3250] hover:border-emerald-500/40 dark:hover:border-amber-500/40 transition-colors flex items-center justify-between gap-3 shadow-sm"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 rounded bg-emerald-50 dark:bg-amber-500/10 text-emerald-700 dark:text-amber-400 border border-emerald-200 dark:border-amber-500/20 flex-shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate">{doc.name}</p>
                    <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {doc.file_format}
                    </span>
                    {doc.file_size && (
                      <span className="text-[10px] text-slate-400 font-mono">{doc.file_size}</span>
                    )}
                  </div>
                  {doc.description && (
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">{doc.description}</p>
                  )}
                  <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                    Uploaded by {doc.uploaded_by} on {doc.uploaded_at.split('T')[0]}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 flex-shrink-0">
                {doc.url || doc.content_base64 ? (
                  <a
                    href={doc.url || doc.content_base64}
                    download={doc.name}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 rounded-lg bg-slate-100 dark:bg-[#14233c] hover:bg-slate-200 dark:hover:bg-[#1a3055] text-slate-700 dark:text-slate-200 text-xs transition-colors"
                    title="Download / View Document"
                  >
                    <Download className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  </a>
                ) : (
                  <button 
                    disabled 
                    className="p-1.5 text-slate-400 cursor-not-allowed" 
                    title="Document stored"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // ==================== VIEW 1: MEETING DETAILS PAGE ====================
  if (currentMeeting) {
    return (
      <div className="space-y-6 pb-12">
        {/* Top Breadcrumb & Action Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-[#1b2d49]">
          <button
            onClick={() => setSelectedMeetingId(null)}
            className="text-xs text-emerald-700 dark:text-amber-400 hover:underline flex items-center gap-1.5 font-semibold transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Meetings</span>
          </button>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setIsPrintDocketOpen(true)}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-[#162744] dark:hover:bg-[#1e345c] text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-[#223d68] text-xs font-semibold rounded-lg shadow-sm transition-all flex items-center gap-1.5"
              title="Print Daily Engagements or Scheduled Meetings Docket"
            >
              <Printer className="w-4 h-4 text-emerald-600 dark:text-amber-400" />
              <span>Print Engagements</span>
            </button>

            <button
              onClick={() => openRescheduleModal(currentMeeting)}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-[#162744] dark:hover:bg-[#1e345c] text-slate-700 dark:text-amber-300 border border-slate-300 dark:border-[#223d68] text-xs font-semibold rounded-lg shadow-sm transition-all flex items-center gap-1.5"
              title="Reschedule this meeting"
            >
              <CalendarClock className="w-4 h-4 text-amber-500" />
              <span>Reschedule Meeting</span>
            </button>

            <button
              onClick={() => openDeleteModal(currentMeeting)}
              className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60 text-xs font-semibold rounded-lg shadow-sm transition-all flex items-center gap-1.5"
              title="Delete this meeting record"
            >
              <Trash2 className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              <span>Delete</span>
            </button>

            <button
              onClick={() => setIsAddDirectionModalOpen(true)}
              className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 dark:bg-amber-600 dark:hover:bg-amber-500 text-white dark:text-slate-950 text-xs font-bold rounded-lg shadow-sm transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add DG Direction</span>
            </button>
          </div>
        </div>

        {/* Meeting Header Card */}
        <div className="bg-white dark:bg-[#0e192c] border border-slate-200 dark:border-[#1e3250] rounded-xl p-5 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xs font-mono font-bold text-emerald-800 dark:text-amber-400 bg-emerald-50 dark:bg-amber-950/70 border border-emerald-300 dark:border-amber-600/40 px-2 py-0.5 rounded">
                  {currentMeeting.id}
                </span>
                <span className="text-xs px-2 py-0.5 rounded font-semibold bg-slate-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-300 border border-slate-300 dark:border-emerald-800">
                  {currentMeeting.category}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded font-semibold ${
                  currentMeeting.status === 'Rescheduled'
                    ? 'bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-600/40'
                    : 'bg-slate-100 dark:bg-[#172742] text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700'
                }`}>
                  {currentMeeting.status}
                </span>
              </div>
              <h2 className="text-lg md:text-xl font-bold text-slate-900 dark:text-slate-100 font-serif">
                {currentMeeting.title}
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 max-w-3xl">
                {currentMeeting.subject}
              </p>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#09121f] border border-slate-200 dark:border-[#1b2f4e] text-xs font-mono space-y-1 text-right flex-shrink-0">
              <div className="text-slate-600 dark:text-slate-400 flex items-center justify-end gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-emerald-600 dark:text-amber-400" />
                <span>{currentMeeting.date} ({currentMeeting.time})</span>
              </div>
              <div className="text-slate-600 dark:text-slate-400 flex items-center justify-end gap-1.5">
                <User className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="truncate max-w-[200px]">{currentMeeting.chairperson}</span>
              </div>
              <div className="text-[11px] text-emerald-700 dark:text-amber-400 font-bold pt-1 border-t border-slate-200 dark:border-[#172740]">
                {relatedDirections.length} Directions Associated
              </div>
            </div>
          </div>
        </div>

        {/* 7 DEDICATED TABS */}
        <div className="bg-white dark:bg-[#0e192c] border border-slate-200 dark:border-[#1e3250] rounded-xl overflow-hidden shadow-sm">
          {/* Tab Navigation */}
          <div className="flex items-center gap-1 overflow-x-auto p-2 bg-slate-50 dark:bg-[#09111e] border-b border-slate-200 dark:border-[#1b2d49]">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'agenda', label: 'Agenda & DG Brief' },
              { id: 'directions', label: `Directions Issued (${relatedDirections.length})` },
              { id: 'supporting', label: 'Supporting Documents' },
              { id: 'minutes', label: 'Minutes' },
              { id: 'compliance', label: 'Compliance Reports' },
              { id: 'activity', label: 'Activity History' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveMeetingTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  activeMeetingTab === tab.id
                    ? 'bg-emerald-100 dark:bg-amber-500/20 text-emerald-900 dark:text-amber-300 border border-emerald-300 dark:border-amber-500/40 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-[#132239]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-5">
            
            {/* 1. OVERVIEW TAB */}
            {activeMeetingTab === 'overview' && (
              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-[#091220] border border-slate-200 dark:border-[#1c2e4b] space-y-2">
                    <div className="text-slate-500 dark:text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                      Meeting Venue &amp; Schedule
                    </div>
                    <div className="text-slate-800 dark:text-slate-200 flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-emerald-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                      <span>{currentMeeting.venue}</span>
                    </div>
                    <div className="text-slate-800 dark:text-slate-200 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                      <span>{currentMeeting.date} at {currentMeeting.time}</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-[#091220] border border-slate-200 dark:border-[#1c2e4b] space-y-2">
                    <div className="text-slate-500 dark:text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                      Chair &amp; Participants
                    </div>
                    <div className="text-slate-800 dark:text-slate-200 flex items-start gap-2">
                      <User className="w-4 h-4 text-emerald-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong>Chairperson:</strong> {currentMeeting.chairperson}
                      </div>
                    </div>
                    <div className="text-slate-800 dark:text-slate-200 flex items-start gap-2">
                      <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong>Participants:</strong> {currentMeeting.participating_officers}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Reschedule History (if any) */}
                {currentMeeting.reschedule_history && currentMeeting.reschedule_history.length > 0 && (
                  <div className="p-3.5 rounded-lg bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 text-xs space-y-2">
                    <div className="text-amber-800 dark:text-amber-300 font-semibold uppercase text-[10px] tracking-wider flex items-center gap-1.5 font-mono">
                      <CalendarClock className="w-3.5 h-3.5" />
                      <span>Reschedule History ({currentMeeting.reschedule_history.length})</span>
                    </div>
                    <div className="space-y-2">
                      {currentMeeting.reschedule_history.map((rh, idx) => (
                        <div key={idx} className="bg-white/80 dark:bg-[#0c1626] p-2.5 rounded border border-amber-200 dark:border-[#22395d]">
                          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-800 dark:text-slate-200">
                            <span>Rescheduled to: <strong className="text-amber-700 dark:text-amber-400">{rh.new_date} ({rh.new_time || '11:00 AM'})</strong></span>
                            <span className="text-[10px] text-slate-400 font-mono">from {rh.previous_date} ({rh.previous_time || '11:00 AM'})</span>
                          </div>
                          <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1">
                            <strong>Reason:</strong> {rh.reason}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {currentMeeting.general_remarks && (
                  <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-[#091220] border border-slate-200 dark:border-[#1c2e4b] text-xs">
                    <div className="text-slate-500 dark:text-slate-400 font-semibold uppercase text-[10px] tracking-wider mb-1">
                      General Remarks &amp; Context
                    </div>
                    <p className="text-slate-800 dark:text-slate-200 whitespace-pre-wrap">{currentMeeting.general_remarks}</p>
                  </div>
                )}

                {/* Directions List in Overview */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider font-mono">
                      Associated DG Directions ({relatedDirections.length})
                    </h4>
                    <button
                      onClick={() => setIsAddDirectionModalOpen(true)}
                      className="text-xs text-emerald-700 dark:text-amber-400 hover:underline font-semibold flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Direction</span>
                    </button>
                  </div>

                  {relatedDirections.length === 0 ? (
                    <div className="p-6 rounded-lg bg-slate-50 dark:bg-[#091220] border border-dashed border-slate-300 dark:border-[#1c2e4b] text-center text-xs text-slate-500 dark:text-slate-400">
                      No directions recorded yet for this meeting.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {relatedDirections.map(d => (
                        <div
                          key={d.id}
                          onClick={() => {
                            setSelectedDirectionId(d.id);
                            setActiveTab('directions');
                          }}
                          className="p-3 rounded-lg bg-slate-50 dark:bg-[#091220] hover:bg-slate-100 dark:hover:bg-[#111e33] border border-slate-200 dark:border-[#1c2e4b] transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 group shadow-sm"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-mono text-xs font-bold text-amber-700 dark:text-amber-400">{d.id}</span>
                              <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                {d.priority} Priority
                              </span>
                              <span className={`text-[10px] font-semibold px-1.5 py-0.2 rounded ${
                                d.status === 'Completed' ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300' :
                                d.status === 'Overdue' ? 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300' :
                                'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300'
                              }`}>
                                {d.status}
                              </span>
                            </div>
                            <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 group-hover:text-emerald-700 dark:group-hover:text-amber-300 truncate">
                              {d.title}
                            </p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                              Officer: {d.responsible_officer} ({d.responsible_divisions.join(', ')})
                            </p>
                          </div>

                          <div className="flex items-center gap-3 text-xs font-mono text-right flex-shrink-0">
                            <div>
                              <div className="text-[10px] text-slate-400">Deadline</div>
                              <div className={d.status === 'Overdue' ? 'text-rose-600 dark:text-rose-400 font-bold' : 'text-slate-700 dark:text-slate-200'}>
                                {d.deadline}
                              </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-amber-400" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 2. AGENDA & DG BRIEF TAB */}
            {activeMeetingTab === 'agenda' && (
              <div className="space-y-6">
                {renderDocsList(currentMeeting.agenda_documents, 'No agenda uploaded yet.', 'Agenda')}
                <div className="border-t border-slate-200 dark:border-[#1b2d49] pt-5">
                  {renderDocsList(currentMeeting.dg_brief_documents, 'No DG brief uploaded yet.', 'DG Brief')}
                </div>
              </div>
            )}

            {/* 3. DIRECTIONS TAB */}
            {activeMeetingTab === 'directions' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-[#1b2d49]">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider font-mono">
                    Directions Originating from {currentMeeting.id}
                  </h4>
                  <button
                    onClick={() => setIsAddDirectionModalOpen(true)}
                    className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 dark:bg-amber-600 dark:hover:bg-amber-500 text-white dark:text-slate-950 text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add DG Direction</span>
                  </button>
                </div>

                {relatedDirections.length === 0 ? (
                  <div className="p-8 rounded-lg bg-slate-50 dark:bg-[#091220] border border-dashed border-slate-300 dark:border-[#1c2e4b] text-center text-xs text-slate-500 dark:text-slate-400">
                    No directions created yet for this meeting.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {relatedDirections.map(d => (
                      <div
                        key={d.id}
                        onClick={() => {
                          setSelectedDirectionId(d.id);
                          setActiveTab('directions');
                        }}
                        className="p-3.5 rounded-lg bg-slate-50 dark:bg-[#091220] hover:bg-slate-100 dark:hover:bg-[#111e33] border border-slate-200 dark:border-[#1c2e4b] transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-3 group shadow-sm"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono text-xs font-bold text-amber-700 dark:text-amber-400">{d.id}</span>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200">
                              {d.priority}
                            </span>
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                              d.status === 'Completed' ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300' :
                              d.status === 'Overdue' ? 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300' :
                              'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300'
                            }`}>
                              {d.status}
                            </span>
                          </div>
                          <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-100 group-hover:text-emerald-700 dark:group-hover:text-amber-300">
                            {d.title}
                          </h4>
                          <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 line-clamp-1">{d.description}</p>
                        </div>
                        <div className="text-right text-xs font-mono">
                          <div className="text-[10px] text-slate-400">Deadline</div>
                          <div className={d.status === 'Overdue' ? 'text-rose-600 dark:text-rose-400 font-bold' : 'text-slate-700 dark:text-slate-200'}>
                            {d.deadline}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 4. SUPPORTING DOCUMENTS */}
            {activeMeetingTab === 'supporting' && (
              <div className="space-y-6">
                {renderDocsList(currentMeeting.presentation_documents, 'No presentations uploaded.', 'Presentation')}
                <div className="border-t border-slate-200 dark:border-[#1b2d49] pt-5">
                  {renderDocsList(currentMeeting.supporting_data_documents, 'No spreadsheets or data files uploaded.', 'Supporting Data')}
                </div>
              </div>
            )}

            {/* 5. MINUTES */}
            {activeMeetingTab === 'minutes' && (
              <div>
                {renderDocsList(currentMeeting.minutes_documents, 'No minutes of meeting uploaded yet.', 'Minutes of Meeting')}
              </div>
            )}

            {/* 6. COMPLIANCE REPORTS */}
            {activeMeetingTab === 'compliance' && (
              <div>
                {renderDocsList(currentMeeting.compliance_report_documents, 'No compliance reports uploaded against this meeting.', 'Compliance Report')}
              </div>
            )}

            {/* 7. ACTIVITY */}
            {activeMeetingTab === 'activity' && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider font-mono pb-2 border-b border-slate-200 dark:border-[#1b2d49]">
                  Meeting Audit Log
                </h4>
                {meetingActivities.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400">No logs for this meeting.</div>
                ) : (
                  <div className="space-y-2">
                    {meetingActivities.map(act => (
                      <div key={act.id} className="p-3 rounded-lg bg-slate-50 dark:bg-[#091220] border border-slate-200 dark:border-[#1c2e4b] text-xs">
                        <div className="flex justify-between text-[11px] mb-1">
                          <span className="font-bold text-emerald-700 dark:text-amber-400">{act.action}</span>
                          <span className="text-slate-400 font-mono">{act.timestamp.split('T')[0]}</span>
                        </div>
                        {act.remarks && <p className="text-slate-600 dark:text-slate-300">{act.remarks}</p>}
                        <div className="text-[10px] text-slate-400 mt-1">Officer: {act.user_name}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>
        </div>

        {/* Modal: Add DG Direction from Meeting */}
        {isAddDirectionModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white dark:bg-[#0c1626] border border-slate-200 dark:border-[#22395d] rounded-xl max-w-xl w-full p-5 shadow-2xl space-y-4 my-8">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-[#1b2d49]">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 font-serif">Issue DG Direction</h3>
                  <p className="text-xs text-emerald-700 dark:text-amber-400 font-mono">Linked to: {currentMeeting.id}</p>
                </div>
                <button onClick={() => setIsAddDirectionModalOpen(false)} className="text-slate-500 hover:text-slate-800 dark:text-slate-400">✕</button>
              </div>

              <form onSubmit={handleAddDirectionFromMeeting} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Direction Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Conduct Joint Field Inspection"
                    value={dirTitle}
                    onChange={(e) => setDirTitle(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#070d18] text-slate-900 dark:text-slate-100 p-2.5 rounded-lg border border-slate-300 dark:border-[#1e3250] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Detailed Description *</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Enter instructions..."
                    value={dirDescription}
                    onChange={(e) => setDirDescription(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#070d18] text-slate-900 dark:text-slate-100 p-2.5 rounded-lg border border-slate-300 dark:border-[#1e3250] focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Responsible Division</label>
                    <select
                      value={dirDivisions[0]}
                      onChange={(e) => setDirDivisions([e.target.value])}
                      className="w-full bg-slate-50 dark:bg-[#070d18] text-slate-900 dark:text-slate-100 p-2.5 rounded-lg border border-slate-300 dark:border-[#1e3250]"
                    >
                      {['Administration', 'Large Scale Mining', 'Small Scale Mining', 'Minor Minerals', 'Resource Mapping', 'GIS', 'IT', 'Environmental Facilitation', 'Field Offices'].map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Priority</label>
                    <select
                      value={dirPriority}
                      onChange={(e) => setDirPriority(e.target.value as any)}
                      className="w-full bg-slate-50 dark:bg-[#070d18] text-slate-900 dark:text-slate-100 p-2.5 rounded-lg border border-slate-300 dark:border-[#1e3250]"
                    >
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Normal">Normal</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Responsible Officer</label>
                    <input
                      type="text"
                      required
                      value={dirOfficer}
                      onChange={(e) => setDirOfficer(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-[#070d18] text-slate-900 dark:text-slate-100 p-2.5 rounded-lg border border-slate-300 dark:border-[#1e3250]"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Deadline *</label>
                    <input
                      type="date"
                      required
                      value={dirDeadline}
                      onChange={(e) => setDirDeadline(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-[#070d18] text-slate-900 dark:text-slate-100 p-2.5 rounded-lg border border-slate-300 dark:border-[#1e3250]"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Expected Deliverable</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Survey report"
                    value={dirDeliverable}
                    onChange={(e) => setDirDeliverable(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#070d18] text-slate-900 dark:text-slate-100 p-2.5 rounded-lg border border-slate-300 dark:border-[#1e3250]"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-[#1b2d49]">
                  <button type="button" onClick={() => setIsAddDirectionModalOpen(false)} className="px-3 py-1.5 bg-slate-100 dark:bg-[#122036] text-slate-700 dark:text-slate-300 rounded-lg">Cancel</button>
                  <button type="submit" className="px-4 py-1.5 bg-emerald-700 dark:bg-amber-600 text-white dark:text-slate-950 font-bold rounded-lg shadow-sm">Save Direction</button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    );
  }

  // ==================== VIEW 2: ALL MEETINGS REGISTER ====================
  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-[#1b2d49]">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 font-serif">
            Meetings &amp; Briefs Management
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Maintain permanent institutional records of meetings chaired by the Director General.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPrintDocketOpen(true)}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-[#14233c] dark:hover:bg-[#1d3254] border border-slate-300 dark:border-[#22395d] text-slate-800 dark:text-slate-100 text-xs font-semibold rounded-lg shadow-sm transition-all flex items-center gap-1.5"
            title="Print or Export Daily Engagements & Scheduled Meetings (PDF)"
          >
            <Printer className="w-4 h-4 text-emerald-600 dark:text-amber-400" />
            <span>Print Engagements (PDF)</span>
          </button>

          <button
            onClick={() => setIsNewMeetingModalOpen(true)}
            className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-sm transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Record New Meeting</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-[#0e192c] border border-slate-200 dark:border-[#1e3250] rounded-xl p-3.5 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search meetings by title, subject, chair, ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 dark:bg-[#070d18] text-xs text-slate-900 dark:text-slate-200 pl-9 pr-4 py-2 rounded-lg border border-slate-300 dark:border-[#1e3250] focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-50 dark:bg-[#070d18] text-slate-700 dark:text-slate-300 px-3 py-2 rounded-lg border border-slate-300 dark:border-[#1e3250]"
          >
            <option value="all">All Categories</option>
            {MEETING_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 dark:bg-[#070d18] text-slate-700 dark:text-slate-300 px-3 py-2 rounded-lg border border-slate-300 dark:border-[#1e3250]"
          >
            <option value="all">All Statuses</option>
            {MEETING_STATUSES.map(st => <option key={st} value={st}>{st}</option>)}
          </select>
        </div>
      </div>

      {/* Meetings List */}
      <div className="space-y-3">
        {filteredMeetings.length === 0 ? (
          <div className="bg-white dark:bg-[#0e192c] border border-slate-200 dark:border-[#1e3250] rounded-xl p-12 text-center text-xs text-slate-400">
            {meetings.length === 0 ? (
              <div className="space-y-3">
                <p className="text-slate-500 dark:text-slate-400">No meetings recorded yet.</p>
                <button
                  onClick={() => setIsNewMeetingModalOpen(true)}
                  className="px-4 py-2 bg-emerald-700 text-white rounded-lg font-bold"
                >
                  Record First Meeting
                </button>
              </div>
            ) : (
              'No meetings found matching your filter criteria.'
            )}
          </div>
        ) : (
          filteredMeetings.map(m => {
            const relDirections = directions.filter(d => d.meeting_id === m.id && !d.is_archived);
            const completedCount = relDirections.filter(d => d.status === 'Completed').length;
            const pendingCount = relDirections.filter(d => d.status !== 'Completed').length;

            return (
              <div
                key={m.id}
                onClick={() => {
                  setSelectedMeetingId(m.id);
                  setActiveMeetingTab('overview');
                }}
                className="bg-white dark:bg-[#0e192c] hover:bg-slate-50 dark:hover:bg-[#13223b] border border-slate-200 dark:border-[#1e3250] rounded-xl p-4 transition-all cursor-pointer shadow-sm group"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="font-mono text-xs font-bold text-emerald-800 dark:text-amber-400 bg-emerald-50 dark:bg-amber-950/70 border border-emerald-300 dark:border-amber-600/40 px-2 py-0.5 rounded">
                        {m.id}
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200">
                        {m.category}
                      </span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                        m.status === 'Rescheduled'
                          ? 'bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-600/40'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}>
                        {m.status}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-emerald-700 dark:group-hover:text-amber-300 transition-colors">
                      {m.title}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 line-clamp-1">
                      {m.subject}
                    </p>

                    <div className="text-[11px] text-slate-500 mt-2 flex items-center gap-4">
                      <span>{m.date} ({m.time})</span>
                      <span>&bull;</span>
                      <span className="truncate max-w-[200px]">{m.chairperson}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-4 text-xs font-mono border-t md:border-t-0 pt-2 md:pt-0 border-slate-200 dark:border-[#1a2c47]">
                    <div className="text-right">
                      <div className="text-slate-800 dark:text-slate-200 font-bold">{relDirections.length} directions</div>
                      <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">{completedCount} completed</div>
                      <div className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">{pendingCount} pending</div>
                    </div>
                    
                    {/* Action buttons */}
                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => openRescheduleModal(m)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-[#1a2c47] transition-colors"
                        title="Reschedule Meeting"
                      >
                        <CalendarClock className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openDeleteModal(m)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        title="Delete Meeting"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-amber-400 transition-all" />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal: Create New Meeting */}
      {isNewMeetingModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#0c1626] border border-slate-200 dark:border-[#22395d] rounded-xl max-w-2xl w-full p-5 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-[#1b2d49]">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 font-serif">
                  Record New Official Meeting
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Create a permanent record for a meeting chaired or conducted by the DG
                </p>
              </div>
              <button onClick={() => setIsNewMeetingModalOpen(false)} className="text-slate-500 hover:text-slate-800 dark:text-slate-400">✕</button>
            </div>

            <form onSubmit={handleCreateMeeting} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Meeting Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Review of Mining Leases and Royalty Targets"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#070d18] text-slate-900 dark:text-slate-100 p-2.5 rounded-lg border border-slate-300 dark:border-[#1e3250]"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Meeting Subject / Purpose *</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Purpose and context..."
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#070d18] text-slate-900 dark:text-slate-100 p-2.5 rounded-lg border border-slate-300 dark:border-[#1e3250]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#070d18] text-slate-900 dark:text-slate-100 p-2.5 rounded-lg border border-slate-300 dark:border-[#1e3250]"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Time *</label>
                  <input
                    type="text"
                    required
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#070d18] text-slate-900 dark:text-slate-100 p-2.5 rounded-lg border border-slate-300 dark:border-[#1e3250]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full bg-slate-50 dark:bg-[#070d18] text-slate-900 dark:text-slate-100 p-2.5 rounded-lg border border-slate-300 dark:border-[#1e3250]"
                  >
                    {MEETING_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as any)}
                    className="w-full bg-slate-50 dark:bg-[#070d18] text-slate-900 dark:text-slate-100 p-2.5 rounded-lg border border-slate-300 dark:border-[#1e3250]"
                  >
                    {MEETING_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Venue</label>
                <input
                  type="text"
                  required
                  value={newVenue}
                  onChange={(e) => setNewVenue(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#070d18] text-slate-900 dark:text-slate-100 p-2.5 rounded-lg border border-slate-300 dark:border-[#1e3250]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Chairperson</label>
                  <input
                    type="text"
                    required
                    value={newChairperson}
                    onChange={(e) => setNewChairperson(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#070d18] text-slate-900 dark:text-slate-100 p-2.5 rounded-lg border border-slate-300 dark:border-[#1e3250]"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Participating Officers</label>
                  <input
                    type="text"
                    required
                    value={newParticipants}
                    onChange={(e) => setNewParticipants(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#070d18] text-slate-900 dark:text-slate-100 p-2.5 rounded-lg border border-slate-300 dark:border-[#1e3250]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-[#1b2d49]">
                <button
                  type="button"
                  onClick={() => setIsNewMeetingModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-[#122036] text-slate-700 dark:text-slate-300 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold shadow-sm"
                >
                  Save Meeting Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Reschedule Meeting */}
      {isRescheduleModalOpen && meetingToReschedule && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#0c1626] border border-slate-200 dark:border-[#22395d] rounded-xl max-w-lg w-full p-5 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-[#1b2d49]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400">
                  <CalendarClock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 font-serif">
                    Reschedule Meeting
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                    {meetingToReschedule.id} &bull; {meetingToReschedule.title}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setIsRescheduleModalOpen(false);
                  setMeetingToReschedule(null);
                }} 
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmReschedule} className="space-y-3.5 text-xs">
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#08101d] border border-slate-200 dark:border-[#192b45] text-slate-600 dark:text-slate-300">
                <span className="text-[10px] font-semibold text-slate-500 block uppercase font-mono mb-1">Current Schedule</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{meetingToReschedule.date} at {meetingToReschedule.time}</span>
                <div className="text-[11px] text-slate-500 mt-0.5">{meetingToReschedule.venue}</div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    New Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={rescheduleDate}
                    onChange={(e) => setRescheduleDate(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#070d18] text-slate-900 dark:text-slate-100 p-2.5 rounded-lg border border-slate-300 dark:border-[#1e3250] focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    New Time *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 11:30 AM"
                    value={rescheduleTime}
                    onChange={(e) => setRescheduleTime(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#070d18] text-slate-900 dark:text-slate-100 p-2.5 rounded-lg border border-slate-300 dark:border-[#1e3250] focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Venue (optional update)
                </label>
                <input
                  type="text"
                  value={rescheduleVenue}
                  onChange={(e) => setRescheduleVenue(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#070d18] text-slate-900 dark:text-slate-100 p-2.5 rounded-lg border border-slate-300 dark:border-[#1e3250] focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Reason for Rescheduling *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Official reason for rescheduling (e.g., DG attending Provincial Cabinet meeting; shifted on request of Division Heads)..."
                  value={rescheduleReason}
                  onChange={(e) => setRescheduleReason(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#070d18] text-slate-900 dark:text-slate-100 p-2.5 rounded-lg border border-slate-300 dark:border-[#1e3250] focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-[#1b2d49]">
                <button
                  type="button"
                  onClick={() => {
                    setIsRescheduleModalOpen(false);
                    setMeetingToReschedule(null);
                  }}
                  className="px-4 py-2 rounded-lg border border-slate-300 dark:border-[#22395d] text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#14233c] font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold transition-all shadow-sm"
                >
                  Confirm Reschedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Delete Meeting Confirmation */}
      {isDeleteModalOpen && meetingToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0c1626] border border-slate-200 dark:border-[#22395d] rounded-xl max-w-md w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-full bg-rose-100 dark:bg-rose-950/70 text-rose-600 dark:text-rose-400 flex-shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 font-serif">
                  Delete Meeting Record?
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Are you sure you want to delete this meeting?
                </p>
                <div className="mt-2.5 p-2.5 rounded-lg bg-slate-50 dark:bg-[#08101d] border border-slate-200 dark:border-[#192b45] text-xs">
                  <div className="font-mono font-bold text-emerald-800 dark:text-amber-400">{meetingToDelete.id}</div>
                  <div className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{meetingToDelete.title}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{meetingToDelete.date} ({meetingToDelete.time})</div>
                </div>
                {directions.filter(d => d.meeting_id === meetingToDelete.id && !d.is_archived).length > 0 && (
                  <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-2 font-medium">
                    ⚠️ Notice: {directions.filter(d => d.meeting_id === meetingToDelete.id && !d.is_archived).length} direction(s) are linked to this meeting.
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-[#1b2d49]">
              <button
                type="button"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setMeetingToDelete(null);
                }}
                className="px-4 py-2 rounded-lg border border-slate-300 dark:border-[#22395d] text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#14233c] text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Meeting</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
