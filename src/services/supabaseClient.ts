import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { CloudConfig } from '../types';

const CLOUD_CONFIG_STORAGE_KEY = 'dgmm_compliance_cloud_config_v1';

export const DEFAULT_CLOUD_CONFIG: CloudConfig = {
  provider: 'supabase',
  supabaseUrl: (import.meta as any).env?.VITE_SUPABASE_URL || '',
  supabaseAnonKey: (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '',
  storageBucket: (import.meta as any).env?.VITE_SUPABASE_BUCKET || 'dgmm-compliance-docs',
  autoSync: true,
  lastSyncTime: undefined
};

let clientInstance: SupabaseClient | null = null;
let activeConfig: CloudConfig = DEFAULT_CLOUD_CONFIG;

export const getStoredCloudConfig = (): CloudConfig => {
  try {
    const raw = localStorage.getItem(CLOUD_CONFIG_STORAGE_KEY);
    if (raw) {
      return { ...DEFAULT_CLOUD_CONFIG, ...JSON.parse(raw) };
    }
  } catch (err) {
    console.error('Failed to parse stored cloud config', err);
  }
  return DEFAULT_CLOUD_CONFIG;
};

export const saveStoredCloudConfig = (config: CloudConfig): void => {
  try {
    localStorage.setItem(CLOUD_CONFIG_STORAGE_KEY, JSON.stringify(config));
    activeConfig = config;
    initSupabaseClient(config);
  } catch (err) {
    console.error('Failed to save cloud config', err);
  }
};

export const initSupabaseClient = (config?: CloudConfig): SupabaseClient | null => {
  const cfg = config || getStoredCloudConfig();
  activeConfig = cfg;
  if (cfg.supabaseUrl && cfg.supabaseAnonKey && cfg.supabaseUrl.startsWith('http')) {
    try {
      clientInstance = createClient(cfg.supabaseUrl, cfg.supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true
        }
      });
      return clientInstance;
    } catch (err) {
      console.warn('Failed to initialize Supabase client:', err);
      clientInstance = null;
    }
  } else {
    clientInstance = null;
  }
  return null;
};

export const getSupabaseClient = (): SupabaseClient | null => {
  if (!clientInstance) {
    return initSupabaseClient();
  }
  return clientInstance;
};

export const testCloudConnection = async (config: CloudConfig): Promise<{ success: boolean; message: string }> => {
  if (!config.supabaseUrl || !config.supabaseAnonKey) {
    return { 
      success: false, 
      message: 'Supabase Project URL and Anon API Key are required to connect to the cloud database.' 
    };
  }

  try {
    const client = createClient(config.supabaseUrl, config.supabaseAnonKey, {
      auth: { persistSession: false }
    });

    const { data, error } = await client.from('meetings').select('id').limit(1);

    if (error) {
      if (error.code === '42P01' || error.message.includes('does not exist') || error.message.includes('relation')) {
        return {
          success: false,
          message: "Connected to Supabase, but the 'meetings' table was not found. Please run the SQL schema script provided below in your Supabase SQL Editor."
        };
      }
      return { success: false, message: `Supabase Cloud Error: ${error.message}` };
    }

    return { 
      success: true, 
      message: 'Connected to Supabase PostgreSQL Database successfully! All queries and documents will sync to the cloud.' 
    };
  } catch (err: any) {
    return { success: false, message: `Network/Connection error: ${err?.message || err}` };
  }
};

/**
 * Complete Relational PostgreSQL Schema for Supabase
 * Matching Section 12 of specifications:
 * 1. meetings
 * 2. meeting_participants
 * 3. divisions
 * 4. field_offices
 * 5. directions
 * 6. direction_assignments
 * 7. compliance_submissions
 * 8. documents
 * 9. direction_activity_logs
 * 10. meeting_activity_logs
 * 11. users
 * 12. user_roles
 */
