import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { DocumentItem, DocumentType } from '../types';
import { DOCUMENT_TYPES } from '../data/constants';
import { 
  FolderArchive, 
  Search, 
  Download, 
  FileText, 
  ExternalLink,
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
  const [formatFilter, setFormatFilter] = useState<string>('all');
  const [previewDoc, setPreviewDoc] = useState<DocumentItem | null>(null);

  // Compile all documents across meetings and directions
  const allDocuments = useMemo<DocumentItem[]>(() => {
    const list: DocumentItem[] = [];

    meetings.forEach(m => {
      const addFromList = (docs: DocumentItem[] | undefined, defaultType: DocumentType) => {
        if (!docs) return;
        docs.forEach(d => {
          list.push({ ...d, meeting_id: m.id, file_type: d.file_type || defaultType });
        });
      };
      addFromList(m.agenda_documents, 'Agenda');
      addFromList(m.dg_brief_documents, 'DG Brief');
      addFromList(m.presentation_documents, 'Presentation');
      addFromList(m.supporting_data_documents, 'Supporting Data');
      addFromList(m.minutes_documents, 'Minutes of Meeting');
      addFromList(m.compliance_report_documents, 'Compliance Report');
    });

    directions.forEach(d => {
      if (d.attachments) {
        d.attachments.forEach(att => {
          list.push({ ...att, direction_id: d.id, meeting_id: d.meeting_id, division: d.responsible_divisions[0] });
        });
      }
      if (d.compliance_submissions) {
        d.compliance_submissions.forEach(sub => {
          if (sub.supporting_files) {
            sub.supporting_files.forEach(f => {
              list.push({ ...f, direction_id: d.id, meeting_id: d.meeting_id, division: sub.submitter_division || d.responsible_divisions[0] });
            });
          }
        });
      }
    });

    const unique = new Map<string, DocumentItem>();
    list.forEach(item => {
      if (!unique.has(item.id)) unique.set(item.id, item);
    });

    return Array.from(unique.values()).sort(
      (a, b) => new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime()
    );
  }, [meetings, directions]);

  const filteredDocuments = allDocuments.filter(doc => {
    const matchSearch = 
      doc.name.toLowerCase().includes(search.toLowerCase()) ||
      (doc.description && doc.description.toLowerCase().includes(search.toLowerCase())) ||
      (doc.uploaded_by && doc.uploaded_by.toLowerCase().includes(search.toLowerCase())) ||
      (doc.meeting_id && doc.meeting_id.toLowerCase().includes(search.toLowerCase())) ||
      (doc.direction_id && doc.direction_id.toLowerCase().includes(search.toLowerCase()));

    const matchType = typeFilter === 'all' || doc.file_type === typeFilter;
    const matchFormat = formatFilter === 'all' || doc.file_format.toLowerCase() === formatFilter.toLowerCase();

    return matchSearch && matchType && matchFormat;
  });

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Header */}
      <div className="pb-2 border-b border-slate-200 dark:border-[#1b2d49] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 font-serif">
            Documents Repository
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Searchable central repository preserving links to meetings, DG briefs, minutes, and compliance submissions.
          </p>
        </div>

        <div className="text-xs font-mono bg-white dark:bg-[#0e192c] border border-slate-200 dark:border-[#1e3250] px-3 py-1.5 rounded-lg text-slate-700 dark:text-slate-300">
          Files Indexed: <strong className="text-emerald-700 dark:text-amber-400">{allDocuments.length}</strong>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white dark:bg-[#0e192c] border border-slate-200 dark:border-[#1e3250] rounded-xl p-3.5 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search documents by name, meeting, direction, uploader..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 dark:bg-[#070d18] text-xs text-slate-900 dark:text-slate-200 pl-9 pr-4 py-2 rounded-lg border border-slate-300 dark:border-[#1e3250] focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-slate-50 dark:bg-[#070d18] text-slate-700 dark:text-slate-300 px-3 py-2 rounded-lg border border-slate-300 dark:border-[#1e3250]"
            >
              <option value="all">All Document Types</option>
              {DOCUMENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>

            <select
              value={formatFilter}
              onChange={(e) => setFormatFilter(e.target.value)}
              className="bg-slate-50 dark:bg-[#070d18] text-slate-700 dark:text-slate-300 px-3 py-2 rounded-lg border border-slate-300 dark:border-[#1e3250]"
            >
              <option value="all">All Formats</option>
              <option value="pdf">PDF</option>
              <option value="docx">Word (.docx)</option>
              <option value="xlsx">Excel (.xlsx)</option>
              <option value="pptx">PowerPoint (.pptx)</option>
              <option value="png">Images</option>
            </select>
          </div>
        </div>
      </div>

      {/* Documents Table */}
      <div className="bg-white dark:bg-[#0e192c] border border-slate-200 dark:border-[#1e3250] rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-[#091220] border-b border-slate-200 dark:border-[#1c2e4d] text-slate-500 dark:text-slate-400 font-semibold text-[11px] uppercase tracking-wider font-mono">
                <th className="py-3 px-3">Document Title</th>
                <th className="py-3 px-3">Type</th>
                <th className="py-3 px-3">Format</th>
                <th className="py-3 px-3">Related Meeting</th>
                <th className="py-3 px-3">Related Direction</th>
                <th className="py-3 px-3">Uploaded By</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#15233a]">
              {filteredDocuments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No documents uploaded yet.
                  </td>
                </tr>
              ) : (
                filteredDocuments.map(doc => (
                  <tr key={doc.id} className="hover:bg-slate-50 dark:hover:bg-[#13223b] transition-colors">
                    <td className="py-3 px-3 font-medium text-slate-900 dark:text-slate-100 max-w-xs">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-emerald-600 dark:text-amber-400 flex-shrink-0" />
                        <span className="truncate">{doc.name}</span>
                      </div>
                    </td>

                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="text-[10px] px-2 py-0.5 rounded font-semibold bg-slate-100 dark:bg-[#14233c] text-emerald-800 dark:text-amber-300 border border-slate-200 dark:border-[#203657]">
                        {doc.file_type}
                      </span>
                    </td>

                    <td className="py-3 px-3 uppercase font-mono text-[10px] text-slate-500 dark:text-slate-300 whitespace-nowrap">
                      {doc.file_format} {doc.file_size ? `(${doc.file_size})` : ''}
                    </td>

                    <td className="py-3 px-3 font-mono text-xs whitespace-nowrap">
                      {doc.meeting_id ? (
                        <button
                          onClick={() => {
                            setSelectedMeetingId(doc.meeting_id!);
                            setActiveTab('meetings');
                          }}
                          className="text-emerald-700 dark:text-amber-400 hover:underline flex items-center gap-1"
                        >
                          <span>{doc.meeting_id}</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      ) : <span className="text-slate-400">-</span>}
                    </td>

                    <td className="py-3 px-3 font-mono text-xs whitespace-nowrap">
                      {doc.direction_id ? (
                        <button
                          onClick={() => {
                            setSelectedDirectionId(doc.direction_id!);
                            setActiveTab('directions');
                          }}
                          className="text-blue-700 dark:text-emerald-400 hover:underline flex items-center gap-1"
                        >
                          <span>{doc.direction_id}</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      ) : <span className="text-slate-400">-</span>}
                    </td>

                    <td className="py-3 px-3 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                      {doc.uploaded_by}
                    </td>

                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setPreviewDoc(doc)}
                          className="p-1.5 rounded-lg bg-slate-100 dark:bg-[#11213b] text-slate-700 dark:text-amber-400 hover:bg-slate-200"
                          title="Preview"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {doc.url || doc.content_base64 ? (
                          <a
                            href={doc.url || doc.content_base64}
                            download={doc.name}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 rounded-lg bg-slate-100 dark:bg-[#11213b] text-emerald-600 hover:bg-slate-200"
                            title="Download"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </a>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0c1626] border border-slate-200 dark:border-[#22395d] rounded-xl max-w-md w-full p-5 shadow-2xl space-y-3 text-xs">
            <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-[#1b2d49]">
              <h3 className="font-bold text-slate-800 dark:text-slate-100 font-serif">Document Details</h3>
              <button onClick={() => setPreviewDoc(null)} className="text-slate-500">✕</button>
            </div>
            <div>
              <span className="text-slate-400 block font-mono text-[10px]">Name:</span>
              <p className="font-semibold text-slate-800 dark:text-slate-100">{previewDoc.name}</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-slate-400 block font-mono text-[10px]">Category:</span>
                <p>{previewDoc.file_type}</p>
              </div>
              <div>
                <span className="text-slate-400 block font-mono text-[10px]">Format:</span>
                <p className="font-mono uppercase">{previewDoc.file_format} {previewDoc.file_size ? `(${previewDoc.file_size})` : ''}</p>
              </div>
            </div>
            <div>
              <span className="text-slate-400 block font-mono text-[10px]">Uploaded:</span>
              <p>{previewDoc.uploaded_by} on {previewDoc.uploaded_at.split('T')[0]}</p>
            </div>
            {previewDoc.description && (
              <div>
                <span className="text-slate-400 block font-mono text-[10px]">Notes:</span>
                <p className="p-2 bg-slate-50 dark:bg-[#070e1a] rounded">{previewDoc.description}</p>
              </div>
            )}
            <div className="pt-2 border-t border-slate-200 dark:border-[#1b2d49] flex justify-end">
              {previewDoc.url || previewDoc.content_base64 ? (
                <a
                  href={previewDoc.url || previewDoc.content_base64}
                  download={previewDoc.name}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-1.5 bg-emerald-700 text-white rounded-lg font-bold flex items-center gap-1.5 shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </a>
              ) : null}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
