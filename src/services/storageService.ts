import { Meeting, Direction, ActivityLog, DocumentItem, ComplianceSubmission } from '../types';
import { INITIAL_DEMO_MEETINGS, INITIAL_DEMO_DIRECTIONS, INITIAL_DEMO_ACTIVITY_LOGS } from '../data/demoData';
import { getSupabaseClient, getStoredCloudConfig } from './supabaseClient';

const STORAGE_KEYS = {
  MEETINGS: 'dgmm_compliance_meetings_v3',
  DIRECTIONS: 'dgmm_compliance_directions_v3',
  ACTIVITY_LOGS: 'dgmm_compliance_activities_v3',
  DOCUMENTS: 'dgmm_compliance_documents_v3',
  HAS_INITIALIZED: 'dgmm_compliance_initialized_v3',
};

/**
 * Helper to check if a direction is overdue dynamically
 * An overdue direction is identified using its deadline and completion status,
 * not merely a manually assigned label.
 */
export const calculateDirectionStatus = (direction: Direction): Direction['status'] => {
  if (direction.status === 'Completed') {
    return 'Completed';
  }
  
  const today = new Date().toISOString().split('T')[0];
  if (direction.deadline && direction.deadline < today) {
    return 'Overdue';
  }
  
  return direction.status;
};

/**
 * Storage & Cloud Synchronizer Service
 */
export class StorageService {
  /**
   * Initialize local store (empty by default)
   */
  static init(): { meetings: Meeting[]; directions: Direction[]; activityLogs: ActivityLog[] } {
    // Purge any legacy demo caches from previous sessions
    try {
      [
        'dgmm_compliance_meetings_v2', 
        'dgmm_compliance_directions_v2', 
        'dgmm_compliance_activities_v2', 
        'dgmm_compliance_initialized_v2',
        'dgmm_compliance_meetings', 
        'dgmm_compliance_directions', 
        'dgmm_compliance_activities', 
        'dgmm_compliance_initialized'
      ].forEach(k => {
        localStorage.removeItem(k);
      });
    } catch {
      // ignore
    }

    const initialized = localStorage.getItem(STORAGE_KEYS.HAS_INITIALIZED);
    
    if (!initialized) {
      this.saveMeetings([]);
      this.saveDirections([]);
      this.saveActivityLogs([]);
      localStorage.setItem(STORAGE_KEYS.HAS_INITIALIZED, 'true');
      return {
        meetings: [],
        directions: [],
        activityLogs: []
      };
    }

    let meetings = this.getMeetings();
    let directions = this.getDirections();
    let activityLogs = this.getActivityLogs();

    // Cleanse any legacy demo entries or names
    meetings = meetings.filter(m => !m.chairperson?.includes('Babar') && !m.title?.toLowerCase().includes('salt range'));
    directions = directions.filter(d => !d.responsible_officer?.includes('Babar') && !d.title?.toLowerCase().includes('salt range'));
    activityLogs = activityLogs.filter(a => !a.user_name?.includes('Babar'));

    this.saveMeetings(meetings);
    this.saveDirections(directions);
    this.saveActivityLogs(activityLogs);

    return { meetings, directions, activityLogs };
  }

  // --- MEETINGS ---

