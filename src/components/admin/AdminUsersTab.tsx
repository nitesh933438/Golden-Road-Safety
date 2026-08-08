import React, { useState } from "react";
import { Search, UserCog, Ban, Activity, Shield, Check, Filter, ShieldAlert, BookOpen, User } from "lucide-react";
import { useAuth, AppRole } from "../../context/AuthContext";

export function AdminUsersTab() {
  const { setUserRole } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [successMsg, setSuccessMsg] = useState("");

  const [userList, setUserList] = useState([
    { id: "USR-992", uid: "uid_john_992", name: "John Doe", email: "john@example.com", role: "user" as AppRole, status: "active", joined: "Jan 12, 2026" },
    { id: "USR-991", uid: "uid_nitesh_991", name: "Nitesh Admin", email: "nitesh933438@gmail.com", role: "admin" as AppRole, status: "active", joined: "Jan 10, 2026" },
    { id: "USR-990", uid: "uid_sarah_990", name: "Sarah Jenkins", email: "sarah@example.com", role: "trainer" as AppRole, status: "active", joined: "Dec 05, 2025" },
    { id: "USR-989", uid: "uid_vikram_989", name: "Officer Vikram", email: "vikram@police.gov.in", role: "police" as AppRole, status: "active", joined: "Jan 18, 2026" },
    { id: "USR-988", uid: "uid_aiims_988", name: "AIIMS Dispatch Staff", email: "er@aiims.edu", role: "hospital" as AppRole, status: "active", joined: "Jan 22, 2026" },
    { id: "USR-987", uid: "uid_bad_987", name: "Suspicious User", email: "spam@example.com", role: "user" as AppRole, status: "disabled", joined: "Feb 01, 2026" },
  ]);

  const handleRoleChange = async (targetUid: string, targetName: string, newRole: AppRole) => {
    try {
      await setUserRole(targetUid, newRole);
      setUserList(prev => prev.map(u => u.uid === targetUid ? { ...u, role: newRole } : u));
      setSuccessMsg(`Updated role for ${targetName} to ${newRole.toUpperCase()}`);
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      console.error("Error updating role:", err);
    }
  };

  const filteredUsers = userList.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-surface-900 dark:text-white tracking-tight">Role-Based Access & User Directory</h2>
          <p className="text-xs text-surface-500">Manage Citizen, Trainer, Volunteer, Police, and Admin role assignments securely.</p>
        </div>

        {successMsg && (
          <div className="px-3.5 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <Check className="w-4 h-4" />
            <span>{successMsg}</span>
          </div>
        )}
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search users by name, email, or ID..." 
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none text-xs font-medium shadow-sm"
          />
        </div>

        {/* Role Filter */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-surface-400 shrink-0" />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3.5 py-2.5 bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="trainer">Trainer</option>
            <option value="user">User (Citizen)</option>
            <option value="volunteer">Volunteer</option>
            <option value="police">Police</option>
            <option value="hospital">Hospital</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-surface-800 rounded-2xl border border-surface-200 dark:border-surface-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-surface-50 dark:bg-surface-900/50 border-b border-surface-200 dark:border-surface-700">
                <th className="py-4 px-6 font-bold uppercase text-surface-500 tracking-wider">User Identity</th>
                <th className="py-4 px-6 font-bold uppercase text-surface-500 tracking-wider">Assigned Role</th>
                <th className="py-4 px-6 font-bold uppercase text-surface-500 tracking-wider">Account Status</th>
                <th className="py-4 px-6 font-bold uppercase text-surface-500 tracking-wider">Registered</th>
                <th className="py-4 px-6 font-bold uppercase text-surface-500 tracking-wider text-right">Role Management</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100 dark:divide-surface-700/50">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors">
                  <td className="py-4 px-6">
                    <div className="font-bold text-sm text-surface-900 dark:text-white flex items-center gap-1.5">
                      {user.name}
                      <span className="text-[10px] text-surface-400 font-mono">({user.id})</span>
                    </div>
                    <div className="text-xs text-surface-500">{user.email}</div>
                  </td>

                  {/* Role Badge */}
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-black uppercase tracking-wider ${
                      user.role === "admin"
                        ? "bg-red-500/20 text-red-400 border border-red-500/30"
                        : user.role === "trainer"
                        ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                        : user.role === "volunteer"
                        ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                        : user.role === "police" || user.role === "hospital"
                        ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30"
                        : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    }`}>
                      {user.role === "admin" && <Shield className="w-3.5 h-3.5 text-red-500" />}
                      {user.role === "trainer" && <BookOpen className="w-3.5 h-3.5 text-blue-500" />}
                      {user.role === "user" && <User className="w-3.5 h-3.5 text-emerald-500" />}
                      <span>{user.role}</span>
                    </span>
                  </td>

                  <td className="py-4 px-6">
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${
                      user.status === "active" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-surface-200 text-surface-700 dark:bg-surface-700 dark:text-surface-300"
                    }`}>
                      {user.status}
                    </span>
                  </td>

                  <td className="py-4 px-6">
                    <div className="text-xs text-surface-600 dark:text-surface-400">{user.joined}</div>
                  </td>

                  {/* Actions & Role Select Dropdown */}
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <select
                        value={user.role}
                        disabled={user.email === "nitesh933438@gmail.com"}
                        onChange={(e) => handleRoleChange(user.uid, user.name, e.target.value as AppRole)}
                        className="px-2.5 py-1.5 rounded-xl bg-surface-100 dark:bg-surface-700 text-xs font-bold border border-surface-200 dark:border-surface-600 text-surface-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50"
                      >
                        <option value="user">USER (Citizen)</option>
                        <option value="trainer">TRAINER</option>
                        <option value="admin">ADMIN</option>
                        <option value="volunteer">VOLUNTEER</option>
                        <option value="police">POLICE</option>
                        <option value="hospital">HOSPITAL</option>
                      </select>
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
