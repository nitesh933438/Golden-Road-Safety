import React, { useState, useEffect } from "react";
import { AlertTriangle, MapPin, CheckCircle2, XCircle, ImageIcon, Search, Filter } from "lucide-react";
import { db } from "../../lib/firebase";
import { collection, query, onSnapshot, doc, updateDoc, serverTimestamp, limit } from "firebase/firestore";

interface RealHazard {
  id: string;
  type: string;
  location: string;
  reporter: string;
  time: string;
  status: "pending" | "active" | "resolved" | "rejected";
  photoURL?: string;
  description?: string;
}

export function AdminHazardsTab() {
  const [filter, setFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [hazards, setHazards] = useState<RealHazard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const q = query(
      collection(db, "hazards"),
      limit(100)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched: RealHazard[] = [];
      snapshot.docs.forEach((docSnap) => {
        const data = docSnap.data();
        let timeStr = "Recently";
        if (data.timestamp?.seconds) {
          timeStr = new Date(data.timestamp.seconds * 1000).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
          });
        }

        fetched.push({
          id: docSnap.id,
          type: data.type || data.title || "Road Hazard",
          location: data.locationName || data.address || (data.latitude ? `GPS (${data.latitude.toFixed(3)}, ${data.longitude.toFixed(3)})` : "Unspecified location"),
          reporter: data.userName || data.createdBy || "Anonymous Citizen",
          time: timeStr,
          status: (data.status || "pending").toLowerCase() as any,
          photoURL: data.photoURL || data.image,
          description: data.description
        });
      });

      setHazards(fetched);
      setIsLoading(false);
    }, (err) => {
      console.warn("Firestore hazards query warning:", err);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const updateStatus = async (id: string, newStatus: "active" | "resolved" | "rejected") => {
    try {
      await updateDoc(doc(db, "hazards", id), {
        status: newStatus,
        updatedAt: serverTimestamp()
      });
    } catch (err) {
      console.error("Failed to update hazard status:", err);
    }
  };

  const filteredHazards = hazards.filter(h => {
    const matchesFilter = filter === "all" || h.status === filter;
    const matchesSearch = h.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          h.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          h.reporter.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          h.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const totalPages = Math.ceil(filteredHazards.length / itemsPerPage) || 1;
  const paginatedHazards = filteredHazards.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getStatusColor = (status: string) => {
    if (status === "pending") return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
    if (status === "active") return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
    if (status === "resolved") return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
    return "bg-surface-200 text-surface-600 dark:bg-surface-700 dark:text-surface-300";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-surface-900 dark:text-white tracking-tight">Hazard & Road Report Moderation</h2>
          <p className="text-xs text-surface-500">Real-time crowdsourced road safety issues verified by administrators.</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search reports..."
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-amber-500 shadow-sm"
            />
          </div>

          <div className="bg-surface-100 dark:bg-surface-700 p-1 rounded-xl flex">
            {["all", "pending", "active", "resolved"].map(f => (
              <button 
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-colors ${filter === f ? 'bg-amber-500 text-black shadow-sm' : 'text-surface-500 hover:text-surface-900 dark:hover:text-white'}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-surface-800 rounded-2xl border border-surface-200 dark:border-surface-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-50 dark:bg-surface-900/50 border-b border-surface-200 dark:border-surface-700">
                <th className="py-4 px-6 font-bold text-xs uppercase text-surface-500 tracking-wider">Hazard</th>
                <th className="py-4 px-6 font-bold text-xs uppercase text-surface-500 tracking-wider">Reporter</th>
                <th className="py-4 px-6 font-bold text-xs uppercase text-surface-500 tracking-wider">Status</th>
                <th className="py-4 px-6 font-bold text-xs uppercase text-surface-500 tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100 dark:divide-surface-700/50">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-xs text-surface-500 font-bold">
                    Loading hazards database...
                  </td>
                </tr>
              ) : paginatedHazards.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-xs text-surface-500 font-bold">
                    No road hazard reports found.
                  </td>
                </tr>
              ) : (
                paginatedHazards.map((hz) => (
                  <tr key={hz.id} className="hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-bold text-sm text-surface-900 dark:text-white flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                        {hz.type}
                      </div>
                      <div className="text-xs text-surface-500 mt-1 flex items-center gap-2">
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-blue-500" /> {hz.location}</span>
                        <span>•</span>
                        <span>{hz.time}</span>
                      </div>
                      {hz.description && (
                        <p className="text-[11px] text-surface-400 mt-1 italic">{hz.description}</p>
                      )}
                    </td>
                    <td className="py-4 px-6 text-xs font-bold text-surface-800 dark:text-surface-200">
                      {hz.reporter}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${getStatusColor(hz.status)}`}>
                        {hz.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex justify-end gap-2 items-center">
                        {hz.photoURL && (
                          <a href={hz.photoURL} target="_blank" rel="noreferrer" className="p-1.5 text-surface-400 hover:text-blue-500 transition-colors" title="View Uploaded Image">
                            <ImageIcon className="w-4 h-4" />
                          </a>
                        )}
                        
                        {hz.status === 'pending' && (
                          <>
                            <button 
                              onClick={() => updateStatus(hz.id, "active")}
                              className="px-3 py-1 bg-emerald-500 hover:bg-emerald-400 text-black rounded-lg text-xs font-bold transition-colors" 
                              title="Approve & Publish"
                            >
                              Approve
                            </button>
                            <button 
                              onClick={() => updateStatus(hz.id, "rejected")}
                              className="px-3 py-1 bg-surface-200 dark:bg-surface-700 hover:bg-red-500 hover:text-white rounded-lg text-xs font-bold transition-colors" 
                              title="Reject"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        
                        {hz.status === 'active' && (
                          <button 
                            onClick={() => updateStatus(hz.id, "resolved")}
                            className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 rounded-lg text-xs font-bold transition-colors"
                          >
                            Mark Resolved
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

        {totalPages > 1 && (
          <div className="px-6 py-4 bg-surface-50 dark:bg-surface-900/50 border-t border-surface-200 dark:border-surface-700 flex items-center justify-between">
            <span className="text-xs text-surface-500">
              Showing {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, filteredHazards.length)} of {filteredHazards.length}
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
    </div>
  );
}

