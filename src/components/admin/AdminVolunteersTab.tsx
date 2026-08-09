import React, { useState, useEffect } from "react";
import { Search, Filter, ShieldCheck, XCircle, AlertTriangle, MoreVertical, Eye, Loader2, Check } from "lucide-react";
import { db } from "../../lib/firebase";
import { collection, query, where, getDocs, limit, doc, updateDoc } from "firebase/firestore";

interface VolunteerItem {
  id: string;
  uid: string;
  name: string;
  status: "pending" | "approved" | "suspended" | "rejected";
  location: string;
  applied: string;
  training: string;
}

export function AdminVolunteersTab() {
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [volunteers, setVolunteers] = useState<VolunteerItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const itemsPerPage = 5;

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Fetch real volunteers from Firestore
  const fetchVolunteers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const q = query(
        collection(db, "users"),
        where("role", "==", "volunteer"),
        limit(100) // strict query limit to prevent reading entire database
      );
      const snapshot = await getDocs(q);
      const fetched: VolunteerItem[] = [];

      snapshot.docs.forEach((docSnap, index) => {
        const data = docSnap.data();
        let status: "pending" | "approved" | "suspended" | "rejected" = "pending";
        if (data.verificationStatus === "VERIFIED") {
          status = "approved";
        } else if (data.verificationStatus === "REJECTED") {
          status = "rejected";
        } else if (data.verificationStatus === "SUSPENDED") {
          status = "suspended";
        }

        fetched.push({
          id: `V-10${index + 1}`,
          uid: docSnap.id,
          name: data.name || "Volunteer Samaritan",
          status: status,
          location: data.city && data.state ? `${data.city}, ${data.state}` : data.city || "On-Duty Area",
          applied: data.createdAt ? new Date(data.createdAt.seconds * 1000).toLocaleDateString() : "Active Now",
          training: data.qualifications || "CPR, Basic First Aid"
        });
      });

      setVolunteers(fetched);
    } catch (err: any) {
      console.error("Failed to load volunteers for admin:", err);
      setError("Failed to fetch volunteer data from database.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVolunteers();
  }, []);

  // Update volunteer status in Firestore
  const handleUpdateStatus = async (uid: string, name: string, newStatus: "approved" | "suspended" | "rejected") => {
    try {
      const userRef = doc(db, "users", uid);
      let verificationStatus = "PENDING_VERIFICATION";
      if (newStatus === "approved") {
        verificationStatus = "VERIFIED";
      } else if (newStatus === "rejected") {
        verificationStatus = "REJECTED";
      } else if (newStatus === "suspended") {
        verificationStatus = "SUSPENDED";
      }

      await updateDoc(userRef, {
        verificationStatus: verificationStatus,
        isVolunteerActive: newStatus === "approved" // Active by default when approved
      });

      setVolunteers(prev => prev.map(v => v.uid === uid ? { ...v, status: newStatus } : v));
      setActionSuccess(`Successfully updated ${name} to status: ${newStatus.toUpperCase()}`);
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err) {
      console.error("Error updating volunteer status:", err);
      setError("Failed to update status. Please check Firestore security rules.");
    }
  };

  const filteredVolunteers = volunteers.filter((vol) => {
    const matchesFilter = filter === "all" || vol.status === filter;
    const matchesSearch = vol.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                          vol.location.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                          vol.id.toLowerCase().includes(debouncedSearch.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const totalPages = Math.ceil(filteredVolunteers.length / itemsPerPage);
  const paginatedVolunteers = filteredVolunteers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-surface-900 dark:text-white tracking-tight">Volunteer Management</h2>
          <p className="text-xs text-surface-500">Approve, monitor, and suspend active Good Samaritan responders securely.</p>
        </div>

        {actionSuccess && (
          <div className="px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <Check className="w-4 h-4" />
            <span>{actionSuccess}</span>
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-surface-400" />
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search volunteers by name, ID, or location..." 
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none text-xs shadow-sm font-medium"
          />
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-surface-100 dark:bg-surface-700 p-1 rounded-xl flex">
            {["all", "pending", "approved", "suspended"].map(f => (
              <button 
                key={f}
                onClick={() => { setFilter(f); setCurrentPage(1); }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-black capitalize transition-colors ${filter === f ? 'bg-white dark:bg-surface-800 shadow-sm text-surface-900 dark:text-white' : 'text-surface-500 hover:text-surface-900 dark:hover:text-white'}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
          <p className="text-xs font-bold text-surface-500">Loading verified volunteer list...</p>
        </div>
      ) : error ? (
        <div className="p-6 rounded-xl bg-red-500/10 border border-red-500/30 text-center text-xs text-red-500">
          {error}
        </div>
      ) : filteredVolunteers.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-surface-100 dark:border-surface-800 bg-surface-50/50 dark:bg-surface-900/10 space-y-2">
          <Search className="w-8 h-8 text-surface-400 mx-auto" />
          <h3 className="font-bold text-surface-700 dark:text-surface-300 text-sm">No volunteers found</h3>
          <p className="text-xs text-surface-500 max-w-sm mx-auto">
            Try adjusting your search filters or make sure the volunteer role exists in the users database.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-surface-800 rounded-2xl border border-surface-200 dark:border-surface-700 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-surface-50 dark:bg-surface-900/50 border-b border-surface-200 dark:border-surface-700">
                  <th className="py-4 px-6 font-bold text-xs uppercase text-surface-500 tracking-wider">Volunteer</th>
                  <th className="py-4 px-6 font-bold text-xs uppercase text-surface-500 tracking-wider">Status</th>
                  <th className="py-4 px-6 font-bold text-xs uppercase text-surface-500 tracking-wider">Training</th>
                  <th className="py-4 px-6 font-bold text-xs uppercase text-surface-500 tracking-wider">Applied/Joined</th>
                  <th className="py-4 px-6 font-bold text-xs uppercase text-surface-500 tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100 dark:divide-surface-700/50">
                {paginatedVolunteers.map((vol) => (
                  <tr key={vol.uid} className="hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-bold text-sm text-surface-900 dark:text-white">{vol.name}</div>
                      <div className="text-xs text-surface-500">{vol.id} • {vol.location}</div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${
                        vol.status === 'approved' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                        vol.status === 'pending' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                        vol.status === 'suspended' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                        'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {vol.status}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-xs font-semibold text-surface-700 dark:text-surface-300">{vol.training}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-xs text-surface-600 dark:text-surface-400">{vol.applied}</div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex justify-end gap-2">
                        {vol.status === 'pending' && (
                          <>
                            <button 
                              onClick={() => handleUpdateStatus(vol.uid, vol.name, "approved")}
                              className="p-1.5 text-surface-400 hover:text-emerald-500 transition-colors" 
                              title="Approve"
                            >
                              <ShieldCheck className="w-4.5 h-4.5" />
                            </button>
                            <button 
                              onClick={() => handleUpdateStatus(vol.uid, vol.name, "rejected")}
                              className="p-1.5 text-surface-400 hover:text-red-500 transition-colors" 
                              title="Reject"
                            >
                              <XCircle className="w-4.5 h-4.5" />
                            </button>
                          </>
                        )}
                        {vol.status === 'approved' && (
                          <button 
                            onClick={() => handleUpdateStatus(vol.uid, vol.name, "suspended")}
                            className="p-1.5 text-surface-400 hover:text-orange-500 transition-colors" 
                            title="Suspend"
                          >
                            <AlertTriangle className="w-4.5 h-4.5" />
                          </button>
                        )}
                        {vol.status === 'suspended' && (
                          <button 
                            onClick={() => handleUpdateStatus(vol.uid, vol.name, "approved")}
                            className="p-1.5 text-surface-400 hover:text-emerald-500 transition-colors" 
                            title="Re-Approve"
                          >
                            <ShieldCheck className="w-4.5 h-4.5" />
                          </button>
                        )}
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
                Showing {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, filteredVolunteers.length)} of {filteredVolunteers.length}
              </span>
              <div className="flex gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  className="px-3 py-1.5 bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-lg text-xs font-bold disabled:opacity-50 hover:bg-surface-50 dark:hover:bg-surface-700"
                >
                  Previous
                </button>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  className="px-3 py-1.5 bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-lg text-xs font-bold disabled:opacity-50 hover:bg-surface-50 dark:hover:bg-surface-700"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
