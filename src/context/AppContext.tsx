import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { 
  Meeting, 
  Direction, 
  ActivityLog, 
  UserProfile, 
  CloudConfig, 
  ComplianceSubmission, 
  DocumentItem,
  DivisionPerformance,
  FieldOfficePerformance
} from '../types';
import { SAMPLE_USERS, DEPARTMENTAL_DIVISIONS, FIELD_OFFICES } from '../data/constants';
import { StorageService, calculateDirectionStatus } from '../services/storageService';
import { getStoredCloudConfig, saveStoredCloudConfig, initSupabaseClient } from '../services/supabaseClient';

interface AppContextType {
  // Theme state
  theme: 'dark' | 'light';
  toggleTheme: () => void;

  // Navigation & View state
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedMeetingId: string | null;
  setSelectedMeetingId: (id: string | null) => void;
  selectedDirectionId: string | null;
  setSelectedDirectionId: (id: string | null) => void;
  selectedDivisionFilter: string | null;
  setSelectedDivisionFilter: (division: string | null) => void;
  selectedFieldOfficeFilter: string | null;
  setSelectedFieldOfficeFilter: (office: string | null) => void;

  // Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Data
  meetings: Meeting[];
  directions: Direction[];
  activityLogs: ActivityLog[];
  currentUser: UserProfile;
  setCurrentUser: (user: UserProfile) => void;
  cloudConfig: CloudConfig;

  // KPIs & Dynamic Statistics
  kpis: {
    totalMeetings: number;
    totalDirections: number;
    pendingDirections: number;
    inProgressDirections: number;
    completedDirections: number;
    overdueDirections: number;
    dueThisWeekDirections: number;
    dueIn48HoursDirections: number;
    complianceAwaitedDirections: number;
    underReviewDirections: number;
    complianceSubmittedDirections: number;
    meetingsRequiringFollowUp: number;
  };

  divisionPerformances: DivisionPerformance[];
  fieldOfficePerformances: FieldOfficePerformance[];

