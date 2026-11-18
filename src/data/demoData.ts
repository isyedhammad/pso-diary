import { Meeting, Direction, ActivityLog } from '../types';

export const INITIAL_DEMO_MEETINGS: Meeting[] = [
  {
    id: 'MTG-2026-001',
    title: 'Executive Review on Salt Range Concessions & Royalty Rationalization',
    subject: 'Quarterly compliance and royalty audit of major rock salt and limestone mining leases in Jhelum, Khushab and Chakwal',
    date: '2026-11-05',
    time: '10:30 AM',
    venue: 'Committee Room No. 1, DG Office, Poonch House, Multan Road, Lahore',
    chairperson: 'Director General, Mines & Minerals, Punjab',
    participating_officers: 'Director LSM, Director SSM, Director Minor Minerals, GIS Specialist, Mining Officers of Jhelum, Chakwal & Khushab',
    category: 'Revenue',
    status: 'Follow-up Required',
    general_remarks: 'Comprehensive review held on outstanding royalty reconciliation and boundary encroachment issues.',
    agenda_documents: [
      {
        id: 'DOC-M1-01',
        name: 'Official Agenda - Salt Range Royalty & Concession Review.pdf',
        file_type: 'Agenda',
        file_format: 'pdf',
        file_size: '420 KB',
        meeting_id: 'MTG-2026-001',
        uploaded_by: 'Staff Officer to DG',
        uploaded_at: '2026-11-03T09:15:00Z',
        description: 'Approved 6-point agenda signed by DG'
      }
    ],
    dg_brief_documents: [
      {
        id: 'DOC-M1-02',
        name: 'DG Briefing Note - Salt Range 5-Year Financial Rollup.pdf',
        file_type: 'DG Brief',
        file_format: 'pdf',
        file_size: '1.8 MB',
        meeting_id: 'MTG-2026-001',
        uploaded_by: 'Director (SSM)',
        uploaded_at: '2026-11-04T14:30:00Z',
        description: 'Confidential executive brief detailing leaseholder arrears and production stats'
      }
    ],
    presentation_documents: [
      {
        id: 'DOC-M1-03',
        name: 'GIS Satellite Survey & Quarry Encroachment Slides.pptx',
        file_type: 'Presentation',
        file_format: 'pptx',
        file_size: '4.6 MB',
        meeting_id: 'MTG-2026-001',
        uploaded_by: 'GIS Manager',
        uploaded_at: '2026-11-04T18:00:00Z',
        description: 'Drone & Sentinel-2 orthomosaic imagery of Salt Range concession coordinates'
      }
    ],
    supporting_data_documents: [
      {
        id: 'DOC-M1-04',
        name: 'Cement Industry Limestone Royalty Audit FY2021-2026.xlsx',
        file_type: 'Supporting Data',
        file_format: 'xlsx',
        file_size: '680 KB',
        meeting_id: 'MTG-2026-001',
        uploaded_by: 'Assistant Director (Accounts)',
        uploaded_at: '2026-11-04T11:20:00Z',
        description: 'Reconciled figures across Fauji, Bestway, Gharibwal, and Maple Leaf Cement'
      }
    ],
    minutes_documents: [
      {
        id: 'DOC-M1-05',
        name: 'Signed Minutes of Meeting - MTG-2026-001.pdf',
        file_type: 'Minutes of Meeting',
        file_format: 'pdf',
        file_size: '512 KB',
        meeting_id: 'MTG-2026-001',
        uploaded_by: 'Staff Officer to DG',
        uploaded_at: '2026-11-07T16:00:00Z',
        description: 'Official minutes issued under dispatch no. DGM&M/DG-Dir/2026/894'
      }
    ],
    compliance_report_documents: [],
    created_at: '2026-11-02T10:00:00Z',
    updated_at: '2026-11-07T16:00:00Z'
  },
  {
    id: 'MTG-2026-002',
    title: 'Statutory Appellate Authority Pendency & Legal Disposal Meeting',
    subject: 'Examination of 187 listed legal appeals before the Director General Lahore',
    date: '2026-11-10',
    time: '11:00 AM',
    venue: 'Court Bench of DG, Poonch House, Multan Road, Lahore',
    chairperson: 'Director General / Appellate Authority',
    participating_officers: 'Legal Advisor, Assistant Director Legal, Director SMA/T, Director LSM',
    category: 'Policy',
    status: 'Concluded',
    general_remarks: 'Bench disposed of 14 backlogged appeals. Remaining cases adjourned with strict timelines.',
    agenda_documents: [
      {
        id: 'DOC-M2-01',
        name: 'Cause List & Bench Docket - 10 Nov 2026.pdf',
        file_type: 'Agenda',
        file_format: 'pdf',
        file_size: '340 KB',
        meeting_id: 'MTG-2026-002',
        uploaded_by: 'Assistant Director Legal',
        uploaded_at: '2026-11-08T10:00:00Z'
      }
    ],
    dg_brief_documents: [
      {
        id: 'DOC-M2-02',
        name: 'Case Summary of PMCR Rule 176 Subletting Violations.pdf',
        file_type: 'DG Brief',
        file_format: 'pdf',
        file_size: '920 KB',
        meeting_id: 'MTG-2026-002',
        uploaded_by: 'Legal Advisor',
        uploaded_at: '2026-11-09T12:00:00Z'
      }
    ],
    presentation_documents: [],
    supporting_data_documents: [],
    minutes_documents: [
      {
        id: 'DOC-M2-03',
        name: 'Appellate Authority Record of Proceedings.pdf',
        file_type: 'Minutes of Meeting',
        file_format: 'pdf',
        file_size: '480 KB',
        meeting_id: 'MTG-2026-002',
        uploaded_by: 'Staff Officer to DG',
        uploaded_at: '2026-11-11T14:30:00Z'
      }
    ],
    compliance_report_documents: [],
    created_at: '2026-11-08T09:00:00Z',
    updated_at: '2026-11-11T14:30:00Z'
  },
  {
    id: 'MTG-2026-003',
    title: 'Interdepartmental Task Force on EPA Environmental Clearances & NOCs',
    subject: 'Fast-tracking DAEC approvals across 151 pending mining cases in 21 districts of Punjab',
    date: '2026-11-14',
    time: '02:30 PM',
    venue: 'Main Conference Hall, Punjab Mines Department, Lahore',
    chairperson: 'Director General, Mines & Minerals, Punjab',
    participating_officers: 'Director Environmental Facilitation, Deputy Director EPA Punjab, All Regional Mining Officers, Forest Department Liaison',
    category: 'Interdepartmental',
    status: 'In Progress',
    general_remarks: 'District-wise review of bottlenecks in District Environmental Assessment Committee (DAEC) meetings.',
    agenda_documents: [
      {
        id: 'DOC-M3-01',
        name: 'Interdepartmental Agenda - EPA Clearance Streamlining.pdf',
        file_type: 'Agenda',
        file_format: 'pdf',
        file_size: '310 KB',
        meeting_id: 'MTG-2026-003',
        uploaded_by: 'Director Environmental Facilitation',
        uploaded_at: '2026-11-12T11:00:00Z'
      }
    ],
    dg_brief_documents: [
      {
        id: 'DOC-M3-02',
        name: 'DG Brief - Bottleneck Analysis 21 Districts EPA Clearances.pdf',
        file_type: 'DG Brief',
        file_format: 'pdf',
        file_size: '1.2 MB',
        meeting_id: 'MTG-2026-003',
        uploaded_by: 'Staff Officer to DG',
        uploaded_at: '2026-11-13T15:00:00Z'
      }
    ],
    presentation_documents: [
      {
        id: 'DOC-M3-03',
        name: 'EPA Environmental Compliance Dossier Presentation.pptx',
        file_type: 'Presentation',
        file_format: 'pptx',
        file_size: '5.1 MB',
        meeting_id: 'MTG-2026-003',
        uploaded_by: 'Director Environmental Facilitation',
        uploaded_at: '2026-11-13T17:30:00Z'
      }
    ],
    supporting_data_documents: [],
    minutes_documents: [],
    compliance_report_documents: [],
    created_at: '2026-11-12T08:30:00Z',
    updated_at: '2026-11-14T17:00:00Z'
  },
  {
    id: 'MTG-2026-004',
    title: 'E-Auction Round-2 Strategy & Minor Minerals Minor Reserve Price Calibration',
    subject: 'Review of fetched bids in 1st round (+18% to +985% surge) and preparation for 2nd round minor mineral auctions',
    date: '2026-11-17',
    time: '10:00 AM',
    venue: 'Executive Meeting Room, DG Secretariat, Lahore',
    chairperson: 'Director General, Mines & Minerals, Punjab',
    participating_officers: 'Director Minor Minerals, Director IT, Director Administration, Regional Mining Officers of Lahore, Multan, Faisalabad, Gujranwala',
    category: 'Mining Operations',
    status: 'Scheduled',
    general_remarks: 'Preparation of revised schedule and advertisement for public notice.',
    agenda_documents: [
      {
        id: 'DOC-M4-01',
        name: 'E-Auction Round-2 Notice & Rules Agenda.pdf',
        file_type: 'Agenda',
        file_format: 'pdf',
        file_size: '290 KB',
        meeting_id: 'MTG-2026-004',
        uploaded_by: 'Director Minor Minerals',
        uploaded_at: '2026-11-16T14:00:00Z'
      }
    ],
    dg_brief_documents: [],
    presentation_documents: [],
    supporting_data_documents: [],
    minutes_documents: [],
    compliance_report_documents: [],
    created_at: '2026-11-16T10:00:00Z',
    updated_at: '2026-11-16T10:00:00Z'
  }
];

