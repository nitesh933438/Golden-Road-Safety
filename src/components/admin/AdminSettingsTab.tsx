import React from "react";
import { Settings2, Download, ShieldAlert, Phone, Key, Globe, FileText, Database } from "lucide-react";

export function AdminSettingsTab() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-2xl font-bold">System Settings</h2>
        <p className="text-surface-500 text-sm">Configure core application behaviors and export data.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Core Settings */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold flex items-center gap-2 mb-4">
              <Settings2 className="w-5 h-5 text-surface-400" /> Platform Configuration
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-surface-500 uppercase tracking-wider">Platform Name</label>
                <input type="text" defaultValue="GoldenGuard Enterprise" className="w-full px-4 py-2.5 bg-surface-50 dark:bg-surface-900/50 border border-surface-200 dark:border-surface-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-sm" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-surface-500 uppercase tracking-wider">Default Language</label>
                <select className="w-full px-4 py-2.5 bg-surface-50 dark:bg-surface-900/50 border border-surface-200 dark:border-surface-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-sm appearance-none">
                  <option>English</option>
                  <option>Spanish</option>
                  <option>Hindi</option>
                </select>
              </div>
            </div>
            <button className="mt-6 w-full py-2.5 bg-surface-900 text-white dark:bg-white dark:text-surface-900 rounded-xl font-bold text-sm hover:opacity-90 transition-opacity">
              Save Configuration
            </button>
          </div>

          <div className="bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold flex items-center gap-2 mb-4">
              <Key className="w-5 h-5 text-surface-400" /> API Keys & Integrations
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-surface-500 uppercase tracking-wider">Google Maps API Key</label>
                <input type="password" defaultValue="************************" className="w-full px-4 py-2.5 bg-surface-50 dark:bg-surface-900/50 border border-surface-200 dark:border-surface-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-sm" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-surface-500 uppercase tracking-wider">SMS Gateway Token (Twilio)</label>
                <input type="password" defaultValue="************************" className="w-full px-4 py-2.5 bg-surface-50 dark:bg-surface-900/50 border border-surface-200 dark:border-surface-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-sm" />
              </div>
            </div>
          </div>
        </div>

        {/* Action Blocks */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold flex items-center gap-2 mb-4">
              <Phone className="w-5 h-5 text-surface-400" /> Regional Emergency Numbers
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <input type="text" defaultValue="Medical" className="w-1/3 px-3 py-2 bg-surface-50 dark:bg-surface-900/50 border border-surface-200 dark:border-surface-700 rounded-lg text-sm outline-none" />
                <input type="text" defaultValue="102" className="flex-1 px-3 py-2 bg-surface-50 dark:bg-surface-900/50 border border-surface-200 dark:border-surface-700 rounded-lg text-sm outline-none" />
              </div>
              <div className="flex items-center gap-2">
                <input type="text" defaultValue="Police" className="w-1/3 px-3 py-2 bg-surface-50 dark:bg-surface-900/50 border border-surface-200 dark:border-surface-700 rounded-lg text-sm outline-none" />
                <input type="text" defaultValue="100" className="flex-1 px-3 py-2 bg-surface-50 dark:bg-surface-900/50 border border-surface-200 dark:border-surface-700 rounded-lg text-sm outline-none" />
              </div>
              <div className="flex items-center gap-2">
                <input type="text" defaultValue="Fire" className="w-1/3 px-3 py-2 bg-surface-50 dark:bg-surface-900/50 border border-surface-200 dark:border-surface-700 rounded-lg text-sm outline-none" />
                <input type="text" defaultValue="101" className="flex-1 px-3 py-2 bg-surface-50 dark:bg-surface-900/50 border border-surface-200 dark:border-surface-700 rounded-lg text-sm outline-none" />
              </div>
              <button className="text-sm font-bold text-primary-600 dark:text-primary-400">
                + Add Number
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold flex items-center gap-2 mb-4">
              <Database className="w-5 h-5 text-surface-400" /> Data Export
            </h3>
            <p className="text-sm text-surface-500 mb-4">Export system data, audit logs, and analytics for compliance.</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button className="flex flex-col items-center justify-center gap-2 py-4 rounded-xl border border-surface-200 dark:border-surface-700 hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/10 transition-all text-surface-600 dark:text-surface-400 hover:text-primary-600">
                <FileText className="w-6 h-6" />
                <span className="text-xs font-bold uppercase tracking-wider">PDF Report</span>
              </button>
              <button className="flex flex-col items-center justify-center gap-2 py-4 rounded-xl border border-surface-200 dark:border-surface-700 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 transition-all text-surface-600 dark:text-surface-400 hover:text-emerald-600">
                <Download className="w-6 h-6" />
                <span className="text-xs font-bold uppercase tracking-wider">Excel Data</span>
              </button>
              <button className="flex flex-col items-center justify-center gap-2 py-4 rounded-xl border border-surface-200 dark:border-surface-700 hover:border-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/10 transition-all text-surface-600 dark:text-surface-400 hover:text-amber-600">
                <Database className="w-6 h-6" />
                <span className="text-xs font-bold uppercase tracking-wider">Raw CSV</span>
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
