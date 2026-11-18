export type PriorityLevel = 'High' | 'Medium' | 'Normal';

export type DirectionStatus = 
  | 'Pending' 
  | 'In Progress' 
  | 'Compliance Submitted' 
  | 'Under Review' 
  | 'Completed' 
  | 'Overdue';

export type MeetingCategory = 
  | 'Administrative'
  | 'Technical'
  | 'Revenue'
  | 'Mining Operations'
  | 'Enforcement'
  | 'Policy'
  | 'Investment'
  | 'Interdepartmental'
  | 'Other';

export type MeetingStatus = 
  | 'Scheduled' 
  | 'In Progress' 
  | 'Concluded' 
  | 'Adjourned' 
  | 'Follow-up Required';

export type DocumentType = 
  | 'Agenda'
  | 'DG Brief'
  | 'Presentation'
  | 'Supporting Data'
  | 'Minutes of Meeting'
  | 'Compliance Report'
  | 'Official Notification'
  | 'Other';

export type UserRole = 'Administrator' | 'Monitoring / DG Office' | 'Division / Field Office User';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  division?: string;
  field_office?: string;
  designation: string;
}

export interface DocumentItem {
  id: string;
  name: string;
  file_type: DocumentType;
  file_format: string; // 'pdf' | 'docx' | 'xlsx' | 'pptx' | 'csv' | 'jpg' | 'png' | etc.
  file_size?: string;
  url?: string;
  content_base64?: string; // For client-side mock/storage if cloud not connected
  meeting_id?: string;
  direction_id?: string;
  division?: string;
  uploaded_by: string;
  uploaded_at: string;
  description?: string;
}

export interface ComplianceSubmission {
  id: string;
  direction_id: string;
  submission_date: string;
  submitted_by: string;
  submitter_designation?: string;
  submitter_division?: string;
  progress_remarks: string;
  percentage_of_completion: number; // 0 to 100
  supporting_files: DocumentItem[];
  remaining_action_required?: string;
  review_status: 'Awaiting Review' | 'Accepted' | 'Returned' | 'Under Review';
  reviewed_by?: string;
  review_date?: string;
  review_remarks?: string;
  created_at: string;
}

export interface Direction {
  id: string; // e.g., "DIR-2026-001"
  title: string;
  description: string;
  meeting_id: string;
  meeting_title?: string;
  issuance_date: string;
  responsible_divisions: string[]; // Supports multiple divisions
  responsible_field_offices?: string[]; // Supports multiple field offices if Field Offices division
  responsible_officer: string;
  priority: PriorityLevel;
  deadline: string;
  expected_deliverable: string;
  status: DirectionStatus;
  remarks?: string;
  attachments?: DocumentItem[];
  compliance_submissions: ComplianceSubmission[];
  deadline_history: {
    previous_deadline: string;
    new_deadline: string;
    reason: string;
    changed_by: string;
    changed_at: string;
  }[];
  reminders: {
    date: string;
    sent_by: string;
    recipient: string;
    notes: string;
  }[];
  is_archived?: boolean;
  created_at: string;
  updated_at: string;
}

export interface Meeting {
  id: string; // e.g., "MTG-2026-012"
  title: string;
  subject: string;
  date: string;
  time: string;
  venue: string;
  chairperson: string;
  participating_officers: string;
  category: MeetingCategory;
  status: MeetingStatus;
  general_remarks?: string;
  agenda_documents: DocumentItem[];
  dg_brief_documents: DocumentItem[];
  presentation_documents: DocumentItem[];
  supporting_data_documents: DocumentItem[];
  minutes_documents: DocumentItem[];
  compliance_report_documents: DocumentItem[];
  directions_count?: number;
  completed_directions_count?: number;
  pending_directions_count?: number;
  is_archived?: boolean;
  created_at: string;
  updated_at: string;
}

export interface ActivityLog {
  id: string;
  entity_type: 'meeting' | 'direction' | 'compliance' | 'document' | 'system';
  entity_id: string;
  entity_title: string;
  action: 
    | 'Meeting Created'
    | 'Meeting Updated'
    | 'Brief Uploaded'
    | 'Agenda Uploaded'
    | 'Minutes Uploaded'
    | 'Direction Issued'
    | 'Direction Updated'
    | 'Direction Assigned'
    | 'Deadline Revised'
    | 'Compliance Submitted'
    | 'Compliance Under Review'
    | 'Compliance Returned'
    | 'Compliance Accepted'
    | 'Direction Marked Completed'
    | 'Document Uploaded'
    | 'Reminder Logged';
  user_name: string;
  user_role: string;
  timestamp: string;
  previous_value?: string;
  new_value?: string;
  remarks?: string;
}

export interface DivisionPerformance {
  division: string;
  total_directions: number;
  pending_directions: number;
  in_progress_directions: number;
  completed_directions: number;
  overdue_directions: number;
  compliance_submitted_directions: number;
  under_review_directions: number;
  compliance_rate: number; // Percentage
}

export interface FieldOfficePerformance {
  field_office: string;
  total_directions: number;
  pending_directions: number;
  completed_directions: number;
  overdue_directions: number;
  compliance_rate: number;
}

export interface CloudConfig {
  provider: 'supabase';
  supabaseUrl: string;
  supabaseAnonKey: string;
  storageBucket: string;
  autoSync: boolean;
  lastSyncTime?: string;
}