  static getMeetings(): Meeting[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MEETINGS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Error reading meetings', e);
      return [];
    }
  }

  static saveMeetings(meetings: Meeting[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.MEETINGS, JSON.stringify(meetings));
    } catch (e) {
      console.error('Error saving meetings', e);
    }
  }

  static async syncMeetingToCloud(meeting: Meeting): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;
    try {
      const { error } = await client.from('meetings').upsert({
        id: meeting.id,
        title: meeting.title,
        subject: meeting.subject,
        date: meeting.date,
        time: meeting.time,
        venue: meeting.venue,
        chairperson: meeting.chairperson,
        participating_officers: meeting.participating_officers,
        category: meeting.category,
        status: meeting.status,
        general_remarks: meeting.general_remarks,
        is_archived: meeting.is_archived || false,
        created_at: meeting.created_at,
        updated_at: new Date().toISOString()
      });
      return !error;
    } catch (err) {
      console.warn('Could not sync meeting to Supabase cloud:', err);
      return false;
    }
  }

  static async deleteMeetingFromCloud(meetingId: string): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;
    try {
      const { error } = await client.from('meetings').delete().eq('id', meetingId);
      return !error;
    } catch (err) {
      console.warn('Could not delete meeting from Supabase cloud:', err);
      return false;
    }
  }

  // --- DIRECTIONS ---

  static getDirections(): Direction[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DIRECTIONS);
      if (!data) return [];
      const directions: Direction[] = JSON.parse(data);
      // Recalculate dynamic status on load
      return directions.map(dir => ({
        ...dir,
        status: calculateDirectionStatus(dir)
      }));
    } catch (e) {
      console.error('Error reading directions', e);
      return [];
    }
  }

  static saveDirections(directions: Direction[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.DIRECTIONS, JSON.stringify(directions));
    } catch (e) {
      console.error('Error saving directions', e);
    }
  }

  static async syncDirectionToCloud(direction: Direction): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;
    try {
      const { error } = await client.from('directions').upsert({
        id: direction.id,
        title: direction.title,
        description: direction.description,
        meeting_id: direction.meeting_id,
        meeting_title: direction.meeting_title,
        issuance_date: direction.issuance_date,
        responsible_officer: direction.responsible_officer,
        priority: direction.priority,
        deadline: direction.deadline,
        expected_deliverable: direction.expected_deliverable,
        status: calculateDirectionStatus(direction),
        remarks: direction.remarks,
        deadline_history: direction.deadline_history,
        reminders: direction.reminders,
        is_archived: direction.is_archived || false,
        created_at: direction.created_at,
        updated_at: new Date().toISOString()
      });
      return !error;
    } catch (err) {
      console.warn('Could not sync direction to Supabase cloud:', err);
      return false;
    }
  }

  // --- ACTIVITY LOGS ---

  static getActivityLogs(): ActivityLog[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ACTIVITY_LOGS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Error reading activity logs', e);
      return [];
    }
  }

  static saveActivityLogs(logs: ActivityLog[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.ACTIVITY_LOGS, JSON.stringify(logs));
    } catch (e) {
      console.error('Error saving activity logs', e);
    }
  }

  static async syncActivityLogToCloud(log: ActivityLog): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;
    try {
      if (log.entity_type === 'direction') {
        await client.from('direction_activity_logs').insert({
          direction_id: log.entity_id,
          action: log.action,
          user_name: log.user_name,
          user_role: log.user_role,
          previous_value: log.previous_value,
          new_value: log.new_value,
          remarks: log.remarks,
          timestamp: log.timestamp
        });
      } else if (log.entity_type === 'meeting') {
        await client.from('meeting_activity_logs').insert({
          meeting_id: log.entity_id,
          action: log.action,
          user_name: log.user_name,
          user_role: log.user_role,
          remarks: log.remarks,
          timestamp: log.timestamp
        });
      }
      return true;
    } catch (err) {
      console.warn('Could not sync activity log to Supabase cloud:', err);
      return false;
    }
  }

  // --- FILE UPLOADS ---

  static async uploadDocument(
    file: File,
    metadata: {
      meeting_id?: string;
      direction_id?: string;
      file_type: DocumentItem['file_type'];
      uploaded_by: string;
      description?: string;
      division?: string;
    }
  ): Promise<DocumentItem> {
    const docId = `DOC-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 900 + 100)}`;
    const extension = file.name.split('.').pop()?.toLowerCase() || 'bin';
    const fileSizeFormatted = file.size > 1024 * 1024 
      ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` 
      : `${Math.round(file.size / 1024)} KB`;

    let cloudUrl: string | undefined = undefined;
    let base64Content: string | undefined = undefined;

    const client = getSupabaseClient();
    const config = getStoredCloudConfig();

    if (client && config.supabaseUrl) {
      try {
        const filePath = `${metadata.meeting_id || metadata.direction_id || 'general'}/${docId}_${file.name}`;
        const { data, error } = await client.storage
          .from(config.storageBucket || 'dgmm-compliance-docs')
          .upload(filePath, file, { upsert: true });

        if (!error && data) {
          const { data: urlData } = client.storage
            .from(config.storageBucket || 'dgmm-compliance-docs')
            .getPublicUrl(filePath);
          cloudUrl = urlData.publicUrl;
        }
      } catch (uploadErr) {
        console.warn('Could not upload file to Supabase storage, using fallback:', uploadErr);
      }
    }

    if (!cloudUrl && file.size < 5 * 1024 * 1024) {
      base64Content = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = () => resolve(undefined);
        reader.readAsDataURL(file);
      });
    }

    const documentItem: DocumentItem = {
      id: docId,
      name: file.name,
      file_type: metadata.file_type,
      file_format: extension,
      file_size: fileSizeFormatted,
      url: cloudUrl,
      content_base64: base64Content,
      meeting_id: metadata.meeting_id,
      direction_id: metadata.direction_id,
      division: metadata.division,
      uploaded_by: metadata.uploaded_by,
      uploaded_at: new Date().toISOString(),
      description: metadata.description
    };

    return documentItem;
  }

  // --- BACKUP & RESTORATION ---

  static exportDatabaseToJson(): string {
    const bundle = {
      version: '2.0.0',
      export_date: new Date().toISOString(),
      portal: 'Directorate General of Mines & Minerals, Government of the Punjab',
      system: 'Directions, Meetings & Compliance Management Portal',
      meetings: this.getMeetings(),
      directions: this.getDirections(),
      activity_logs: this.getActivityLogs()
    };
    return JSON.stringify(bundle, null, 2);
  }

  static importDatabaseFromJson(jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString);
      if (Array.isArray(parsed.meetings) && Array.isArray(parsed.directions)) {
        this.saveMeetings(parsed.meetings);
        this.saveDirections(parsed.directions);
        if (Array.isArray(parsed.activity_logs)) {
          this.saveActivityLogs(parsed.activity_logs);
        }
        return true;
      }
      return false;
    } catch (e) {
      console.error('Import error:', e);
      return false;
    }
  }

  static clearAllData(): void {
    this.saveMeetings([]);
    this.saveDirections([]);
    this.saveActivityLogs([]);
  }
}
