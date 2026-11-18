import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { testCloudConnection, SUPABASE_SQL_SCHEMA } from '../services/supabaseClient';
import { SAMPLE_USERS } from '../data/constants';
import { 
  Settings as SettingsIcon, 
  Database, 
  ShieldCheck, 
  UserCheck, 
  Copy, 
  Check, 
  RefreshCw, 
  Trash2, 
  Download, 
  Upload, 
  FileCode, 
  Activity,
  Layers,
  AlertTriangle,
  Server
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { 
    cloudConfig, 
    updateCloudSettings, 
    resetToDemoData, 
    clearDatabase, 
    exportDatabase, 
    importDatabase,
    activityLogs,
    currentUser,
    setCurrentUser,
    isDemoActive
  } = useApp();

  const [activeTab, setActiveTab] = useState<'cloud' | 'schema' | 'roles' | 'audit' | 'data'>('cloud');

  // Cloud Config state
  const [supabaseUrl, setSupabaseUrl] = useState(cloudConfig.supabaseUrl || '');
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(cloudConfig.supabaseAnonKey || '');
  const [storageBucket, setStorageBucket] = useState(cloudConfig.storageBucket || 'dgmm-compliance-docs');
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [copiedSchema, setCopiedSchema] = useState(false);

  // Backup file upload
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await testCloudConnection({
        ...cloudConfig,
        supabaseUrl,
        supabaseAnonKey,
        storageBucket
      });
      setTestResult(res);
      if (res.success) {
        updateCloudSettings({
          ...cloudConfig,
          supabaseUrl,
          supabaseAnonKey,
          storageBucket
        });
      }
    } catch (e: any) {
      setTestResult({ success: false, message: e.message || 'Connection failed' });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSaveCloudSettings = () => {
    updateCloudSettings({
      ...cloudConfig,
      supabaseUrl,
      supabaseAnonKey,
      storageBucket
    });
    setTestResult({ success: true, message: 'Cloud configuration saved successfully!' });
  };

  const handleCopySchema = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopiedSchema(true);
    setTimeout(() => setCopiedSchema(false), 2500);
  };

  const handleDownloadBackup = () => {
    const json = exportDatabase();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `DGMM_Portal_Full_Backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      const success = importDatabase(content);
      if (success) {
        setImportStatus('Database successfully restored from backup!');
      } else {
        setImportStatus('Error: Invalid JSON schema format.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Header */}
      <div className="pb-2 border-b border-[#1b2d49]">
        <h2 className="text-xl font-bold text-slate-100 font-serif">
          System Configuration & Settings
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Cloud backend connectivity, PostgreSQL relational schema, user role simulator, audit logs, and data management.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto p-1.5 bg-[#0e192c] border border-[#1e3250] rounded-xl text-xs font-medium">
        {[
          { id: 'cloud', label: 'Cloud Database (Supabase)', icon: Database },
          { id: 'schema', label: 'PostgreSQL Relational Schema', icon: FileCode },
          { id: 'roles', label: 'User Roles & Access', icon: UserCheck },
          { id: 'audit', label: `Audit Trail & History (${activityLogs.length})`, icon: Activity },
          { id: 'data', label: 'Data Management & Demo Control', icon: Server },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-2 rounded-lg flex items-center gap-2 whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-amber-600/20 text-amber-300 border border-amber-600/50 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#132238]'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: CLOUD DATABASE */}
      {activeTab === 'cloud' && (
        <div className="bg-[#0e192c] border border-[#1e3250] rounded-xl p-6 shadow space-y-5">
          <div className="flex items-start justify-between gap-4 pb-3 border-b border-[#1b2d49]">
            <div>
              <h3 className="text-base font-bold text-slate-100 font-serif flex items-center gap-2">
                <Database className="w-4 h-4 text-amber-400" />
                <span>Supabase PostgreSQL & Cloud Storage Integration</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Connect the portal to your private Supabase project. All meetings, directions, compliance submissions, and uploaded briefs will synchronize to the cloud PostgreSQL database and private Storage bucket.
              </p>
            </div>

            <div className={`text-xs px-2.5 py-1 rounded-md border font-mono font-semibold flex items-center gap-1.5 ${
              cloudConfig.supabaseUrl 
                ? 'bg-emerald-950 text-emerald-300 border-emerald-800' 
                : 'bg-amber-950 text-amber-300 border-amber-800'
            }`}>
              <span className={`w-2 h-2 rounded-full ${cloudConfig.supabaseUrl ? 'bg-emerald-400' : 'bg-amber-400'} animate-pulse`} />
              <span>{cloudConfig.supabaseUrl ? 'Cloud Connected' : 'Persistent Cloud Ledger Active'}</span>
            </div>
          </div>

          <div className="space-y-4 max-w-2xl text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Supabase Project URL
              </label>
              <input
                type="text"
                placeholder="https://xyzcompany.supabase.co"
                value={supabaseUrl}
                onChange={(e) => setSupabaseUrl(e.target.value)}
                className="w-full bg-[#070d18] text-slate-100 p-2.5 rounded-lg border border-[#1e3250] focus:border-amber-500 focus:outline-none font-mono"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                Found in your Supabase Dashboard under Project Settings &gt; API
              </span>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Supabase Public Anon API Key
              </label>
              <input
                type="password"
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                value={supabaseAnonKey}
                onChange={(e) => setSupabaseAnonKey(e.target.value)}
                className="w-full bg-[#070d18] text-slate-100 p-2.5 rounded-lg border border-[#1e3250] focus:border-amber-500 focus:outline-none font-mono"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                Never enter your service-role secret key in the browser. Use only the anonymous client key.
              </span>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Supabase Storage Bucket Name
              </label>
              <input
                type="text"
                value={storageBucket}
                onChange={(e) => setStorageBucket(e.target.value)}
                className="w-full bg-[#070d18] text-slate-100 p-2.5 rounded-lg border border-[#1e3250] focus:border-amber-500 focus:outline-none font-mono"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                Dedicated bucket for private document storage (e.g. dgmm-compliance-docs)
              </span>
            </div>

            {testResult && (
              <div className={`p-3 rounded-lg border text-xs flex items-start gap-2 ${
                testResult.success 
                  ? 'bg-emerald-950/60 border-emerald-800 text-emerald-200' 
                  : 'bg-rose-950/60 border-rose-800 text-rose-200'
              }`}>
                {testResult.success ? <Check className="w-4 h-4 mt-0.5 text-emerald-400" /> : <AlertTriangle className="w-4 h-4 mt-0.5 text-rose-400" />}
                <div>{testResult.message}</div>
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                disabled={isTesting}
                onClick={handleTestConnection}
                className="px-4 py-2 bg-[#142642] hover:bg-[#1c365d] border border-[#22416f] text-slate-200 font-semibold rounded-lg shadow transition-colors flex items-center gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                <span>{isTesting ? 'Testing...' : 'Test Cloud Connection'}</span>
              </button>

              <button
                type="button"
                onClick={handleSaveCloudSettings}
                className="px-5 py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-bold rounded-lg shadow transition-colors"
              >
                Save Cloud Configuration
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: POSTGRESQL SCHEMA */}
      {activeTab === 'schema' && (
        <div className="bg-[#0e192c] border border-[#1e3250] rounded-xl p-6 shadow space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1b2d49]">
            <div>
              <h3 className="text-base font-bold text-slate-100 font-serif flex items-center gap-2">
                <FileCode className="w-4 h-4 text-emerald-400" />
                <span>PostgreSQL Relational Schema Definition</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Complete DDL script implementing all 12 core tables, relational foreign keys, RLS policies, and master divisions.
              </p>
            </div>

            <button
              onClick={handleCopySchema}
              className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-slate-950 text-xs font-bold rounded-lg shadow transition-colors flex items-center gap-1.5 self-start sm:self-auto"
            >
              {copiedSchema ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSchema ? 'SQL Copied!' : 'Copy SQL Schema'}</span>
            </button>
          </div>

          <div className="p-3 bg-[#08101c] rounded-lg border border-[#1b2f4e] text-xs text-slate-300 space-y-1">
            <span className="font-bold text-amber-300">How to set up your Supabase Database:</span>
            <ol className="list-decimal list-inside space-y-0.5 text-slate-400 text-[11px]">
              <li>Log in to your <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-amber-400 underline">Supabase Dashboard</a> and open your project.</li>
              <li>Navigate to the <strong>SQL Editor</strong> tab on the left navigation menu.</li>
              <li>Click <strong>New Query</strong>, paste the copied SQL schema below, and click <strong>Run</strong>.</li>
              <li>Under Storage, create a bucket named <code className="text-amber-300 font-mono">dgmm-compliance-docs</code>.</li>
            </ol>
          </div>

          <pre className="bg-[#060b14] text-slate-300 p-4 rounded-xl border border-[#152338] text-[11px] font-mono overflow-x-auto max-h-[500px] leading-relaxed">
            {SUPABASE_SQL_SCHEMA}
          </pre>
        </div>
      )}

      {/* TAB 3: USER ROLES */}
      {activeTab === 'roles' && (
        <div className="bg-[#0e192c] border border-[#1e3250] rounded-xl p-6 shadow space-y-4">
          <div className="pb-3 border-b border-[#1b2d49]">
            <h3 className="text-base font-bold text-slate-100 font-serif flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-blue-400" />
              <span>User Access Control & Role Matrix</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Role permissions as specified in Section 13: Administrator (DG), Monitoring / DG Office, and Division / Field Office User.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            {/* Administrator */}
            <div className="p-4 rounded-xl bg-[#091220] border border-[#1c2e4b] space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-100 font-mono text-sm">Administrator</span>
                <span className="text-[10px] bg-amber-950 text-amber-300 border border-amber-800 px-2 py-0.5 rounded font-bold">
                  Full Authority
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Director General & Secretariat leadership.
              </p>
              <ul className="space-y-1 text-slate-300 text-[11px]">
                <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-emerald-400" /> Full access to all modules</li>
                <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-emerald-400" /> Create & chair meetings</li>
                <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-emerald-400" /> Issue official DG directions</li>
                <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-emerald-400" /> Review & accept compliance</li>
                <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-emerald-400" /> Mark directions completed</li>
                <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-emerald-400" /> Export management reports</li>
              </ul>
            </div>

            {/* Monitoring / DG Office */}
            <div className="p-4 rounded-xl bg-[#091220] border border-[#1c2e4b] space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-100 font-mono text-sm">Monitoring / DG Office</span>
                <span className="text-[10px] bg-blue-950 text-blue-300 border border-blue-800 px-2 py-0.5 rounded font-bold">
                  Operational
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Staff Officer to DG, Monitoring & Evaluation Cells.
              </p>
              <ul className="space-y-1 text-slate-300 text-[11px]">
                <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-emerald-400" /> Create meeting records</li>
                <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-emerald-400" /> Upload briefs & supporting data</li>
                <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-emerald-400" /> Record DG directions</li>
                <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-emerald-400" /> Monitor compliance timelines</li>
                <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-emerald-400" /> Revise deadlines with reason</li>
                <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-emerald-400" /> Dispatch reminders</li>
              </ul>
            </div>

            {/* Division / Field Office User */}
            <div className="p-4 rounded-xl bg-[#091220] border border-[#1c2e4b] space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-100 font-mono text-sm">Division / Field Officer</span>
                <span className="text-[10px] bg-purple-950 text-purple-300 border border-purple-800 px-2 py-0.5 rounded font-bold">
                  Field Action
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Divisional Directors & Regional Mining Officers.
              </p>
              <ul className="space-y-1 text-slate-300 text-[11px]">
                <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-emerald-400" /> View assigned directives</li>
                <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-emerald-400" /> Submit progress updates</li>
                <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-emerald-400" /> Upload compliance files & evidence</li>
                <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-emerald-400" /> View own submission history</li>
                <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-emerald-400" /> Download briefs & templates</li>
              </ul>
            </div>
          </div>

          {/* Active User Switcher */}
          <div className="pt-4 border-t border-[#1b2d49]">
            <h4 className="text-xs font-bold text-slate-200 mb-2 font-mono">
              Simulate Active Operator Identity
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {SAMPLE_USERS.map(u => (
                <button
                  key={u.id}
                  onClick={() => setCurrentUser(u)}
                  className={`p-2.5 rounded-lg border text-left transition-colors text-xs ${
                    currentUser.id === u.id
                      ? 'bg-amber-950/70 border-amber-600 text-amber-200'
                      : 'bg-[#091220] border-[#1c2e4b] hover:bg-[#122036] text-slate-300'
                  }`}
                >
                  <div className="font-bold text-slate-100">{u.name}</div>
                  <div className="text-[10px] text-slate-400">{u.designation}</div>
                  <div className="text-[10px] font-mono text-amber-400 mt-0.5">{u.role}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: AUDIT TRAIL */}
      {activeTab === 'audit' && (
        <div className="bg-[#0e192c] border border-[#1e3250] rounded-xl p-6 shadow space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#1b2d49]">
            <div>
              <h3 className="text-base font-bold text-slate-100 font-serif flex items-center gap-2">
                <Activity className="w-4 h-4 text-amber-400" />
                <span>Immutable Activity Log & Audit Trail</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Mandatory audit history recording user, timestamp, prior value, and remarks for all executive transactions.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#091220] border-b border-[#1c2e4d] text-slate-400 font-semibold text-[11px] uppercase tracking-wider font-mono">
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3">Action</th>
                  <th className="py-2.5 px-3">Target Entity</th>
                  <th className="py-2.5 px-3">Officer</th>
                  <th className="py-2.5 px-3">Remarks / Value Transition</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#15233a]">
                {activityLogs.map(log => (
                  <tr key={log.id} className="hover:bg-[#13223b] transition-colors">
                    <td className="py-2.5 px-3 font-mono text-slate-400 text-[11px] whitespace-nowrap">
                      {log.timestamp.includes('T') ? log.timestamp.replace('T', ' ').slice(0, 19) : log.timestamp}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-amber-400 whitespace-nowrap">
                      {log.action}
                    </td>
                    <td className="py-2.5 px-3 text-slate-200 font-medium max-w-xs truncate">
                      {log.entity_title}
                    </td>
                    <td className="py-2.5 px-3 text-slate-300 whitespace-nowrap">
                      {log.user_name} <span className="text-[10px] text-slate-500 font-mono">({log.user_role})</span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-300 text-[11px]">
                      {log.remarks && <span>{log.remarks}</span>}
                      {log.previous_value && log.new_value && (
                        <span className="block text-[10px] text-amber-300 font-mono">
                          Changed: {log.previous_value} &rarr; {log.new_value}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: DATA MANAGEMENT & DEMO CONTROL */}
      {activeTab === 'data' && (
        <div className="bg-[#0e192c] border border-[#1e3250] rounded-xl p-6 shadow space-y-6">
          <div className="pb-3 border-b border-[#1b2d49]">
            <h3 className="text-base font-bold text-slate-100 font-serif flex items-center gap-2">
              <Server className="w-4 h-4 text-purple-400" />
              <span>Data Management & Backup Utilities</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Control demo placeholder data, export JSON cloud backups, or import verified departmental records.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Demo Data Control */}
            <div className="p-4 rounded-xl bg-[#091220] border border-[#1c2e4b] space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-100 text-sm">Demo Data Control</span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                  isDemoActive ? 'bg-amber-950 text-amber-300 border border-amber-800' : 'bg-slate-800 text-slate-300'
                }`}>
                  {isDemoActive ? 'Demo Data Active' : 'Clean State'}
                </span>
              </div>
              <p className="text-slate-400 text-[11px]">
                Per prompt instructions, you can easily remove all placeholder records before production, or reset back to realistic demonstration records at any time.
              </p>
              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={clearDatabase}
                  className="px-3.5 py-1.5 bg-rose-950 hover:bg-rose-900 border border-rose-700 text-rose-200 rounded-lg font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                  <span>Wipe All Records (Clean Database)</span>
                </button>
                <button
                  onClick={resetToDemoData}
                  className="px-3.5 py-1.5 bg-[#14233c] hover:bg-[#1a3055] border border-[#213b63] text-amber-300 rounded-lg font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Restore Demo Dataset</span>
                </button>
              </div>
            </div>

            {/* Backup & Restore */}
            <div className="p-4 rounded-xl bg-[#091220] border border-[#1c2e4b] space-y-3">
              <span className="font-bold text-slate-100 text-sm block">Backup & Cloud Portability</span>
              <p className="text-slate-400 text-[11px]">
                Export complete database state as an authenticated JSON package for cloud archiving or migration.
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <button
                  onClick={handleDownloadBackup}
                  className="px-3.5 py-1.5 bg-[#14233c] hover:bg-[#1a3055] border border-[#213b63] text-slate-200 rounded-lg font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Download Backup (.json)</span>
                </button>

                <label className="cursor-pointer px-3.5 py-1.5 bg-[#14233c] hover:bg-[#1a3055] border border-[#213b63] text-slate-200 rounded-lg font-semibold flex items-center gap-1.5 transition-colors">
                  <Upload className="w-3.5 h-3.5 text-amber-400" />
                  <span>Restore from JSON</span>
                  <input type="file" accept=".json" className="hidden" onChange={handleImportFile} />
                </label>
              </div>
              {importStatus && (
                <div className="text-[11px] text-amber-300 font-mono pt-1">
                  {importStatus}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