export const SUPABASE_SQL_SCHEMA = `-- ====================================================================
-- DIRECTORATE GENERAL OF MINES & MINERALS, GOVERNMENT OF THE PUNJAB
-- DIRECTIONS, MEETINGS & COMPLIANCE MANAGEMENT SYSTEM - DATABASE SCHEMA
-- PostgreSQL / Supabase Schema Definition
-- ====================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. DIVISIONS (Master Category Table)
CREATE TABLE IF NOT EXISTS divisions (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. FIELD OFFICES (15 Field Formations)
CREATE TABLE IF NOT EXISTS field_offices (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  region TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. USER ROLES MASTER
CREATE TABLE IF NOT EXISTS user_roles (
  id TEXT PRIMARY KEY,
  role_name TEXT NOT NULL UNIQUE,
  permissions JSONB DEFAULT '[]'::jsonb
);

-- 4. USERS
CREATE TABLE IF NOT EXISTS portal_users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL,
  division TEXT,
  field_office TEXT,
  designation TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. MEETINGS TABLE
CREATE TABLE IF NOT EXISTS meetings (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  date DATE NOT NULL,
  time TEXT NOT NULL,
  venue TEXT NOT NULL,
  chairperson TEXT NOT NULL,
  participating_officers TEXT,
  category TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Scheduled',
  general_remarks TEXT,
  is_archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. MEETING PARTICIPANTS (Relational Bridge)
CREATE TABLE IF NOT EXISTS meeting_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  meeting_id TEXT NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  user_id TEXT,
  officer_name TEXT NOT NULL,
  designation TEXT,
  department TEXT,
  attendance_status TEXT DEFAULT 'Attended'
);

-- 7. DIRECTIONS TABLE
CREATE TABLE IF NOT EXISTS directions (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  meeting_id TEXT NOT NULL REFERENCES meetings(id) ON DELETE RESTRICT,
  meeting_title TEXT,
  issuance_date DATE NOT NULL,
  responsible_officer TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'Normal',
  deadline DATE NOT NULL,
  expected_deliverable TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Pending',
  remarks TEXT,
  deadline_history JSONB DEFAULT '[]'::jsonb,
  reminders JSONB DEFAULT '[]'::jsonb,
  is_archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. DIRECTION ASSIGNMENTS (Many-to-Many Bridge for Divisions & Field Offices)
CREATE TABLE IF NOT EXISTS direction_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  direction_id TEXT NOT NULL REFERENCES directions(id) ON DELETE CASCADE,
  division_name TEXT NOT NULL,
  field_office_name TEXT,
  is_lead_division BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. COMPLIANCE SUBMISSIONS
CREATE TABLE IF NOT EXISTS compliance_submissions (
  id TEXT PRIMARY KEY,
  direction_id TEXT NOT NULL REFERENCES directions(id) ON DELETE CASCADE,
  submission_date DATE NOT NULL,
  submitted_by TEXT NOT NULL,
  submitter_designation TEXT,
  submitter_division TEXT,
  progress_remarks TEXT NOT NULL,
  percentage_of_completion INTEGER DEFAULT 0 CHECK (percentage_of_completion BETWEEN 0 AND 100),
  remaining_action_required TEXT,
  review_status TEXT NOT NULL DEFAULT 'Awaiting Review',
  reviewed_by TEXT,
  review_date DATE,
  review_remarks TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. DOCUMENTS REPOSITORY TABLE
CREATE TABLE IF NOT EXISTS documents (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_format TEXT NOT NULL,
  file_size TEXT,
  url TEXT,
  meeting_id TEXT REFERENCES meetings(id) ON DELETE CASCADE,
  direction_id TEXT REFERENCES directions(id) ON DELETE CASCADE,
  compliance_id TEXT REFERENCES compliance_submissions(id) ON DELETE CASCADE,
  division TEXT,
  uploaded_by TEXT NOT NULL,
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  description TEXT
);

-- 11. DIRECTION ACTIVITY LOGS (Mandatory Audit Trail)
CREATE TABLE IF NOT EXISTS direction_activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  direction_id TEXT NOT NULL REFERENCES directions(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  user_name TEXT NOT NULL,
  user_role TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  previous_value TEXT,
  new_value TEXT,
  remarks TEXT
);

-- 12. MEETING ACTIVITY LOGS
CREATE TABLE IF NOT EXISTS meeting_activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  meeting_id TEXT NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  user_name TEXT NOT NULL,
  user_role TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  remarks TEXT
);

-- 13. INDEXES FOR HIGH-PERFORMANCE SEARCH & FILTERING
CREATE INDEX IF NOT EXISTS idx_directions_meeting ON directions(meeting_id);
CREATE INDEX IF NOT EXISTS idx_directions_deadline ON directions(deadline);
CREATE INDEX IF NOT EXISTS idx_directions_status ON directions(status);
CREATE INDEX IF NOT EXISTS idx_directions_priority ON directions(priority);
CREATE INDEX IF NOT EXISTS idx_documents_meeting ON documents(meeting_id);
CREATE INDEX IF NOT EXISTS idx_documents_direction ON documents(direction_id);
CREATE INDEX IF NOT EXISTS idx_compliance_direction ON compliance_submissions(direction_id);

-- 14. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE directions ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE portal_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE direction_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_activity_logs ENABLE ROW LEVEL SECURITY;

-- Allow authenticated and anon portal reads/writes with application-level security
CREATE POLICY "Allow read on meetings" ON meetings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow insert/update on meetings" ON meetings FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow read on directions" ON directions FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow insert/update on directions" ON directions FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow read on compliance" ON compliance_submissions FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow insert/update on compliance" ON compliance_submissions FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow read on documents" ON documents FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow insert/update on documents" ON documents FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow read on activity logs" ON direction_activity_logs FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow insert on activity logs" ON direction_activity_logs FOR INSERT TO anon, authenticated WITH CHECK (true);

-- 15. SEED MASTER DIVISIONS & FIELD FORMATIONS
INSERT INTO divisions (id, name, description) VALUES
  ('DIV-ADM', 'Administration', 'HR, General Administration, Protocol and Budgeting'),
  ('DIV-LSM', 'Large Scale Mining', 'Concessions for major cement, coal, rock salt, and industrial leases'),
  ('DIV-SSM', 'Small Scale Mining', 'Small mines assistance, lease agreements, licensing & titles (SMA/T)'),
  ('DIV-MM', 'Minor Minerals', 'Ordinary sand, bajri, gravel and minor mineral e-auctions'),
  ('DIV-RM', 'Resource Mapping', 'Geological surveys, reserve estimation, and core sampling'),
  ('DIV-GIS', 'GIS', 'Satellite remote sensing, drone surveys, and cadastral demarcation'),
  ('DIV-IT', 'IT', 'E-Governance, digital registers, portal security and infrastructure'),
  ('DIV-EF', 'Environmental Facilitation', 'Liaison with EPA, DAEC environmental approvals and NOCs'),
  ('DIV-FO', 'Field Offices', '15 regional field offices and mining inspectorates')
ON CONFLICT (name) DO NOTHING;

INSERT INTO field_offices (id, name, region) VALUES
  ('FO-ATK', 'Attock', 'North Region'),
  ('FO-BWP', 'Bahawalpur', 'South Region'),
  ('FO-CKW', 'Chakwal', 'Salt Range Region'),
  ('FO-CHN', 'Chiniot', 'Central Region'),
  ('FO-DGK', 'D.G. Khan', 'South-West Region'),
  ('FO-GUJ', 'Gujranwala', 'Central Region'),
  ('FO-JLM', 'Jhelum', 'Salt Range Region'),
  ('FO-KSB', 'Khushab', 'Salt Range Region'),
  ('FO-LHR', 'Lahore Region', 'Central Region'),
  ('FO-MWL', 'Mianwali', 'North-West Region'),
  ('FO-MUL', 'Multan', 'South Region'),
  ('FO-RWP', 'Rawalpindi', 'North Region'),
  ('FO-SWL', 'Sahiwal', 'Central Region'),
  ('FO-SGD', 'Sargodha', 'Central Region'),
  ('FO-SKT', 'Sialkot', 'Central Region')
ON CONFLICT (name) DO NOTHING;
`;
