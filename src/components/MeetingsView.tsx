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
  CheckCircle2, 
  AlertTriangle,
  History,
  FileCheck,
  Eye,
  FileSpreadsheet,
  FileBox,
  Layers,
  ChevronRight
} from 'lucide-react';

export const MeetingsView: React.FC = () => {
  const { 
    meetings, 
    directions, 
    createMeeting, 
    updateMeeting, 
    createDirection,
    addDocumentToMeeting,
    selectedMeetingId, 
    setSelectedMeetingId,
    setSelectedDirectionId,
    setActiveTab,
    activityLogs,
    currentUser
  } = useApp();

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Modals state
  const [isNewMeetingModalOpen, setIsNewMeetingModalOpen] = useState(false);
  const [isAddDirectionModalOpen, setIsAddDirectionModalOpen] = useState(false);
  const [activeMeetingTab, setActiveMeetingTab] = useState<'overview' | 'agenda' | 'directions' | 'supporting' | 'minutes' | 'compliance' | 'activity'>('overview');

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
  const [uploadSection, setUploadSection] = useState<DocumentType>('Agenda');
  const [uploadDescription, setUploadDescription] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // Selected meeting object
  const currentMeeting = meetings.find(m => m.id === selectedMeetingId);
  const relatedDirections = directions.filter(d => d.meeting_id === selectedMeetingId && !d.is_archived);
  const meetingActivities = activityLogs.filter(a => a.entity_id === selectedMeetingId || a.entity_type === 'meeting' && a.entity_id === selectedMeetingId);

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
        <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
          {sectionType} Documents ({docs?.length || 0})
        </h4>
        
        {/* Upload Button */}
        <label className="cursor-pointer px-2.5 py-1 bg-[#12243d] hover:bg-[#1a3357] border border-[#213a60] text-amber-300 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-sm">
          <Upload className="w-3.5 h-3.5 text-amber-400" />
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
        <div className="p-6 rounded-lg bg-[#0c1626] border border-dashed border-[#1e3250] text-center text-xs text-slate-400">
          {emptyLabel}
        </div>
      ) : (
        <div className="space-y-2">
          {docs.map(doc => (
            <div 
              key={doc.id}
              className="p-3 rounded-lg bg-[#0e192c] border border-[#1e3250] hover:border-amber-500/40 transition-colors flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 flex-shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-semibold text-slate-100 truncate">{doc.name}</p>
                    <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                      {doc.file_format}
                    </span>
                    {doc.file_size && (
                      <span className="text-[10px] text-slate-400 font-mono">{doc.file_size}</span>
                    )}
                  </div>
                  {doc.description && (
                    <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{doc.description}</p>
                  )}
                  <div className="text-[10px] text-slate-500 mt-0.5 font-mono">
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
                    className="p-1.5 rounded-lg bg-[#14233c] hover:bg-[#1a3055] text-slate-200 text-xs transition-colors"
                    title="Download / View Document"
                  >
                    <Download className="w-4 h-4 text-emerald-400" />
                  </a>
                ) : (
                  <button 
                    disabled 
                    className="p-1.5 text-slate-600 cursor-not-allowed" 
                    title="Document stored in cloud registry"
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
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-[#1b2d49]">
          <button
            onClick={() => setSelectedMeetingId(null)}
            className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1.5 font-semibold transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Meetings</span>
          </button>

          <div className="flex items-center gap-2">
            {/* Essential Requirement D: Add DG Direction from Meeting */}
            <button
              onClick={() => setIsAddDirectionModalOpen(true)}
              className="px-3.5 py-1.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-slate-950 text-xs font-bold rounded-lg shadow transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4 text-slate-950" />
              <span>Add DG Direction</span>
            </button>
          </div>
        </div>

        {/* Meeting Header Card */}
        <div className="bg-[#0e192c] border border-[#1e3250] rounded-xl p-5 shadow-lg">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xs font-mono font-bold text-amber-400 bg-amber-950/70 border border-amber-600/40 px-2 py-0.5 rounded">
                  {currentMeeting.id}
                </span>
                <span className="text-xs px-2 py-0.5 rounded font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800">
                  {currentMeeting.category}
                </span>
                <span className="text-xs px-2 py-0.5 rounded font-semibold bg-[#172742] text-slate-200 border border-slate-700">
                  {currentMeeting.status}
                </span>
              </div>
              <h2 className="text-lg md:text-xl font-bold text-slate-100 font-serif">
                {currentMeeting.title}
              </h2>
              <p className="text-xs text-slate-300 mt-1 max-w-3xl">
                {currentMeeting.subject}
              </p>
            </div>

            <div className="p-3 rounded-lg bg-[#09121f] border border-[#1b2f4e] text-xs font-mono space-y-1 text-right flex-shrink-0">
              <div className="text-slate-400 flex items-center justify-end gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                <span>{currentMeeting.date} ({currentMeeting.time})</span>
              </div>
              <div className="text-slate-400 flex items-center justify-end gap-1.5">
                <User className="w-3.5 h-3.5 text-emerald-400" />
                <span className="truncate max-w-[200px]">{currentMeeting.chairperson}</span>
              </div>
              <div className="text-[11px] text-amber-400 font-bold pt-1 border-t border-[#172740]">
                {relatedDirections.length} Directions Associated
              </div>
            </div>
          </div>
        </div>

        {/* C. 7 DEDICATED TABS */}
        <div className="bg-[#0e192c] border border-[#1e3250] rounded-xl overflow-hidden shadow">
          {/* Tab Navigation */}
          <div className="flex items-center gap-1 overflow-x-auto p-2 bg-[#09111e] border-b border-[#1b2d49]">
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
                className={`px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  activeMeetingTab === tab.id
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#132239]'
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
                  <div className="p-3.5 rounded-lg bg-[#091220] border border-[#1c2e4b] space-y-2">
                    <div className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                      Meeting Venue & Schedule
                    </div>
                    <div className="text-slate-200 flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                      <span>{currentMeeting.venue}</span>
                    </div>
                    <div className="text-slate-200 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      <span>{currentMeeting.date} at {currentMeeting.time}</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-lg bg-[#091220] border border-[#1c2e4b] space-y-2">
                    <div className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                      Chair & Participants
                    </div>
                    <div className="text-slate-200 flex items-start gap-2">
                      <User className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong>Chairperson:</strong> {currentMeeting.chairperson}
                      </div>
                    </div>
                    <div className="text-slate-200 flex items-start gap-2">
                      <Users className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong>Participating Officers:</strong> {currentMeeting.participating_officers}
                      </div>
                    </div>
                  </div>
                </div>

                {currentMeeting.general_remarks && (
                  <div className="p-3.5 rounded-lg bg-[#091220] border border-[#1c2e4b] text-xs">
                    <div className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider mb-1">
                      General Remarks & Context
                    </div>
                    <p className="text-slate-200 whitespace-pre-wrap">{currentMeeting.general_remarks}</p>
                  </div>
                )}

                {/* Quick Directions Summary on Overview */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
                      Associated DG Directions ({relatedDirections.length})
                    </h4>
                    <button
                      onClick={() => setIsAddDirectionModalOpen(true)}
                      className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Direction</span>
                    </button>
                  </div>

                  {relatedDirections.length === 0 ? (
                    <div className="p-6 rounded-lg bg-[#091220] border border-dashed border-[#1c2e4b] text-center text-xs text-slate-400">
                      No directions have been issued against this meeting yet. Click "Add DG Direction" to issue one.
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
                          className="p-3 rounded-lg bg-[#091220] hover:bg-[#111e33] border border-[#1c2e4b] transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-mono text-xs font-bold text-amber-400">{d.id}</span>
                              <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                                {d.priority} Priority
                              </span>
                              <span className={`text-[10px] font-semibold px-1.5 py-0.2 rounded ${
                                d.status === 'Completed' ? 'bg-emerald-950 text-emerald-300' :
                                d.status === 'Overdue' ? 'bg-rose-950 text-rose-300' :
                                'bg-blue-950 text-blue-300'
                              }`}>
                                {d.status}
                              </span>
                            </div>
                            <p className="text-xs font-semibold text-slate-100 group-hover:text-amber-300 truncate">
                              {d.title}
                            </p>
                            <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                              Assigned to: {d.responsible_officer} ({d.responsible_divisions.join(', ')})
                            </p>
                          </div>

                          <div className="flex items-center gap-3 text-xs font-mono text-right flex-shrink-0">
                            <div>
                              <div className="text-[10px] text-slate-400">Deadline</div>
                              <div className={d.status === 'Overdue' ? 'text-rose-400 font-bold' : 'text-slate-200'}>
                                {d.deadline}
                              </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400" />
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
                {renderDocsList(
                  currentMeeting.agenda_documents, 
                  'No official agenda has been uploaded yet for this meeting.', 
                  'Agenda'
                )}

                <div className="border-t border-[#1b2d49] pt-5">
                  {renderDocsList(
                    currentMeeting.dg_brief_documents, 
                    'No DG briefing document uploaded yet for this meeting.', 
                    'DG Brief'
                  )}
                </div>
              </div>
            )}

            {/* 3. DIRECTIONS ISSUED TAB */}
            {activeMeetingTab === 'directions' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-[#1b2d49]">
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
                    All Directions Originating from {currentMeeting.id}
                  </h4>
                  <button
                    onClick={() => setIsAddDirectionModalOpen(true)}
                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-slate-950 text-xs font-bold rounded-lg shadow transition-colors flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4 text-slate-950" />
                    <span>Add DG Direction</span>
                  </button>
                </div>

                {relatedDirections.length === 0 ? (
                  <div className="p-8 rounded-lg bg-[#091220] border border-dashed border-[#1c2e4b] text-center text-xs text-slate-400">
                    No directions created yet for this meeting.
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {relatedDirections.map(d => (
                      <div
                        key={d.id}
                        onClick={() => {
                          setSelectedDirectionId(d.id);
                          setActiveTab('directions');
                        }}
                        className="p-4 rounded-lg bg-[#091220] hover:bg-[#111e33] border border-[#1c2e4b] transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-3 group"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono text-xs font-bold text-amber-400">{d.id}</span>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-200">
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
                          <h4 className="text-xs font-semibold text-slate-100 group-hover:text-amber-300">
                            {d.title}
                          </h4>
                          <p className="text-[11px] text-slate-300 mt-1 line-clamp-2">
                            {d.description}
                          </p>
                          <div className="text-[11px] text-slate-400 mt-1.5 flex flex-wrap gap-x-3 gap-y-1">
                            <span>Responsible Division: <strong className="text-slate-200">{d.responsible_divisions.join(', ')}</strong></span>
                            <span>Officer: <strong className="text-slate-200">{d.responsible_officer}</strong></span>
                            <span>Deliverable: <strong className="text-slate-200">{d.expected_deliverable}</strong></span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between md:justify-end gap-4 text-xs font-mono text-right flex-shrink-0">
                          <div>
                            <div className="text-[10px] text-slate-400">Deadline</div>
                            <div className={d.status === 'Overdue' ? 'text-rose-400 font-bold' : 'text-slate-200 font-semibold'}>
                              {d.deadline}
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 4. SUPPORTING DOCUMENTS TAB */}
            {activeMeetingTab === 'supporting' && (
              <div className="space-y-6">
                {renderDocsList(
                  currentMeeting.presentation_documents, 
                  'No presentations uploaded for this meeting.', 
                  'Presentation'
                )}

                <div className="border-t border-[#1b2d49] pt-5">
                  {renderDocsList(
                    currentMeeting.supporting_data_documents, 
                    'No spreadsheets or supporting data files uploaded for this meeting.', 
                    'Supporting Data'
                  )}
                </div>
              </div>
            )}

            {/* 5. MINUTES TAB */}
            {activeMeetingTab === 'minutes' && (
              <div className="space-y-4">
                {renderDocsList(
                  currentMeeting.minutes_documents, 
                  'Official minutes of meeting have not yet been uploaded.', 
                  'Minutes of Meeting'
                )}
              </div>
            )}

            {/* 6. COMPLIANCE REPORTS TAB */}
            {activeMeetingTab === 'compliance' && (
              <div className="space-y-4">
                {renderDocsList(
                  currentMeeting.compliance_report_documents, 
                  'No compliance reports have been filed against this meeting yet.', 
                  'Compliance Report'
                )}
              </div>
            )}

            {/* 7. ACTIVITY HISTORY TAB */}
            {activeMeetingTab === 'activity' && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono pb-2 border-b border-[#1b2d49]">
                  Immutable Meeting Audit Log
                </h4>

                {meetingActivities.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400">
                    No activity logs recorded for this meeting.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {meetingActivities.map(act => (
                      <div key={act.id} className="p-3 rounded-lg bg-[#091220] border border-[#1c2e4b] text-xs">
                        <div className="flex items-center justify-between text-[11px] mb-1">
                          <span className="font-bold text-amber-400">{act.action}</span>
                          <span className="text-slate-400 font-mono">{act.timestamp}</span>
                        </div>
                        {act.remarks && <p className="text-slate-300">{act.remarks}</p>}
                        <div className="text-[10px] text-slate-500 mt-1">
                          Officer: {act.user_name} ({act.user_role})
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>
        </div>

        {/* Modal: Add DG Direction Directly from Meeting (Auto-linked) */}
        {isAddDirectionModalOpen && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-[#0c1626] border border-[#22395d] rounded-xl max-w-xl w-full p-5 shadow-2xl space-y-4 my-8">
              <div className="flex items-center justify-between pb-3 border-b border-[#1b2d49]">
                <div>
                  <h3 className="text-sm font-bold text-slate-100 font-serif">
                    Issue New DG Direction
                  </h3>
                  <p className="text-xs text-amber-400 font-mono">
                    Auto-Linked to: {currentMeeting.id} - {currentMeeting.title}
                  </p>
                </div>
                <button 
                  onClick={() => setIsAddDirectionModalOpen(false)}
                  className="text-slate-400 hover:text-white text-sm"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleAddDirectionFromMeeting} className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Direction Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Conduct Joint Field DGPS Survey of Dandot Mining Block"
                    value={dirTitle}
                    onChange={(e) => setDirTitle(e.target.value)}
                    className="w-full bg-[#070d18] text-slate-100 p-2.5 rounded-lg border border-[#1e3250] focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Detailed Description *
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Enter explicit executive instructions issued by the DG..."
                    value={dirDescription}
                    onChange={(e) => setDirDescription(e.target.value)}
                    className="w-full bg-[#070d18] text-slate-100 p-2.5 rounded-lg border border-[#1e3250] focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      Responsible Division *
                    </label>
                    <select
                      value={dirDivisions[0]}
                      onChange={(e) => setDirDivisions([e.target.value])}
                      className="w-full bg-[#070d18] text-slate-100 p-2.5 rounded-lg border border-[#1e3250] focus:border-amber-500 focus:outline-none"
                    >
                      {['Administration', 'Large Scale Mining', 'Small Scale Mining', 'Minor Minerals', 'Resource Mapping', 'GIS', 'IT', 'Environmental Facilitation', 'Field Offices'].map(div => (
                        <option key={div} value={div}>{div}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      Priority Level *
                    </label>
                    <select
                      value={dirPriority}
                      onChange={(e) => setDirPriority(e.target.value as any)}
                      className="w-full bg-[#070d18] text-slate-100 p-2.5 rounded-lg border border-[#1e3250] focus:border-amber-500 focus:outline-none"
                    >
                      <option value="High">High Priority</option>
                      <option value="Medium">Medium Priority</option>
                      <option value="Normal">Normal Priority</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      Responsible Officer / Designation *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Director (SSM) / Senior Mining Officer"
                      value={dirOfficer}
                      onChange={(e) => setDirOfficer(e.target.value)}
                      className="w-full bg-[#070d18] text-slate-100 p-2.5 rounded-lg border border-[#1e3250] focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      Compliance Deadline *
                    </label>
                    <input
                      type="date"
                      required
                      value={dirDeadline}
                      onChange={(e) => setDirDeadline(e.target.value)}
                      className="w-full bg-[#070d18] text-slate-100 p-2.5 rounded-lg border border-[#1e3250] focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Expected Deliverable *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Signed physical survey report and geo-tagged photographs"
                    value={dirDeliverable}
                    onChange={(e) => setDirDeliverable(e.target.value)}
                    className="w-full bg-[#070d18] text-slate-100 p-2.5 rounded-lg border border-[#1e3250] focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Remarks / Specific Instructions
                  </label>
                  <input
                    type="text"
                    placeholder="Any additional notes or interim reporting stages..."
                    value={dirRemarks}
                    onChange={(e) => setDirRemarks(e.target.value)}
                    className="w-full bg-[#070d18] text-slate-100 p-2.5 rounded-lg border border-[#1e3250] focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#1b2d49]">
                  <button
                    type="button"
                    onClick={() => setIsAddDirectionModalOpen(false)}
                    className="px-4 py-2 bg-[#122036] hover:bg-[#1a3055] text-slate-300 rounded-lg font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-slate-950 rounded-lg font-bold shadow"
                  >
                    Issue Direction
                  </button>
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-[#1b2d49]">
        <div>
          <h2 className="text-xl font-bold text-slate-100 font-serif">
            Meetings & Briefs Management
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Permanent institutional record of meetings chaired by the Director General, agendas, briefings, minutes, and directions.
          </p>
        </div>

        <button
          onClick={() => setIsNewMeetingModalOpen(true)}
          className="px-3.5 py-2 bg-gradient-to-r from-emerald-700 to-emerald-800 hover:from-emerald-600 hover:to-emerald-700 text-slate-100 text-xs font-bold rounded-lg shadow transition-all flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4 text-emerald-200" />
          <span>Record New Meeting</span>
        </button>
      </div>

      {/* Filters & Search */}
      <div className="bg-[#0e192c] border border-[#1e3250] rounded-xl p-3.5 shadow flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search meetings by title, subject, chair, ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#070d18] text-xs text-slate-200 pl-9 pr-4 py-2 rounded-lg border border-[#1e3250] focus:border-amber-500 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-[#070d18] text-slate-300 px-3 py-2 rounded-lg border border-[#1e3250] focus:border-amber-500 focus:outline-none"
          >
            <option value="all">All Categories</option>
            {MEETING_CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#070d18] text-slate-300 px-3 py-2 rounded-lg border border-[#1e3250] focus:border-amber-500 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            {MEETING_STATUSES.map(st => (
              <option key={st} value={st}>{st}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Meetings List */}
      <div className="space-y-3">
        {filteredMeetings.length === 0 ? (
          <div className="bg-[#0e192c] border border-[#1e3250] rounded-xl p-12 text-center text-xs text-slate-400">
            No meetings found matching your filter criteria.
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
                className="bg-[#0e192c] hover:bg-[#13223b] border border-[#1e3250] hover:border-amber-500/50 rounded-xl p-4 transition-all cursor-pointer shadow group"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="font-mono text-xs font-bold text-amber-400 bg-amber-950/70 border border-amber-600/40 px-2 py-0.5 rounded">
                        {m.id}
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-200">
                        {m.category}
                      </span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                        m.status === 'Concluded' ? 'bg-emerald-950 text-emerald-300' :
                        m.status === 'Follow-up Required' ? 'bg-amber-950 text-amber-300' :
                        'bg-blue-950 text-blue-300'
                      }`}>
                        {m.status}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-100 group-hover:text-amber-300 transition-colors">
                      {m.title}
                    </h3>
                    <p className="text-xs text-slate-300 mt-1 line-clamp-1">
                      {m.subject}
                    </p>

                    <div className="text-[11px] text-slate-400 mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-amber-400" />
                        <span>{m.date} ({m.time})</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="truncate max-w-[220px]">{m.venue}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-blue-400" />
                        <span className="truncate max-w-[200px]">{m.chairperson}</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-5 text-xs font-mono border-t md:border-t-0 pt-2 md:pt-0 border-[#1a2c47]">
                    <div className="text-right">
                      <div className="text-slate-200 font-bold">{relDirections.length} directions</div>
                      <div className="text-[10px] text-emerald-400 font-semibold">{completedCount} completed</div>
                      <div className="text-[10px] text-amber-400 font-semibold">{pendingCount} pending</div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal: Create New Meeting */}
      {isNewMeetingModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0c1626] border border-[#22395d] rounded-xl max-w-2xl w-full p-5 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-[#1b2d49]">
              <div>
                <h3 className="text-base font-bold text-slate-100 font-serif">
                  Record New Official Meeting
                </h3>
                <p className="text-xs text-slate-400">
                  Create a permanent record for a meeting chaired or conducted by the DG
                </p>
              </div>
              <button 
                onClick={() => setIsNewMeetingModalOpen(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateMeeting} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Meeting Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Review of Salt Range Concessions & Royalty Rationalization"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-[#070d18] text-slate-100 p-2.5 rounded-lg border border-[#1e3250] focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Meeting Subject / Purpose *
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="Briefly state the executive purpose and context..."
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  className="w-full bg-[#070d18] text-slate-100 p-2.5 rounded-lg border border-[#1e3250] focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Meeting Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full bg-[#070d18] text-slate-100 p-2.5 rounded-lg border border-[#1e3250] focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Meeting Time *
                  </label>
                  <input
                    type="text"
                    required
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    placeholder="e.g. 11:00 AM"
                    className="w-full bg-[#070d18] text-slate-100 p-2.5 rounded-lg border border-[#1e3250] focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Meeting Category *
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full bg-[#070d18] text-slate-100 p-2.5 rounded-lg border border-[#1e3250] focus:border-amber-500 focus:outline-none"
                  >
                    {MEETING_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Initial Status *
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as any)}
                    className="w-full bg-[#070d18] text-slate-100 p-2.5 rounded-lg border border-[#1e3250] focus:border-amber-500 focus:outline-none"
                  >
                    {MEETING_STATUSES.map(st => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Venue *
                </label>
                <input
                  type="text"
                  required
                  value={newVenue}
                  onChange={(e) => setNewVenue(e.target.value)}
                  className="w-full bg-[#070d18] text-slate-100 p-2.5 rounded-lg border border-[#1e3250] focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Chairperson *
                  </label>
                  <input
                    type="text"
                    required
                    value={newChairperson}
                    onChange={(e) => setNewChairperson(e.target.value)}
                    className="w-full bg-[#070d18] text-slate-100 p-2.5 rounded-lg border border-[#1e3250] focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Participating Officers / Departments *
                  </label>
                  <input
                    type="text"
                    required
                    value={newParticipants}
                    onChange={(e) => setNewParticipants(e.target.value)}
                    className="w-full bg-[#070d18] text-slate-100 p-2.5 rounded-lg border border-[#1e3250] focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  General Remarks / Decisions Summary
                </label>
                <textarea
                  rows={2}
                  placeholder="Summary remarks or initial proceedings..."
                  value={newRemarks}
                  onChange={(e) => setNewRemarks(e.target.value)}
                  className="w-full bg-[#070d18] text-slate-100 p-2.5 rounded-lg border border-[#1e3250] focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#1b2d49]">
                <button
                  type="button"
                  onClick={() => setIsNewMeetingModalOpen(false)}
                  className="px-4 py-2 bg-[#122036] hover:bg-[#1a3055] text-slate-300 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-slate-100 rounded-lg font-bold shadow"
                >
                  Save Meeting Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