export const INITIAL_DEMO_DIRECTIONS: Direction[] = [
  {
    id: 'DIR-2026-001',
    title: 'Field Verification and Ground Demarcation of Salt Range Leases',
    description: 'Conduct joint physical inspection using DGPS equipment of all 14 active rock salt concessions in Dandot, Khewra, and Warcha to verify boundary encroachment complaints.',
    meeting_id: 'MTG-2026-001',
    meeting_title: 'Executive Review on Salt Range Concessions & Royalty Rationalization',
    issuance_date: '2026-11-05',
    responsible_divisions: ['GIS', 'Field Offices'],
    responsible_field_offices: ['Jhelum', 'Khushab', 'Chakwal'],
    responsible_officer: 'GIS Specialist & Mining Officers Jhelum/Khushab',
    priority: 'High',
    deadline: '2026-11-12', // Past deadline -> Overdue dynamically
    expected_deliverable: 'Geo-referenced DGPS survey report with boundary deviation coordinates and drone aerial orthomosaic map.',
    status: 'Overdue',
    remarks: 'Survey initiated in Khewra; delay reported in Warcha due to heavy fog.',
    attachments: [
      {
        id: 'ATT-001',
        name: 'Terms of Reference - DGPS Boundary Demarcation.pdf',
        file_type: 'Official Notification',
        file_format: 'pdf',
        file_size: '220 KB',
        direction_id: 'DIR-2026-001',
        uploaded_by: 'Staff Officer to DG',
        uploaded_at: '2026-11-05T12:00:00Z'
      }
    ],
    compliance_submissions: [
      {
        id: 'SUB-001',
        direction_id: 'DIR-2026-001',
        submission_date: '2026-11-11',
        submitted_by: 'Engr. Waqas Tariq (GIS Specialist)',
        submitter_designation: 'Senior GIS Specialist',
        submitter_division: 'GIS',
        progress_remarks: 'Khewra and Dandot sector boundary demarcation completed (70% coverage). Khushab/Warcha pending ground access.',
        percentage_of_completion: 70,
        supporting_files: [
          {
            id: 'DOC-SUB-01',
            name: 'Khewra_Dandot_DGPS_Interim_Survey_Report.pdf',
            file_type: 'Compliance Report',
            file_format: 'pdf',
            file_size: '3.4 MB',
            direction_id: 'DIR-2026-001',
            uploaded_by: 'Engr. Waqas Tariq (GIS Specialist)',
            uploaded_at: '2026-11-11T17:00:00Z'
          }
        ],
        remaining_action_required: 'Completion of 3 pending lease blocks in Warcha valley by 19th November.',
        review_status: 'Returned',
        reviewed_by: 'Muhammad Babar (DG)',
        review_date: '2026-11-13',
        review_remarks: 'Interim report noted. Direction cannot be marked complete without Warcha blocks. Submit finalized consolidated report.',
        created_at: '2026-11-11T17:00:00Z'
      }
    ],
    deadline_history: [
      {
        previous_deadline: '2026-11-10',
        new_deadline: '2026-11-12',
        reason: 'Severe weather and low visibility in Dandot heights',
        changed_by: 'Staff Officer to DG',
        changed_at: '2026-11-09T14:00:00Z'
      }
    ],
    reminders: [
      {
        date: '2026-11-13',
        sent_by: 'Staff Officer to DG',
        recipient: 'GIS Specialist & MO Jhelum',
        notes: 'Overdue reminder issued via DG Secretariat portal dispatch'
      }
    ],
    created_at: '2026-11-05T11:00:00Z',
    updated_at: '2026-11-13T15:00:00Z'
  },
  {
    id: 'DIR-2026-002',
    title: 'Issuance of Demand Notices to 4 Cement Plants for Royalty Difference',
    description: 'Issue formal statutory recovery demand notices to major cement plants following third-party limestone audit under Rule 160 of PMCR 2002.',
    meeting_id: 'MTG-2026-001',
    meeting_title: 'Executive Review on Salt Range Concessions & Royalty Rationalization',
    issuance_date: '2026-11-05',
    responsible_divisions: ['Large Scale Mining'],
    responsible_officer: 'Director (Large Scale Mining)',
    priority: 'High',
    deadline: '2026-11-15',
    expected_deliverable: 'Copy of dispatch receipts and recovery demand letters amounting to PKR 142.8 Million.',
    status: 'Compliance Submitted',
    remarks: 'Notices dispatched to all 4 manufacturers via registered post and email.',
    attachments: [],
    compliance_submissions: [
      {
        id: 'SUB-002',
        direction_id: 'DIR-2026-002',
        submission_date: '2026-11-14',
        submitted_by: 'Dr. Tariq Mehmood',
        submitter_designation: 'Director (Large Scale Mining)',
        submitter_division: 'Large Scale Mining',
        progress_remarks: 'All 4 formal statutory demand notices issued under dispatch numbers DGM&M/LSM/1092-1095. Total demand PKR 142,850,000/- with 15-day deposit deadline.',
        percentage_of_completion: 100,
        supporting_files: [
          {
            id: 'DOC-SUB-02',
            name: 'Dispatched_Demand_Notices_Cement_Plants_Signed.pdf',
            file_type: 'Compliance Report',
            file_format: 'pdf',
            file_size: '1.9 MB',
            direction_id: 'DIR-2026-002',
            uploaded_by: 'Dr. Tariq Mehmood',
            uploaded_at: '2026-11-14T11:30:00Z'
          }
        ],
        remaining_action_required: 'Monitoring payment deposit into State Bank of Pakistan treasury account head C03808.',
        review_status: 'Under Review',
        created_at: '2026-11-14T11:30:00Z'
      }
    ],
    deadline_history: [],
    reminders: [],
    created_at: '2026-11-05T11:15:00Z',
    updated_at: '2026-11-14T11:30:00Z'
  },
  {
    id: 'DIR-2026-003',
    title: 'Compilation of Subletting Cancellation Orders & Cause List Updation',
    description: 'Publish orders of 14 disposed appellate cases and notify revocation of sublet concessions in Chakwal and Mianwali.',
    meeting_id: 'MTG-2026-002',
    meeting_title: 'Statutory Appellate Authority Pendency & Legal Disposal Meeting',
    issuance_date: '2026-11-10',
    responsible_divisions: ['Administration', 'Small Scale Mining'],
    responsible_officer: 'Assistant Director (Legal) & Director (SSM)',
    priority: 'Normal',
    deadline: '2026-11-17',
    expected_deliverable: 'Certified sealed copies of orders uploaded to portal and served on respondents.',
    status: 'Completed',
    remarks: 'Accepted and verified by DG on 16 Nov 2026.',
    attachments: [],
    compliance_submissions: [
      {
        id: 'SUB-003',
        direction_id: 'DIR-2026-003',
        submission_date: '2026-11-15',
        submitted_by: 'Engr. Zulfiqar Ali',
        submitter_designation: 'Director (Small Scale Mining)',
        submitter_division: 'Small Scale Mining',
        progress_remarks: 'All 14 certified copies uploaded to departmental website and served via registered A/D post. Ledger updated.',
        percentage_of_completion: 100,
        supporting_files: [
          {
            id: 'DOC-SUB-03',
            name: 'Certified_Orders_Appellate_Disposal_Batch_Nov2026.pdf',
            file_type: 'Compliance Report',
            file_format: 'pdf',
            file_size: '2.1 MB',
            direction_id: 'DIR-2026-003',
            uploaded_by: 'Engr. Zulfiqar Ali',
            uploaded_at: '2026-11-15T15:00:00Z'
          }
        ],
        remaining_action_required: 'None.',
        review_status: 'Accepted',
        reviewed_by: 'Muhammad Babar (DG)',
        review_date: '2026-11-16',
        review_remarks: 'Compliance accepted. Good progress on pending appellate backlog.',
        created_at: '2026-11-15T15:00:00Z'
      }
    ],
    deadline_history: [],
    reminders: [],
    created_at: '2026-11-10T12:00:00Z',
    updated_at: '2026-11-16T10:00:00Z'
  },
  {
    id: 'DIR-2026-004',
    title: 'Liaison with Deputy Commissioners for Convening DAEC Meetings in 7 Districts',
    description: 'Issue official D.O. letters from DG to Deputy Commissioners of Attock, Chakwal, Rawalpindi, Jhelum, Sargodha, D.G. Khan and Mianwali to convene pending District Environmental Assessment Committee meetings.',
    meeting_id: 'MTG-2026-003',
    meeting_title: 'Interdepartmental Task Force on EPA Environmental Clearances & NOCs',
    issuance_date: '2026-11-14',
    responsible_divisions: ['Environmental Facilitation'],
    responsible_officer: 'Director (Environmental Facilitation)',
    priority: 'High',
    deadline: '2026-11-19', // Due within 24-48 hours
    expected_deliverable: 'Signed D.O. letters dispatched and tracking roster established.',
    status: 'In Progress',
    remarks: 'Draft D.O. letters submitted for DG signature today.',
    attachments: [],
    compliance_submissions: [
      {
        id: 'SUB-004',
        direction_id: 'DIR-2026-004',
        submission_date: '2026-11-17',
        submitted_by: 'M. Kashif (Director Env Facilitation)',
        submitter_designation: 'Director (Environmental Facilitation)',
        submitter_division: 'Environmental Facilitation',
        progress_remarks: 'Draft D.O. letters prepared for all 7 Deputy Commissioners with district case dossiers attached. Placed in DG Secretariat for signature.',
        percentage_of_completion: 60,
        supporting_files: [],
        remaining_action_required: 'Dispatch following DG signature and schedule follow-up teleconferences with Additional Deputy Commissioners (Revenue).',
        review_status: 'Under Review',
        created_at: '2026-11-17T09:30:00Z'
      }
    ],
    deadline_history: [],
    reminders: [],
    created_at: '2026-11-14T15:00:00Z',
    updated_at: '2026-11-17T09:30:00Z'
  },
  {
    id: 'DIR-2026-005',
    title: 'Public Advertisement Release for E-Auction Round-2 Lots',
    description: 'Finalize national newspaper advertisement and e-procurement portal listing for 84 sand and gravel minor mineral blocks across Punjab.',
    meeting_id: 'MTG-2026-004',
    meeting_title: 'E-Auction Round-2 Strategy & Minor Minerals Minor Reserve Price Calibration',
    issuance_date: '2026-11-16',
    responsible_divisions: ['Minor Minerals', 'IT', 'Administration'],
    responsible_officer: 'Director (Minor Minerals) & Director (IT)',
    priority: 'Medium',
    deadline: '2026-11-22',
    expected_deliverable: 'Published advertisement tear-sheet and active online auction URLs.',
    status: 'Pending',
    remarks: 'Pending reserve price sign-off by Secretary Mines.',
    attachments: [],
    compliance_submissions: [],
    deadline_history: [],
    reminders: [],
    created_at: '2026-11-16T11:30:00Z',
    updated_at: '2026-11-16T11:30:00Z'
  },
  {
    id: 'DIR-2026-006',
    title: 'Quarterly Safety Audit & First Aid Equipment Check in Coal Mines',
    description: 'Inspect underground working conditions, methane ventilation and safety gear in coal mines situated in Choa Saidan Shah, Dandot, and Makarwal.',
    meeting_id: 'MTG-2026-001',
    meeting_title: 'Executive Review on Salt Range Concessions & Royalty Rationalization',
    issuance_date: '2026-11-05',
    responsible_divisions: ['Field Offices'],
    responsible_field_offices: ['Chakwal', 'Mianwali'],
    responsible_officer: 'Inspector of Mines & MO Chakwal/Mianwali',
    priority: 'Normal',
    deadline: '2026-11-20',
    expected_deliverable: 'Consolidated Mine Safety & Inspection Report with violation notices if any.',
    status: 'In Progress',
    remarks: 'Inspections in Dandot concluded; Makarwal scheduled for 18-19 Nov.',
    attachments: [],
    compliance_submissions: [],
    deadline_history: [],
    reminders: [],
    created_at: '2026-11-05T12:00:00Z',
    updated_at: '2026-11-15T09:00:00Z'
  }
];