  // CRUD & Actions
  createMeeting: (data: Partial<Meeting>) => Promise<Meeting>;
  updateMeeting: (meeting: Meeting) => Promise<void>;
  deleteMeeting: (meetingId: string) => Promise<void>;
  rescheduleMeeting: (
    meetingId: string, 
    newDate: string, 
    newTime: string, 
    reason: string, 
    newVenue?: string
  ) => Promise<void>;
  createDirection: (data: Partial<Direction>) => Promise<Direction>;
  updateDirection: (direction: Direction) => Promise<void>;
  reviseDeadline: (directionId: string, newDeadline: string, reason: string) => Promise<void>;
  submitCompliance: (
    directionId: string, 
    submission: {
      progress_remarks: string;
      percentage_of_completion: number;
      remaining_action_required?: string;
      files: DocumentItem[];
    }
  ) => Promise<void>;
  reviewCompliance: (
    directionId: string,
    submissionId: string,
    action: 'Accepted' | 'Returned' | 'Under Review',
    remarks: string,
    markDirectionCompleted?: boolean
  ) => Promise<void>;
  logReminder: (directionId: string, recipient: string, notes: string) => Promise<void>;
  addDocumentToMeeting: (meetingId: string, doc: DocumentItem) => Promise<void>;
  addDocumentToDirection: (directionId: string, doc: DocumentItem) => Promise<void>;
  updateCloudSettings: (config: CloudConfig) => void;
  clearDatabase: () => void;
  exportDatabase: () => string;
  importDatabase: (json: string) => boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Theme state: dark / light
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('dgmm_theme') as 'dark' | 'light' | null;
    return saved || 'dark';
  });

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('dgmm_theme', nextTheme);
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Navigation
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedMeetingId, setSelectedMeetingId] = useState<string | null>(null);
  const [selectedDirectionId, setSelectedDirectionId] = useState<string | null>(null);
  const [selectedDivisionFilter, setSelectedDivisionFilter] = useState<string | null>(null);
  const [selectedFieldOfficeFilter, setSelectedFieldOfficeFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [currentUser, setCurrentUser] = useState<UserProfile>(SAMPLE_USERS[0]);
  const [cloudConfig, setCloudConfig] = useState<CloudConfig>(getStoredCloudConfig());

  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [directions, setDirections] = useState<Direction[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);

  // Initialize clean data on mount
  useEffect(() => {
    const initial = StorageService.init();
    setMeetings(initial.meetings);
    setDirections(initial.directions);
    setActivityLogs(initial.activityLogs);
    initSupabaseClient(cloudConfig);
  }, []);

  // Update cloud config handler
  const updateCloudSettings = (cfg: CloudConfig) => {
    saveStoredCloudConfig(cfg);
    setCloudConfig(cfg);
    initSupabaseClient(cfg);
  };

  // Log activity helper
  const addActivityLog = (
    entity_type: ActivityLog['entity_type'],
    entity_id: string,
    entity_title: string,
    action: ActivityLog['action'],
    remarks?: string,
    previous_value?: string,
    new_value?: string
  ) => {
    const newLog: ActivityLog = {
      id: `ACT-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 900 + 100)}`,
      entity_type,
      entity_id,
      entity_title,
      action,
      user_name: currentUser.name,
      user_role: currentUser.designation || currentUser.role,
      timestamp: new Date().toISOString(),
      previous_value,
      new_value,
      remarks
    };

    const updated = [newLog, ...activityLogs];
    setActivityLogs(updated);
    StorageService.saveActivityLogs(updated);
    StorageService.syncActivityLogToCloud(newLog);
  };

  // Dynamic KPI Metrics
  const kpis = useMemo(() => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const in48Hours = new Date(today.getTime() + 48 * 60 * 60 * 1000).toISOString().split('T')[0];
    const dayOfWeek = today.getDay();
    const daysUntilSunday = (7 - dayOfWeek) % 7;
    const endOfWeek = new Date(today.getTime() + daysUntilSunday * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const activeDirections = directions.filter(d => !d.is_archived);
    const totalMeetings = meetings.filter(m => !m.is_archived).length;
    const totalDirections = activeDirections.length;

    let pendingDirections = 0;
    let inProgressDirections = 0;
    let completedDirections = 0;
    let overdueDirections = 0;
    let dueThisWeekDirections = 0;
    let dueIn48HoursDirections = 0;
    let complianceAwaitedDirections = 0;
    let underReviewDirections = 0;
    let complianceSubmittedDirections = 0;

    activeDirections.forEach(d => {
      const isCompleted = d.status === 'Completed';
      const isOverdue = !isCompleted && d.deadline && d.deadline < todayStr;

      if (isCompleted) {
        completedDirections++;
      } else if (isOverdue) {
        overdueDirections++;
        complianceAwaitedDirections++;
      } else {
        if (d.status === 'Pending') pendingDirections++;
        if (d.status === 'In Progress') inProgressDirections++;
        if (d.status === 'Compliance Submitted') complianceSubmittedDirections++;
        if (d.status === 'Under Review') underReviewDirections++;
        if (d.status !== 'Completed' && d.status !== 'Compliance Submitted') {
          complianceAwaitedDirections++;
        }
      }

      if (!isCompleted && d.deadline) {
        if (d.deadline >= todayStr && d.deadline <= in48Hours) {
          dueIn48HoursDirections++;
        }
        if (d.deadline >= todayStr && d.deadline <= endOfWeek) {
          dueThisWeekDirections++;
        }
      }
    });

    const meetingsRequiringFollowUp = meetings.filter(m => 
      !m.is_archived && (m.status === 'Follow-up Required' || m.status === 'In Progress')
    ).length;

    return {
      totalMeetings,
      totalDirections,
      pendingDirections,
      inProgressDirections,
      completedDirections,
      overdueDirections,
      dueThisWeekDirections,
      dueIn48HoursDirections,
      complianceAwaitedDirections,
      underReviewDirections,
      complianceSubmittedDirections,
      meetingsRequiringFollowUp
    };
  }, [meetings, directions]);

  // Division performance
  const divisionPerformances = useMemo<DivisionPerformance[]>(() => {
    const todayStr = new Date().toISOString().split('T')[0];

    return DEPARTMENTAL_DIVISIONS.map(div => {
      const assigned = directions.filter(d => 
        !d.is_archived && d.responsible_divisions.includes(div)
      );

      const total = assigned.length;
      let pending = 0;
      let in_progress = 0;
      let completed = 0;
      let overdue = 0;
      let compliance_submitted = 0;
      let under_review = 0;

      assigned.forEach(d => {
        if (d.status === 'Completed') {
          completed++;
        } else if (d.deadline && d.deadline < todayStr) {
          overdue++;
        } else if (d.status === 'Pending') {
          pending++;
        } else if (d.status === 'In Progress') {
          in_progress++;
        } else if (d.status === 'Compliance Submitted') {
          compliance_submitted++;
        } else if (d.status === 'Under Review') {
          under_review++;
        }
      });

      const rate = total > 0 
        ? Math.round(((completed + compliance_submitted + under_review) / total) * 100) 
        : 100;

      return {
        division: div,
        total_directions: total,
        pending_directions: pending,
        in_progress_directions: in_progress,
        completed_directions: completed,
        overdue_directions: overdue,
        compliance_submitted_directions: compliance_submitted,
        under_review_directions: under_review,
        compliance_rate: rate
      };
    });
  }, [directions]);

  // Field Office performance
  const fieldOfficePerformances = useMemo<FieldOfficePerformance[]>(() => {
    const todayStr = new Date().toISOString().split('T')[0];

    return FIELD_OFFICES.map(office => {
      const assigned = directions.filter(d => 
        !d.is_archived && 
        d.responsible_divisions.includes('Field Offices') &&
        (d.responsible_field_offices?.includes(office) || !d.responsible_field_offices || d.responsible_field_offices.length === 0)
      );

      const total = assigned.length;
      let pending = 0;
      let completed = 0;
      let overdue = 0;

      assigned.forEach(d => {
        if (d.status === 'Completed') {
          completed++;
        } else if (d.deadline && d.deadline < todayStr) {
          overdue++;
        } else {
          pending++;
        }
      });

      const rate = total > 0 ? Math.round((completed / total) * 100) : 100;

      return {
        field_office: office,
        total_directions: total,
        pending_directions: pending,
        completed_directions: completed,
        overdue_directions: overdue,
        compliance_rate: rate
      };
    });
  }, [directions]);

  // Actions
  const createMeeting = async (data: Partial<Meeting>): Promise<Meeting> => {
    const currentYear = new Date().getFullYear();
    const nextSeq = meetings.length + 1;
    const formattedId = `MTG-${currentYear}-${String(nextSeq).padStart(3, '0')}`;

    const newMeeting: Meeting = {
      id: formattedId,
      title: data.title || 'Untitled Meeting',
      subject: data.subject || '',
      date: data.date || new Date().toISOString().split('T')[0],
      time: data.time || '11:00 AM',
      venue: data.venue || 'DG Secretariat, Poonch House, Multan Road, Lahore',
      chairperson: data.chairperson || 'Director General, Mines & Minerals, Punjab',
      participating_officers: data.participating_officers || '',
      category: data.category || 'Administrative',
      status: data.status || 'Scheduled',
      general_remarks: data.general_remarks || '',
      agenda_documents: data.agenda_documents || [],
      dg_brief_documents: data.dg_brief_documents || [],
      presentation_documents: data.presentation_documents || [],
      supporting_data_documents: data.supporting_data_documents || [],
      minutes_documents: data.minutes_documents || [],
      compliance_report_documents: data.compliance_report_documents || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const updatedMeetings = [newMeeting, ...meetings];
    setMeetings(updatedMeetings);
    StorageService.saveMeetings(updatedMeetings);
    await StorageService.syncMeetingToCloud(newMeeting);

    addActivityLog(
      'meeting',
      newMeeting.id,
      newMeeting.title,
      'Meeting Created',
      `Meeting scheduled on ${newMeeting.date} chaired by ${newMeeting.chairperson}`
    );

    return newMeeting;
  };

  const updateMeeting = async (meeting: Meeting): Promise<void> => {
    const updated = meetings.map(m => m.id === meeting.id ? { ...meeting, updated_at: new Date().toISOString() } : m);
    setMeetings(updated);
    StorageService.saveMeetings(updated);
    await StorageService.syncMeetingToCloud(meeting);

    addActivityLog('meeting', meeting.id, meeting.title, 'Meeting Updated', 'Meeting details updated');
  };

  const deleteMeeting = async (meetingId: string): Promise<void> => {
    const meetingToDelete = meetings.find(m => m.id === meetingId);
    const updatedMeetings = meetings.filter(m => m.id !== meetingId);
    setMeetings(updatedMeetings);
    StorageService.saveMeetings(updatedMeetings);
    await StorageService.deleteMeetingFromCloud(meetingId);

    if (selectedMeetingId === meetingId) {
      setSelectedMeetingId(null);
    }

    if (meetingToDelete) {
      addActivityLog(
        'meeting',
        meetingToDelete.id,
        meetingToDelete.title,
        'Meeting Deleted',
        `Meeting ${meetingToDelete.id} (${meetingToDelete.title}) deleted`
      );
    }
  };

  const rescheduleMeeting = async (
    meetingId: string, 
    newDate: string, 
    newTime: string, 
    reason: string, 
    newVenue?: string
  ): Promise<void> => {
    const target = meetings.find(m => m.id === meetingId);
    if (!target) return;

    const oldDate = target.date;
    const oldTime = target.time;

    const rescheduleRecord = {
      previous_date: oldDate,
      previous_time: oldTime,
      new_date: newDate,
      new_time: newTime,
      reason,
      rescheduled_at: new Date().toISOString()
    };

    const history = target.reschedule_history || [];

    const updatedMeeting: Meeting = {
      ...target,
      date: newDate,
      time: newTime,
      venue: newVenue || target.venue,
      status: 'Rescheduled',
      reschedule_history: [...history, rescheduleRecord],
      updated_at: new Date().toISOString()
    };

    const updatedMeetings = meetings.map(m => m.id === meetingId ? updatedMeeting : m);
    setMeetings(updatedMeetings);
    StorageService.saveMeetings(updatedMeetings);
    await StorageService.syncMeetingToCloud(updatedMeeting);

    addActivityLog(
      'meeting',
      target.id,
      target.title,
      'Meeting Rescheduled',
      `Meeting rescheduled from ${oldDate} (${oldTime}) to ${newDate} (${newTime}). Reason: ${reason}`
    );
  };

  const createDirection = async (data: Partial<Direction>): Promise<Direction> => {
    const currentYear = new Date().getFullYear();
    const nextSeq = directions.length + 1;
    const formattedId = `DIR-${currentYear}-${String(nextSeq).padStart(3, '0')}`;
    const relatedMeeting = meetings.find(m => m.id === data.meeting_id);

    const newDirection: Direction = {
      id: formattedId,
      title: data.title || 'Untitled Direction',
      description: data.description || '',
      meeting_id: data.meeting_id || '',
      meeting_title: relatedMeeting?.title || data.meeting_title || '',
      issuance_date: data.issuance_date || new Date().toISOString().split('T')[0],
      responsible_divisions: data.responsible_divisions || ['Administration'],
      responsible_field_offices: data.responsible_field_offices || [],
      responsible_officer: data.responsible_officer || 'Concerned Officer',
      priority: data.priority || 'Normal',
      deadline: data.deadline || new Date().toISOString().split('T')[0],
      expected_deliverable: data.expected_deliverable || '',
      status: 'Pending',
      remarks: data.remarks || '',
      attachments: data.attachments || [],
      compliance_submissions: [],
      deadline_history: [],
      reminders: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    newDirection.status = calculateDirectionStatus(newDirection);

    const updatedDirections = [newDirection, ...directions];
    setDirections(updatedDirections);
    StorageService.saveDirections(updatedDirections);
    await StorageService.syncDirectionToCloud(newDirection);

    addActivityLog(
      'direction',
      newDirection.id,
      newDirection.title,
      'Direction Issued',
      `Direction issued with deadline ${newDirection.deadline}`
    );

    return newDirection;
  };

  const updateDirection = async (direction: Direction): Promise<void> => {
    const recalculated: Direction = {
      ...direction,
      status: calculateDirectionStatus(direction),
      updated_at: new Date().toISOString()
    };
    const updated = directions.map(d => d.id === direction.id ? recalculated : d);
    setDirections(updated);
    StorageService.saveDirections(updated);
    await StorageService.syncDirectionToCloud(recalculated);

    addActivityLog('direction', direction.id, direction.title, 'Direction Updated', 'Direction record modified');
  };

  const reviseDeadline = async (directionId: string, newDeadline: string, reason: string): Promise<void> => {
    const target = directions.find(d => d.id === directionId);
    if (!target) return;

    const oldDeadline = target.deadline;
    const historyItem = {
      previous_deadline: oldDeadline,
      new_deadline: newDeadline,
      reason,
      changed_by: currentUser.name,
      changed_at: new Date().toISOString()
    };

    const updatedDirection: Direction = {
      ...target,
      deadline: newDeadline,
      deadline_history: [historyItem, ...(target.deadline_history || [])],
      updated_at: new Date().toISOString()
    };

    updatedDirection.status = calculateDirectionStatus(updatedDirection);

    const updated = directions.map(d => d.id === directionId ? updatedDirection : d);
    setDirections(updated);
    StorageService.saveDirections(updated);
    await StorageService.syncDirectionToCloud(updatedDirection);

    addActivityLog(
      'direction',
      directionId,
      target.title,
      'Deadline Revised',
      `Reason: ${reason}`,
      oldDeadline,
      newDeadline
    );
  };

  const submitCompliance = async (
    directionId: string,
    submission: {
      progress_remarks: string;
      percentage_of_completion: number;
      remaining_action_required?: string;
      files: DocumentItem[];
    }
  ): Promise<void> => {
    const target = directions.find(d => d.id === directionId);
    if (!target) return;

    const newSubmission: ComplianceSubmission = {
      id: `SUB-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 900 + 100)}`,
      direction_id: directionId,
      submission_date: new Date().toISOString().split('T')[0],
      submitted_by: currentUser.name,
      submitter_designation: currentUser.designation,
      submitter_division: currentUser.division,
      progress_remarks: submission.progress_remarks,
      percentage_of_completion: submission.percentage_of_completion,
      supporting_files: submission.files,
      remaining_action_required: submission.remaining_action_required,
      review_status: 'Awaiting Review',
      created_at: new Date().toISOString()
    };

    const updatedDirection: Direction = {
      ...target,
      status: 'Compliance Submitted',
      compliance_submissions: [newSubmission, ...(target.compliance_submissions || [])],
      updated_at: new Date().toISOString()
    };

    const updated = directions.map(d => d.id === directionId ? updatedDirection : d);
    setDirections(updated);
    StorageService.saveDirections(updated);
    await StorageService.syncDirectionToCloud(updatedDirection);

    if (target.meeting_id && submission.files.length > 0) {
      const meeting = meetings.find(m => m.id === target.meeting_id);
      if (meeting) {
        const updatedMtg = {
          ...meeting,
          compliance_report_documents: [...(meeting.compliance_report_documents || []), ...submission.files]
        };
        const updatedMeetings = meetings.map(m => m.id === meeting.id ? updatedMtg : m);
        setMeetings(updatedMeetings);
        StorageService.saveMeetings(updatedMeetings);
      }
    }

    addActivityLog(
      'compliance',
      newSubmission.id,
      `Compliance for ${target.id}`,
      'Compliance Submitted',
      `Submitted by ${currentUser.name} (${submission.percentage_of_completion}% progress reported)`
    );
  };

  const reviewCompliance = async (
    directionId: string,
    submissionId: string,
    action: 'Accepted' | 'Returned' | 'Under Review',
    remarks: string,
    markDirectionCompleted?: boolean
  ): Promise<void> => {
    const target = directions.find(d => d.id === directionId);
    if (!target) return;

    const updatedSubmissions = target.compliance_submissions.map(sub => {
      if (sub.id === submissionId) {
        return {
          ...sub,
          review_status: action,
          reviewed_by: currentUser.name,
          review_date: new Date().toISOString().split('T')[0],
          review_remarks: remarks
        };
      }
      return sub;
    });

    let newStatus: Direction['status'] = target.status;
    let logAction: ActivityLog['action'] = 'Compliance Under Review';

    if (action === 'Accepted') {
      logAction = 'Compliance Accepted';
      if (markDirectionCompleted) {
        newStatus = 'Completed';
      }
    } else if (action === 'Returned') {
      logAction = 'Compliance Returned';
      newStatus = 'In Progress';
    } else if (action === 'Under Review') {
      logAction = 'Compliance Under Review';
      newStatus = 'Under Review';
    }

    const updatedDirection: Direction = {
      ...target,
      status: newStatus,
      compliance_submissions: updatedSubmissions,
      updated_at: new Date().toISOString()
    };

    const updated = directions.map(d => d.id === directionId ? updatedDirection : d);
    setDirections(updated);
    StorageService.saveDirections(updated);
    await StorageService.syncDirectionToCloud(updatedDirection);

    addActivityLog('compliance', submissionId, `Review of ${target.id}`, logAction, `Reviewed by ${currentUser.name}: ${remarks}`);

    if (newStatus === 'Completed') {
      addActivityLog('direction', directionId, target.title, 'Direction Marked Completed', `Formally accepted and closed by ${currentUser.name}`);
    }
  };

  const logReminder = async (directionId: string, recipient: string, notes: string): Promise<void> => {
    const target = directions.find(d => d.id === directionId);
    if (!target) return;

    const newReminder = {
      date: new Date().toISOString().split('T')[0],
      sent_by: currentUser.name,
      recipient,
      notes
    };

    const updatedDirection: Direction = {
      ...target,
      reminders: [newReminder, ...(target.reminders || [])],
      updated_at: new Date().toISOString()
    };

    const updated = directions.map(d => d.id === directionId ? updatedDirection : d);
    setDirections(updated);
    StorageService.saveDirections(updated);
    await StorageService.syncDirectionToCloud(updatedDirection);

    addActivityLog('direction', directionId, target.title, 'Reminder Logged', `Reminder to ${recipient}: ${notes}`);
  };

  const addDocumentToMeeting = async (meetingId: string, doc: DocumentItem): Promise<void> => {
    const target = meetings.find(m => m.id === meetingId);
    if (!target) return;

    const copy = { ...target };
    if (doc.file_type === 'Agenda') copy.agenda_documents = [...(copy.agenda_documents || []), doc];
    else if (doc.file_type === 'DG Brief') copy.dg_brief_documents = [...(copy.dg_brief_documents || []), doc];
    else if (doc.file_type === 'Presentation') copy.presentation_documents = [...(copy.presentation_documents || []), doc];
    else if (doc.file_type === 'Supporting Data') copy.supporting_data_documents = [...(copy.supporting_data_documents || []), doc];
    else if (doc.file_type === 'Minutes of Meeting') copy.minutes_documents = [...(copy.minutes_documents || []), doc];
    else if (doc.file_type === 'Compliance Report') copy.compliance_report_documents = [...(copy.compliance_report_documents || []), doc];
    else copy.supporting_data_documents = [...(copy.supporting_data_documents || []), doc];

    copy.updated_at = new Date().toISOString();

    const updated = meetings.map(m => m.id === meetingId ? copy : m);
    setMeetings(updated);
    StorageService.saveMeetings(updated);
    await StorageService.syncMeetingToCloud(copy);

    addActivityLog('document', doc.id, doc.name, 'Document Uploaded', `Uploaded to Meeting ${meetingId} (${doc.file_type})`);
  };

  const addDocumentToDirection = async (directionId: string, doc: DocumentItem): Promise<void> => {
    const target = directions.find(d => d.id === directionId);
    if (!target) return;

    const updatedDirection: Direction = {
      ...target,
      attachments: [...(target.attachments || []), doc],
      updated_at: new Date().toISOString()
    };

    const updated = directions.map(d => d.id === directionId ? updatedDirection : d);
    setDirections(updated);
    StorageService.saveDirections(updated);
    await StorageService.syncDirectionToCloud(updatedDirection);

    addActivityLog('document', doc.id, doc.name, 'Document Uploaded', `Attachment added to Direction ${directionId}`);
  };

  const clearDatabase = () => {
    StorageService.clearAllData();
    setMeetings([]);
    setDirections([]);
    setActivityLogs([]);
  };

  const exportDatabase = (): string => {
    return StorageService.exportDatabaseToJson();
  };

  const importDatabase = (json: string): boolean => {
    const success = StorageService.importDatabaseFromJson(json);
    if (success) {
      setMeetings(StorageService.getMeetings());
      setDirections(StorageService.getDirections());
      setActivityLogs(StorageService.getActivityLogs());
    }
    return success;
  };

  return (
    <AppContext.Provider
      value={{
        theme,
        toggleTheme,
        activeTab,
        setActiveTab,
        selectedMeetingId,
        setSelectedMeetingId,
        selectedDirectionId,
        setSelectedDirectionId,
        selectedDivisionFilter,
        setSelectedDivisionFilter,
        selectedFieldOfficeFilter,
        setSelectedFieldOfficeFilter,
        searchQuery,
        setSearchQuery,
        meetings,
        directions,
        activityLogs,
        currentUser,
        setCurrentUser,
        cloudConfig,
        kpis,
        divisionPerformances,
        fieldOfficePerformances,
        createMeeting,
        updateMeeting,
        deleteMeeting,
        rescheduleMeeting,
        createDirection,
        updateDirection,
        reviseDeadline,
        submitCompliance,
        reviewCompliance,
        logReminder,
        addDocumentToMeeting,
        addDocumentToDirection,
        updateCloudSettings,
        clearDatabase,
        exportDatabase,
        importDatabase
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
