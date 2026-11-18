export const DEPARTMENTAL_DIVISIONS = [
  'Administration',
  'Large Scale Mining',
  'Small Scale Mining',
  'Minor Minerals',
  'Resource Mapping',
  'GIS',
  'IT',
  'Environmental Facilitation',
  'Field Offices'
] as const;

export const FIELD_OFFICES = [
  'Attock',
  'Bahawalpur',
  'Chakwal',
  'Chiniot',
  'D.G. Khan',
  'Gujranwala',
  'Jhelum',
  'Khushab',
  'Lahore Region',
  'Mianwali',
  'Multan',
  'Rawalpindi',
  'Sahiwal',
  'Sargodha',
  'Sialkot'
] as const;

export const MEETING_CATEGORIES = [
  'Administrative',
  'Technical',
  'Revenue',
  'Mining Operations',
  'Enforcement',
  'Policy',
  'Investment',
  'Interdepartmental',
  'Other'
] as const;

export const MEETING_STATUSES = [
  'Scheduled',
  'In Progress',
  'Concluded',
  'Adjourned',
  'Follow-up Required'
] as const;

export const PRIORITY_LEVELS = [
  'High',
  'Medium',
  'Normal'
] as const;

export const DIRECTION_STATUSES = [
  'Pending',
  'In Progress',
  'Compliance Submitted',
  'Under Review',
  'Completed',
  'Overdue'
] as const;

export const DOCUMENT_TYPES = [
  'Agenda',
  'DG Brief',
  'Presentation',
  'Supporting Data',
  'Minutes of Meeting',
  'Compliance Report',
  'Official Notification',
  'Other'
] as const;

export const SAMPLE_USERS = [
  {
    id: 'USR-001',
    name: 'Muhammad Babar (DG)',
    email: 'dg@mines.punjab.gov.pk',
    role: 'Administrator' as const,
    designation: 'Director General, Mines & Minerals'
  },
  {
    id: 'USR-002',
    name: 'Syed Hammad Raza',
    email: 'monitoring.dg@mines.punjab.gov.pk',
    role: 'Monitoring / DG Office' as const,
    designation: 'Staff Officer to DG / Assistant Director (Monitoring)'
  },
  {
    id: 'USR-003',
    name: 'Dr. Tariq Mehmood',
    email: 'dir.lsm@mines.punjab.gov.pk',
    role: 'Division / Field Office User' as const,
    division: 'Large Scale Mining',
    designation: 'Director (Large Scale Mining)'
  },
  {
    id: 'USR-004',
    name: 'Engr. Zulfiqar Ali',
    email: 'dir.ssm@mines.punjab.gov.pk',
    role: 'Division / Field Office User' as const,
    division: 'Small Scale Mining',
    designation: 'Director (Small Scale Mining)'
  },
  {
    id: 'USR-005',
    name: 'Malik Farooq Ahmed',
    email: 'mo.chakwal@mines.punjab.gov.pk',
    role: 'Division / Field Office User' as const,
    division: 'Field Offices',
    field_office: 'Chakwal',
    designation: 'Mining Officer, Field Office Chakwal'
  },
  {
    id: 'USR-006',
    name: 'Rana Shahid Iqbal',
    email: 'mo.dgkhan@mines.punjab.gov.pk',
    role: 'Division / Field Office User' as const,
    division: 'Field Offices',
    field_office: 'D.G. Khan',
    designation: 'Senior Mining Officer, Field Office D.G. Khan'
  }
];