export const INITIAL_DEMO_ACTIVITY_LOGS: ActivityLog[] = [
  {
    id: 'ACT-001',
    entity_type: 'meeting',
    entity_id: 'MTG-2026-001',
    entity_title: 'Executive Review on Salt Range Concessions & Royalty Rationalization',
    action: 'Meeting Created',
    user_name: 'Syed Hammad Raza',
    user_role: 'Staff Officer to DG',
    timestamp: '2026-11-02T10:00:00Z',
    remarks: 'Scheduled quarterly review chaired by Director General'
  },
  {
    id: 'ACT-002',
    entity_type: 'document',
    entity_id: 'DOC-M1-02',
    entity_title: 'DG Briefing Note - Salt Range 5-Year Financial Rollup.pdf',
    action: 'Brief Uploaded',
    user_name: 'Dr. Tariq Mehmood',
    user_role: 'Director (LSM)',
    timestamp: '2026-11-04T14:30:00Z',
    remarks: 'Executive brief for DG meeting'
  },
  {
    id: 'ACT-003',
    entity_type: 'direction',
    entity_id: 'DIR-2026-001',
    entity_title: 'Field Verification and Ground Demarcation of Salt Range Leases',
    action: 'Direction Issued',
    user_name: 'Muhammad Babar (DG)',
    user_role: 'Director General',
    timestamp: '2026-11-05T11:00:00Z',
    remarks: 'Issued during MTG-2026-001 with High Priority'
  },
  {
    id: 'ACT-004',
    entity_type: 'direction',
    entity_id: 'DIR-2026-001',
    entity_title: 'Field Verification and Ground Demarcation of Salt Range Leases',
    action: 'Deadline Revised',
    user_name: 'Syed Hammad Raza',
    user_role: 'Staff Officer to DG',
    timestamp: '2026-11-09T14:00:00Z',
    previous_value: '2026-11-10',
    new_value: '2026-11-12',
    remarks: 'Weather and low visibility in Dandot heights'
  },
  {
    id: 'ACT-005',
    entity_type: 'compliance',
    entity_id: 'SUB-001',
    entity_title: 'DIR-2026-001 Compliance Submission',
    action: 'Compliance Submitted',
    user_name: 'Engr. Waqas Tariq (GIS Specialist)',
    user_role: 'GIS Specialist',
    timestamp: '2026-11-11T17:00:00Z',
    new_value: '70% Complete',
    remarks: 'Interim DGPS survey report uploaded'
  },
  {
    id: 'ACT-006',
    entity_type: 'compliance',
    entity_id: 'SUB-001',
    entity_title: 'DIR-2026-001 Compliance Review',
    action: 'Compliance Returned',
    user_name: 'Muhammad Babar (DG)',
    user_role: 'Director General',
    timestamp: '2026-11-13T10:15:00Z',
    remarks: 'Returned for further action: Warcha blocks pending survey'
  },
  {
    id: 'ACT-007',
    entity_type: 'direction',
    entity_id: 'DIR-2026-003',
    entity_title: 'Compilation of Subletting Cancellation Orders & Cause List Updation',
    action: 'Direction Marked Completed',
    user_name: 'Muhammad Babar (DG)',
    user_role: 'Director General',
    timestamp: '2026-11-16T10:00:00Z',
    previous_value: 'Compliance Submitted',
    new_value: 'Completed',
    remarks: 'Compliance accepted following formal verification'
  },
  {
    id: 'ACT-008',
    entity_type: 'meeting',
    entity_id: 'MTG-2026-004',
    entity_title: 'E-Auction Round-2 Strategy & Minor Minerals Minor Reserve Price Calibration',
    action: 'Meeting Created',
    user_name: 'Syed Hammad Raza',
    user_role: 'Staff Officer to DG',
    timestamp: '2026-11-16T10:00:00Z'
  }
];
