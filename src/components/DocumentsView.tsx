import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { DocumentItem, DocumentType } from '../types';
import { DOCUMENT_TYPES, DEPARTMENTAL_DIVISIONS } from '../data/constants';
import { 
  FolderArchive, 
  Search, 
  Filter, 
  Download, 
  FileText, 
  FileSpreadsheet, 
  Image, 
  ExternalLink,
  Calendar,
  Compass,
  Building,
  CheckCircle2,
  FileCheck,
  Eye,
  X
} from 'lucide-react';

export const DocumentsView: React.FC = () => {
  const { 
    meetings, 
    directions, 
    setSelectedMeetingId, 
    setSelectedDirectionId, 
    setActiveTab 
  } = useApp();

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [meetingFilter, setMeetingFilter] = useState<string>('all');
  const [formatFilter, setFormatFilter] = useState<string>('all');

  // Preview Modal
  const [previewDoc, setPreviewDoc] = useState<DocumentItem | null>(null);

  // Compile all documents across meetings and directions centrally
  const allDocuments = useMemo<DocumentItem[]>(() => {
    const list: DocumentItem[] = [];

    // Documents from meetings
    meetings.forEach(m => {
      const addFromList = (docs: DocumentItem[] | undefined, defaultType: DocumentType) => {
        if (!docs) return;
        docs.forEach(d => {
          list.push({
            ...d,
            meeting_id: m.id,
            file_type: d.file_type || defaultType
          });
        });
      };

      addFromList(m.agenda_documents, 'Agenda');
      addFromList(m.dg_brief_documents, 'DG Brief');
      addFromList(m.presentation_documents, 'Presentation');
      addFromList(m.supporting_data_documents, 'Supporting Data');
      addFromList(m.minutes_documents, 'Minutes of Meeting');
      addFromList(m.compliance_report_documents, 'Compliance Report');
    });

    // Documents from directions & compliance submissions
    directions.forEach(d => {
      if (d.attachments) {
        d.attachments.forEach(att => {
          list.push({
            ...att,
            direction_id: d.id,
            meeting_id: d.meeting_id,
            division: d.responsible_divisions[0]
          });
        });
      }

      if (d.compliance_submissions) {
        d.compliance_submissions.forEach(sub => {
          if (sub.supporting_files) {
            sub.supporting_files.forEach(f => {
              list.push({
                ...f,
                direction_id: d.id,
                meeting_id: d.meeting_id,
                division: sub.submitter_division || d.responsible_divisions[0]
              });
            });
          }
        });
      }
    });

    // Deduplicate by id
    const unique = new Map<string, DocumentItem>();
    list.forEach(item => {
      if (!unique.has(item.id)) {
        unique.set(item.id, item);
      }
    });

    return Array.from(unique.values()).sort(
      (a, b) => new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime()
    );
  }, [meetings, directions]);

  // Filtered documents
  const filteredDocuments = allDocuments.filter(doc => {
    const matchSearch = 
      doc.name.toLowerCase().includes(search.toLowerCase()) ||
      (doc.description && doc.description.toLowerCase().includes(search.toLowerCase())) ||
      (doc.uploaded_by && doc.uploaded_by.toLowerCase().includes(search.toLowerCase())) ||
      (doc.meeting_id && doc.meeting_id.toLowerCase().includes(search.toLowerCase())) ||
      (doc.direction_id && doc.direction_id.toLowerCase().includes(search.toLowerCase()));

    const matchType = typeFilter === 'all' || doc.file_type === typeFilter;
    const matchMeeting = meetingFilter === 'all' || doc.meeting_id === meetingFilter;
    const matchFormat = formatFilter === 'all' || doc.file_format.toLowerCase() === formatFilter.toLowerCase();

    return matchSearch && matchType && matchMeeting && matchFormat;
  });

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Header */}
      <div className="pb-2 border-b border-[#1b2d49] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-100 font-serif">
            Centralized Documents Repository
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Searchable central repository preserving relational linkage to meetings, DG briefs, minutes, and compliance submissions.
          </p>
        </div>

        <div className="text-xs font-mono bg-[#0e192c] border border-[#1e3250] px-3 py-1.5 rounded-lg text-slate-300">
          Total Indexed Files: <strong className="text-amber-400">{allDocuments.length}</strong>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-[#0e192c] border border-[#1e3250] rounded-xl p-3.5 shadow space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search document name, type, meeting ID, direction ID, uploaded by..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#070d18] text-xs text-slate-200 pl-9 pr-4 py-2 rounded-lg border border-[#1e3250] focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Document Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-[#070d18] text-slate-300 px-3 py-2 rounded-lg border border-[#1e3250] focus:border-amber-500 focus:outline-none"
            >
              <option value="all">All Document Types</option>
              {DOCUMENT_TYPES.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>

            {/* Meeting Filter */}
            <select
              value={meetingFilter}
              onChange={(e) => setMeetingFilter(e.target.value)}
              className="bg-[#070d18] text-slate-300 px-3 py-2 rounded-lg border border-[#1e3250] focus:border-amber-500 focus:outline-none"
            >
              <option value="all">All Meetings</option>
              {meetings.map(m => (
                <option key={m.id} value={m.id}>{m.id} - {m.title.slice(0, 25)}...</option>
              ))}
            </select>

            {/* File Format Filter */}
            <select
              value={formatFilter}
              onChange={(e) => setFormatFilter(e.target.value)}
              className="bg-[#070d18] text-slate-300 px-3 py-2 rounded-lg border border-[#1e3250] focus:border-amber-500 focus:outline-none"
            >
              <option value="all">All Formats</option>
              <option value="pdf">PDF</option>
              <option value="docx">Word (.docx)</option>
              <option value="xlsx">Excel (.xlsx)</option>
              <option value="pptx">PowerPoint (.pptx)</option>
              <option value="png">PNG / JPG Images</option>
            </select>
          </div>
        </div>
      </div>

      {/* Documents Grid / Table */}
      <div className="bg-[#0e192c] border border-[#1e3250] rounded-xl overflow-hidden shadow">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#091220] border-b border-[#1c2e4d] text-slate-400 font-semibold text-[11px] uppercase tracking-wider font-mono">
                <th className="py-3 px-3">Document Title</th>
                <th className="py-3 px-3">Type</th>
                <th className="py-3 px-3">Format</th>
                <th className="py-3 px-3">Related Meeting</th>
                <th className="py-3 px-3">Related Direction</th>
                <th className="py-3 px-3">Uploaded By</th>
                <th className="py-3 px-3">Upload Date</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#15233a]">
              {filteredDocuments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No documents matching search or active filter parameters.
                  </td>
                </tr>
              ) : (
                filteredDocuments.map(doc => (
                  <tr key={doc.id} className="hover:bg-[#13223b] transition-colors">
                    <td className="py-3 px-3 font-medium text-slate-100 max-w-xs">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-amber-400 flex-shrink-0" />
                        <span className="truncate">{doc.name}</span>
                      </div>
                      {doc.description && (
                        <p className="text-[10px] text-slate-400 truncate pl-6">{doc.description}</p>
                      )}
                    </td>

                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="text-[10px] px-2 py-0.5 rounded font-semibold bg-[#14233c] text-amber-300 border border-[#203657]">
                        {doc.file_type}
                      </span>
                    </td>

                    <td className="py-3 px-3 uppercase font-mono text-[10px] text-slate-300 whitespace-nowrap">
                      {doc.file_format} {doc.file_size ? `(${doc.file_size})` : ''}
                    </td>

                    <td className="py-3 px-3 font-mono text-xs whitespace-nowrap">
                      {doc.meeting_id ? (
                        <button
                          onClick={() => {
                            setSelectedMeetingId(doc.meeting_id!);
                            setActiveTab('meetings');
                          }}
                          className="text-amber-400 hover:underline flex items-center gap-1"
                        >
                          <span>{doc.meeting_id}</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      ) : (
                        <span className="text-slate-500">-</span>
                      )}
                    </td>

                    <td className="py-3 px-3 font-mono text-xs whitespace-nowrap">
                      {doc.direction_id ? (
                        <button
                          onClick={() => {
                            setSelectedDirectionId(doc.direction_id!);
                            setActiveTab('directions');
                          }}
                          className="text-emerald-400 hover:underline flex items-center gap-1"
                        >
                          <span>{doc.direction_id}</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      ) : (
                        <span className="text-slate-500">-</span>
                      )}
                    </td>

                    <td className="py-3 px-3 text-slate-300 whitespace-nowrap">
                      {doc.uploaded_by}
                    </td>

                    <td className="py-3 px-3 font-mono text-slate-400 whitespace-nowrap">
                      {doc.uploaded_at.split('T')[0]}
                    </td>

                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setPreviewDoc(doc)}
                          className="p-1.5 rounded-lg bg-[#11213b] hover:bg-[#1a3359] text-amber-400 border border-[#1e3458] transition-colors"
                          title="Preview Document Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {doc.url || doc.content_base64 ? (
                          <a
                            href={doc.url || doc.content_base64}
                            download={doc.name}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 rounded-lg bg-[#11213b] hover:bg-[#1a3359] text-emerald-400 border border-[#1e3458] transition-colors"
                            title="Download Document"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </a>
                        ) : (
                          <button
                            disabled
                            className="p-1.5 text-slate-600 cursor-not-allowed"
                            title="Cloud file pointer"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Document Detail Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0c1626] border border-[#22395d] rounded-xl max-w-md w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#1b2d49]">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-slate-100 font-serif">Document Dossier</h3>
              </div>
              <button onClick={() => setPreviewDoc(null)} className="text-slate-400">✕</button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-mono">File Name</span>
                <p className="text-slate-100 font-bold break-all">{previewDoc.name}</p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-mono">Category</span>
                  <p className="text-amber-300 font-semibold">{previewDoc.file_type}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-mono">Format</span>
                  <p className="text-slate-200 font-mono uppercase">{previewDoc.file_format} {previewDoc.file_size ? `(${previewDoc.file_size})` : ''}</p>
                </div>
              </div>

              {previewDoc.meeting_id && (
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-mono">Associated Meeting</span>
                  <p className="text-slate-200 font-mono">{previewDoc.meeting_id}</p>
                </div>
              )}

              {previewDoc.direction_id && (
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-mono">Associated DG Direction</span>
                  <p className="text-slate-200 font-mono">{previewDoc.direction_id}</p>
                </div>
              )}

              <div>
                <span className="text-[10px] text-slate-400 uppercase font-mono">Uploaded By</span>
                <p className="text-slate-200">{previewDoc.uploaded_by} on {previewDoc.uploaded_at.split('T')[0]}</p>
              </div>

              {previewDoc.description && (
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-mono">Description / Notes</span>
                  <p className="text-slate-300 bg-[#070e1a] p-2 rounded border border-[#142338]">{previewDoc.description}</p>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-[#1b2d49]">
              <span className="text-[10px] text-slate-500 font-mono">ID: {previewDoc.id}</span>
              {previewDoc.url || previewDoc.content_base64 ? (
                <a
                  href={previewDoc.url || previewDoc.content_base64}
                  download={previewDoc.name}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-slate-100 font-bold text-xs rounded-lg flex items-center gap-1.5 shadow"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Document</span>
                </a>
              ) : (
                <button disabled className="px-4 py-1.5 bg-slate-800 text-slate-500 text-xs rounded-lg">
                  Cloud Secured
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
