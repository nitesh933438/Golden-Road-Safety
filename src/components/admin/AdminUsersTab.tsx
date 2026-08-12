import React, { useState, useEffect } from "react";
import { Search, UserCog, Ban, Activity, Shield, Check, Filter, ShieldAlert, BookOpen, User as UserIcon, Loader2 } from "lucide-react";
import { useAuth, AppRole } from "../../context/AuthContext";
import { db } from "../../lib/firebase";
import { collection, query, getDocs, limit } from "firebase/firestore";

interface AdminUserItem {
  id: string;
  uid: string;
  name: string;
  email: string;
  role: AppRole;
  status: string;
  joined: string;
}

export function AdminUsersTab() {
  const { setUserRole, currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [successMsg, setSuccessMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userList, setUserList] = useState<AdminUserItem[]>([]);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Fetch users from Firestore
  useEffect(() => {
    let active = true;
    const fetchUsers = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const q = query(
          collection(db, "users"),
          limit(100) // safety limit to prevent full database scanning
        );
        const snapshot = await getDocs(q);
        if (!active) return;

        const fetched: AdminUserItem[] = [];
        snapshot.docs.forEach((docSnap, index) => {
          const data = docSnap.data();
          fetched.push({
            id: `USR-${index + 900}`,
            uid: docSnap.id,
            name: data.name || "Anonymous Samaritan",
            email: data.email || "No email available",
            role: (data.role || "user") as AppRole,
            status: data.isOnline ? "active" : "standby",
            joined: data.createdAt ? new Date(data.createdAt.seconds * 1000).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric"
            }) : "N/A"
          });
        });

        setUserList(fetched);
      } catch (err: any) {
        console.error("Failed to load users for admin dashboard:", err);
        setError("Missing authorized permissions or network error.");
      } finally {
        if (active) setIsLoading(false);
      }
    };

    fetchUsers();
    return () => {
      active = false;
    };
  }, []);

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

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  const filteredUsers = userList.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                          user.email.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                          user.id.toLowerCase().includes(debouncedSearch.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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
            <option value="citizen">Citizen</option>
            <option value="user">User (Legacy)</option>
            <option value="volunteer">Volunteer</option>
            <option value="police">Police</option>
            <option value="hospital">Hospital</option>
            <option value="dispatcher">Dispatcher</option>
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
              {paginatedUsers.map((user) => (
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
                      {user.role === "user" && <UserIcon className="w-3.5 h-3.5 text-emerald-500" />}
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
                        disabled={user.uid === currentUser?.uid}
                        onChange={(e) => handleRoleChange(user.uid, user.name, e.target.value as AppRole)}
                        className="px-2.5 py-1.5 rounded-xl bg-surface-100 dark:bg-surface-700 text-xs font-bold border border-surface-200 dark:border-surface-600 text-surface-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50"
                      >
                        <option value="citizen">CITIZEN</option>
                        <option value="user">USER (Legacy)</option>
                        <option value="trainer">TRAINER</option>
                        <option value="admin">ADMIN</option>
                        <option value="volunteer">VOLUNTEER</option>
                        <option value="police">POLICE</option>
                        <option value="hospital">HOSPITAL</option>
                        <option value="dispatcher">DISPATCHER</option>
                      </select>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="px-6 py-4 bg-surface-50 dark:bg-surface-900/50 border-t border-surface-200 dark:border-surface-700 flex items-center justify-between">
            <span className="text-xs text-surface-500">
              Showing {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, filteredUsers.length)} of {filteredUsers.length}
            </span>
            <div className="flex gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => {
                  setCurrentPage((prev) => Math.max(prev - 1, 1));
                }}
                className="px-3 py-1.5 bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-lg text-xs font-bold disabled:opacity-50 hover:bg-surface-50 dark:hover:bg-surface-700"
              >
                Previous
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => {
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages));
                }}
                className="px-3 py-1.5 bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-lg text-xs font-bold disabled:opacity-50 hover:bg-surface-50 dark:hover:bg-surface-700"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
