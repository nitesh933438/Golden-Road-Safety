import React, { useState } from "react";
import { Search, UserCog, Ban, Activity, Shield } from "lucide-react";

export function AdminUsersTab() {
  const users = [
    { id: "USR-992", name: "John Doe", email: "john@example.com", role: "Citizen", status: "active", joined: "Jan 12, 2026" },
    { id: "USR-991", name: "Nitesh Admin", email: "nitesh933438@gmail.com", role: "Super Admin", status: "active", joined: "Jan 10, 2026" },
    { id: "USR-990", name: "Sarah Jenkins", email: "sarah@example.com", role: "Volunteer", status: "active", joined: "Dec 05, 2025" },
    { id: "USR-989", name: "Bad Actor", email: "spam@example.com", role: "Citizen", status: "disabled", joined: "Feb 01, 2026" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <h2 className="text-2xl font-bold">User Directory</h2>
      </div>

      <div className="relative w-full max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
        <input 
          type="text" 
          placeholder="Search by name, email, or ID..." 
          className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-sm shadow-sm"
        />
      </div>

      <div className="bg-white dark:bg-surface-800 rounded-2xl border border-surface-200 dark:border-surface-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-50 dark:bg-surface-900/50 border-b border-surface-200 dark:border-surface-700">
                <th className="py-4 px-6 font-bold text-xs uppercase text-surface-500 tracking-wider">User Info</th>
                <th className="py-4 px-6 font-bold text-xs uppercase text-surface-500 tracking-wider">Role</th>
                <th className="py-4 px-6 font-bold text-xs uppercase text-surface-500 tracking-wider">Status</th>
                <th className="py-4 px-6 font-bold text-xs uppercase text-surface-500 tracking-wider">Joined</th>
                <th className="py-4 px-6 font-bold text-xs uppercase text-surface-500 tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100 dark:divide-surface-700/50">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors">
                  <td className="py-4 px-6">
                    <div className="font-bold text-sm text-surface-900 dark:text-white">{user.name}</div>
                    <div className="text-xs text-surface-500">{user.email}</div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-sm font-medium flex items-center gap-1.5">
                      {user.role === 'Super Admin' && <Shield className="w-3.5 h-3.5 text-red-500" />}
                      {user.role}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${
                      user.status === 'active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-surface-200 text-surface-700 dark:bg-surface-700 dark:text-surface-300'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-sm text-surface-600 dark:text-surface-400">{user.joined}</div>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex justify-end gap-2">
                      <button className="p-1.5 text-surface-400 hover:text-blue-500 transition-colors" title="Change Role">
                        <UserCog className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 text-surface-400 hover:text-emerald-500 transition-colors" title="View Activity">
                        <Activity className="w-4 h-4" />
                      </button>
                      {user.status === 'active' && user.role !== 'Super Admin' && (
                        <button className="p-1.5 text-surface-400 hover:text-red-500 transition-colors" title="Disable Account">
                          <Ban className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
