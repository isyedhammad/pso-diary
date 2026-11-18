import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { testCloudConnection, SUPABASE_SQL_SCHEMA } from '../services/supabaseClient';
import { 
  Database, 
  Copy, 
  Check, 
  RefreshCw, 
  Trash2, 
  Download, 
  Upload, 
  FileCode, 
  Sun,
  Moon,
  Server,
  AlertTriangle
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { 
    theme,
    toggleTheme,
    cloudConfig, 
    updateCloudSettings, 
    clearDatabase, 
    exportDatabase, 
    importDatabase
  } = useApp();

  const [activeTab, setActiveTab] = useState<'cloud' | 'schema' | 'data'>('cloud');

  // Cloud Config state
  const [supabaseUrl, setSupabaseUrl] = useState(cloudConfig.supabaseUrl || '');
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(cloudConfig.supabaseAnonKey || '');
  const [storageBucket, setStorageBucket] = useState(cloudConfig.storageBucket || 'dgmm-compliance-docs');
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [copiedSchema, setCopiedSchema] = useState(false);
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
    link.setAttribute('download', `DGMM_Portal_Backup_${new Date().toISOString().split('T')[0]}.json`);
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
      <div className="pb-2 border-b border-slate-200 dark:border-[#1b2d49] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 font-serif">
            Portal Configuration &amp; Settings
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Cloud database integration, visual appearance theme, and data backup controls.
          </p>
        </div>

        {/* Theme Toggle Pill */}
        <button
          onClick={toggleTheme}
          className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-[#22395d] bg-white dark:bg-[#111e33] text-slate-800 dark:text-amber-300 hover:bg-slate-50 dark:hover:bg-[#182b49] transition-colors flex items-center gap-2 text-xs font-semibold shadow-sm"
        >
          {theme === 'dark' ? (
            <>
              <Sun className="w-4 h-4 text-amber-400" />
              <span>Theme: Dark Mode (Click for Light)</span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 text-slate-700" />
              <span>Theme: Light Mode (Click for Dark)</span>
            </>
          )}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto p-1.5 bg-white dark:bg-[#0e192c] border border-slate-200 dark:border-[#1e3250] rounded-xl text-xs font-medium shadow-sm">
        {[
          { id: 'cloud', label: 'Cloud Database (Supabase)', icon: Database },
          { id: 'schema', label: 'PostgreSQL SQL Schema', icon: FileCode },
          { id: 'data', label: 'Data Management & Backup', icon: Server },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-2 rounded-lg flex items-center gap-2 whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-emerald-100 dark:bg-amber-600/20 text-emerald-900 dark:text-amber-300 border border-emerald-300 dark:border-amber-600/50 font-bold shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#132238]'
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
        <div className="bg-white dark:bg-[#0e192c] border border-slate-200 dark:border-[#1e3250] rounded-xl p-6 shadow-sm space-y-5">
          <div className="flex items-start justify-between gap-4 pb-3 border-b border-slate-200 dark:border-[#1b2d49]">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 font-serif flex items-center gap-2">
                <Database className="w-4 h-4 text-emerald-600 dark:text-amber-400" />
                <span>Supabase PostgreSQL &amp; Cloud Storage Integration</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Connect the portal to your private Supabase project. All meetings, directions, and documents will synchronize to the cloud.
              </p>
            </div>

            <div className={`text-xs px-2.5 py-1 rounded-md border font-mono font-semibold flex items-center gap-1.5 ${
              cloudConfig.supabaseUrl 
                ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800' 
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-700'
            }`}>
              <span className={`w-2 h-2 rounded-full ${cloudConfig.supabaseUrl ? 'bg-emerald-500' : 'bg-slate-400'}`} />
              <span>{cloudConfig.supabaseUrl ? 'Cloud Connected' : 'Local Storage Mode'}</span>
            </div>
          </div>

          <div className="space-y-4 max-w-2xl text-xs">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                Supabase Project URL
              </label>
              <input
                type="text"
                placeholder="https://xyzcompany.supabase.co"
                value={supabaseUrl}
                onChange={(e) => setSupabaseUrl(e.target.value)}
                className="w-full bg-slate-50 dark:bg-[#070d18] text-slate-900 dark:text-slate-100 p-2.5 rounded-lg border border-slate-300 dark:border-[#1e3250] font-mono focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                Supabase Anon API Key
              </label>
              <input
                type="password"
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                value={supabaseAnonKey}
                onChange={(e) => setSupabaseAnonKey(e.target.value)}
                className="w-full bg-slate-50 dark:bg-[#070d18] text-slate-900 dark:text-slate-100 p-2.5 rounded-lg border border-slate-300 dark:border-[#1e3250] font-mono focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                Storage Bucket Name
              </label>
              <input
                type="text"
                value={storageBucket}
                onChange={(e) => setStorageBucket(e.target.value)}
                className="w-full bg-slate-50 dark:bg-[#070d18] text-slate-900 dark:text-slate-100 p-2.5 rounded-lg border border-slate-300 dark:border-[#1e3250] font-mono focus:outline-none"
              />
            </div>

            {testResult && (
              <div className={`p-3 rounded-lg border text-xs flex items-start gap-2 ${
                testResult.success 
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200' 
                  : 'bg-rose-50 dark:bg-rose-950/60 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200'
              }`}>
                {testResult.success ? <Check className="w-4 h-4 mt-0.5 text-emerald-600" /> : <AlertTriangle className="w-4 h-4 mt-0.5 text-rose-600" />}
                <div>{testResult.message}</div>
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                disabled={isTesting}
                onClick={handleTestConnection}
                className="px-4 py-2 bg-slate-100 dark:bg-[#142642] hover:bg-slate-200 dark:hover:bg-[#1c365d] border border-slate-300 dark:border-[#22416f] text-slate-700 dark:text-slate-200 font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                <span>{isTesting ? 'Testing...' : 'Test Connection'}</span>
              </button>

              <button
                type="button"
                onClick={handleSaveCloudSettings}
                className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 dark:bg-amber-600 dark:hover:bg-amber-500 text-white dark:text-slate-950 font-bold rounded-lg shadow-sm transition-colors"
              >
                Save Cloud Configuration
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SQL SCHEMA */}
      {activeTab === 'schema' && (
        <div className="bg-white dark:bg-[#0e192c] border border-slate-200 dark:border-[#1e3250] rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-[#1b2d49]">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 font-serif flex items-center gap-2">
                <FileCode className="w-4 h-4 text-emerald-600 dark:text-amber-400" />
                <span>PostgreSQL Relational Schema</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                DDL script for Supabase SQL Editor.
              </p>
            </div>

            <button
              onClick={handleCopySchema}
              className="px-3.5 py-1.5 bg-emerald-700 dark:bg-amber-600 text-white dark:text-slate-950 text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
            >
              {copiedSchema ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSchema ? 'SQL Copied!' : 'Copy SQL Schema'}</span>
            </button>
          </div>

          <pre className="bg-slate-900 text-slate-100 p-4 rounded-xl text-[11px] font-mono overflow-x-auto max-h-[450px] leading-relaxed">
            {SUPABASE_SQL_SCHEMA}
          </pre>
        </div>
      )}

      {/* TAB 3: DATA MANAGEMENT & BACKUP */}
      {activeTab === 'data' && (
        <div className="bg-white dark:bg-[#0e192c] border border-slate-200 dark:border-[#1e3250] rounded-xl p-6 shadow-sm space-y-6">
          <div className="pb-3 border-b border-slate-200 dark:border-[#1b2d49]">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 font-serif flex items-center gap-2">
              <Server className="w-4 h-4 text-purple-600" />
              <span>Data Management &amp; Backup Utilities</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Clear all records or export a portable JSON backup.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#091220] border border-slate-200 dark:border-[#1c2e4b] space-y-3">
              <span className="font-bold text-slate-800 dark:text-slate-100 text-sm block">Reset Database</span>
              <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                Wipe all records to maintain a clean database for official records.
              </p>
              <button
                onClick={clearDatabase}
                className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Wipe All Records (Clean Slate)</span>
              </button>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#091220] border border-slate-200 dark:border-[#1c2e4b] space-y-3">
              <span className="font-bold text-slate-800 dark:text-slate-100 text-sm block">JSON Backup &amp; Restore</span>
              <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                Download your full portal database or restore from a previously saved JSON file.
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleDownloadBackup}
                  className="px-3.5 py-1.5 bg-slate-200 dark:bg-[#14233c] hover:bg-slate-300 dark:hover:bg-[#1a3055] text-slate-800 dark:text-slate-200 rounded-lg font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Download Backup</span>
                </button>

                <label className="cursor-pointer px-3.5 py-1.5 bg-slate-200 dark:bg-[#14233c] hover:bg-slate-300 dark:hover:bg-[#1a3055] text-slate-800 dark:text-slate-200 rounded-lg font-semibold flex items-center gap-1.5 transition-colors">
                  <Upload className="w-3.5 h-3.5 text-amber-600" />
                  <span>Restore JSON</span>
                  <input type="file" accept=".json" className="hidden" onChange={handleImportFile} />
                </label>
              </div>
              {importStatus && (
                <div className="text-[11px] text-emerald-700 dark:text-amber-300 font-mono pt-1">
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
