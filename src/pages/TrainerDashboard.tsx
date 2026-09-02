import React, { useState } from "react";
import { 
  BookOpen, Users, Award, Calendar, CheckCircle, Clock, Plus, 
  Search, FileText, Download, Check, X, ShieldAlert, Sparkles, UserCheck, 
  ChevronRight, BarChart, Send, Eye, FileCheck, Layers
} from "lucide-react";
import { useOutletContext } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

type TrainerTab = "sessions" | "trainees" | "curriculum" | "quizzes" | "certificates";

export function TrainerDashboard() {
  
  const { userProfile, currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<TrainerTab>("sessions");
  const [searchQuery, setSearchQuery] = useState("");

  // Real State Data for Trainer Portal (empty by default before fetch)
  const [sessions, setSessions] = useState<{id: string, title: string, date: string, time: string, location: string, traineesCount: number, maxCapacity: number, status: string, trainer: string}[]>([]);

  const [trainees, setTrainees] = useState<{id: string, name: string, email: string, phone: string, course: string, progress: number, status: string, certIssued: boolean}[]>([]);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newLocation, setNewLocation] = useState("");

  const handleCreateSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;
    setSessions([
      {
        id: `SESS-${Math.floor(100 + Math.random() * 900)}`,
        title: newTitle,
        date: newDate || "2026-02-25",
        time: "10:00 AM - 01:00 PM",
        location: newLocation || "GoldenGuard Training Center",
        traineesCount: 0,
        maxCapacity: 40,
        status: "Upcoming",
        trainer: userProfile?.name || "Senior Trainer"
      },
      ...sessions
    ]);
    setNewTitle("");
    setNewDate("");
    setNewLocation("");
    setShowCreateModal(false);
  };

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-6 animate-in fade-in duration-500">
      
      {/* Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-700 via-indigo-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-blue-500/20">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Official Trainer Portal
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-extrabold uppercase">
                Role: TRAINER
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
              Lifesaver Academy & Training Control
            </h1>
            <p className="text-blue-100 max-w-2xl text-xs sm:text-sm leading-relaxed">
              Manage road safety training sessions, verify trainee CPR certifications, assess Samaritan preparedness, and issue accredited Golden Hour badges.
            </p>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="self-start md:self-center px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold text-xs sm:text-sm flex items-center gap-2 shadow-lg transition-all hover:scale-105 shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Schedule Training Session</span>
          </button>
        </div>
      </div>

      {/* Quick Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-surface-900 dark:text-white">12</div>
            <div className="text-[11px] font-bold text-surface-500 uppercase tracking-wider">Active Sessions</div>
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-surface-900 dark:text-white">1,480</div>
            <div className="text-[11px] font-bold text-surface-500 uppercase tracking-wider">Trainees Enrolled</div>
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-purple-500/10 text-purple-500">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-surface-900 dark:text-white">92%</div>
            <div className="text-[11px] font-bold text-surface-500 uppercase tracking-wider">CPR Pass Rate</div>
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-500">
            <FileCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-surface-900 dark:text-white">1,120</div>
            <div className="text-[11px] font-bold text-surface-500 uppercase tracking-wider">Certs Issued</div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex overflow-x-auto custom-scrollbar gap-2 pb-1 border-b border-surface-200 dark:border-surface-800">
        {[
          { id: "sessions", label: "Training Sessions", icon: Calendar },
          { id: "trainees", label: "Trainees & Directory", icon: Users },
          { id: "curriculum", label: "Courses & Materials", icon: BookOpen },
          { id: "quizzes", label: "Assessments & Quizzes", icon: FileText },
          { id: "certificates", label: "Certificates & Badges", icon: Award },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id as TrainerTab); setSearchQuery(""); }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? "bg-amber-500 text-black shadow-md font-extrabold"
                : "bg-surface-100 dark:bg-surface-800/80 text-surface-600 dark:text-surface-300 hover:text-white"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-white dark:bg-surface-900 rounded-3xl border border-surface-200 dark:border-surface-800 p-6 shadow-sm">
        
        {/* Tab 1: Sessions */}
        {activeTab === "sessions" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-lg font-black text-surface-900 dark:text-white">Upcoming & Completed Sessions</h2>
                <p className="text-xs text-surface-500">Schedule and monitor CPR & First Responder physical/virtual workshops.</p>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
                <input
                  type="text"
                  placeholder="Search sessions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-surface-100 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl text-xs outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sessions.filter(sess => 
                sess.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                sess.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                sess.status.toLowerCase().includes(searchQuery.toLowerCase())
              ).map((sess) => (
                <div key={sess.id} className="p-5 rounded-2xl bg-surface-50 dark:bg-surface-850 border border-surface-200 dark:border-surface-700/80 space-y-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-black text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded">
                      {sess.id}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      sess.status === "Upcoming" ? "bg-blue-500/20 text-blue-400 border border-blue-500/30" : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    }`}>
                      {sess.status}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-sm text-surface-900 dark:text-white line-clamp-1">{sess.title}</h3>
                    <p className="text-xs text-surface-500 mt-1 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-amber-500 shrink-0" /> {sess.date} | {sess.time}
                    </p>
                    <p className="text-xs text-surface-500 mt-1 flex items-center gap-1 truncate">
                      <BookOpen className="w-3.5 h-3.5 text-blue-500 shrink-0" /> {sess.location}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-surface-200 dark:border-surface-700/60 flex items-center justify-between text-xs">
                    <span className="text-surface-400 font-medium">Trainees Registered:</span>
                    <span className="font-black text-amber-400">{sess.traineesCount} / {sess.maxCapacity}</span>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button className="flex-1 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs flex items-center justify-center gap-1">
                      <UserCheck className="w-3.5 h-3.5" /> Mark Attendance
                    </button>
                    <button className="p-2 rounded-xl bg-surface-200 dark:bg-surface-700 text-surface-700 dark:text-surface-200 hover:text-white" title="View Details">
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Trainees */}
        {activeTab === "trainees" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-lg font-black text-surface-900 dark:text-white">Trainee Directory & Evaluation</h2>
                <p className="text-xs text-surface-500">Track progress, review scores, and verify CPR skill readiness.</p>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
                <input
                  type="text"
                  placeholder="Search trainees..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-surface-100 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl text-xs outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-surface-100 dark:bg-surface-800 border-b border-surface-200 dark:border-surface-700">
                    <th className="py-3 px-4 font-black uppercase text-surface-400">Trainee Info</th>
                    <th className="py-3 px-4 font-black uppercase text-surface-400">Enrolled Course</th>
                    <th className="py-3 px-4 font-black uppercase text-surface-400">Progress</th>
                    <th className="py-3 px-4 font-black uppercase text-surface-400">Status</th>
                    <th className="py-3 px-4 font-black uppercase text-surface-400 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-100 dark:divide-surface-800">
                  {trainees.filter(trn => 
                    trn.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                    trn.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    trn.course.toLowerCase().includes(searchQuery.toLowerCase())
                  ).map((trn) => (
                    <tr key={trn.id} className="hover:bg-surface-50 dark:hover:bg-surface-850">
                      <td className="py-3 px-4">
                        <div className="font-bold text-surface-900 dark:text-white">{trn.name}</div>
                        <div className="text-[11px] text-surface-500">{trn.email} | {trn.phone}</div>
                      </td>
                      <td className="py-3 px-4 font-medium text-surface-700 dark:text-surface-300">
                        {trn.course}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-surface-200 dark:bg-surface-700 rounded-full h-2 overflow-hidden">
                            <div className="bg-amber-500 h-2 rounded-full" style={{ width: `${trn.progress}%` }}></div>
                          </div>
                          <span className="font-black text-amber-500">{trn.progress}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-blue-500/20 text-blue-400">
                          {trn.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-[11px] inline-flex items-center gap-1">
                          <Award className="w-3.5 h-3.5" /> Issue Certificate
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Curriculum */}
        {activeTab === "curriculum" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-black text-surface-900 dark:text-white">Road Safety & CPR Training Curriculum</h2>
                <p className="text-xs text-surface-500">Official modules, video guides, and PDF handbooks for CPR and Golden Hour response.</p>
              </div>
              <button className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs flex items-center gap-1.5">
                <Plus className="w-4 h-4" /> Add Training Module
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-surface-50 dark:bg-surface-850 border border-surface-200 dark:border-surface-700 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-amber-500">Module 01</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-surface-200 dark:bg-surface-700 text-surface-300 font-bold">15 Mins Video</span>
                </div>
                <h3 className="font-bold text-sm text-surface-900 dark:text-white">Hands-Only CPR & 30:2 Compression Ratio</h3>
                <p className="text-xs text-surface-500">Comprehensive guide on chest compression rate (100–120 bpm), depth (2 inches), and airway obstruction handling.</p>
                <div className="flex items-center gap-2 pt-2">
                  <button className="px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 text-xs font-bold flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5" /> Download Handout
                  </button>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-surface-50 dark:bg-surface-850 border border-surface-200 dark:border-surface-700 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-amber-500">Module 02</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-surface-200 dark:bg-surface-700 text-surface-300 font-bold">20 Mins Video</span>
                </div>
                <h3 className="font-bold text-sm text-surface-900 dark:text-white">Hemorrhage Control & Pressure Bandaging</h3>
                <p className="text-xs text-surface-500">Stopping arterial bleeding on highway accidents before paramedic dispatch.</p>
                <div className="flex items-center gap-2 pt-2">
                  <button className="px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 text-xs font-bold flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5" /> Download Handout
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Quizzes */}
        {activeTab === "quizzes" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-black text-surface-900 dark:text-white">Quizzes & Skill Assessments</h2>
                <p className="text-xs text-surface-500">Create tests to evaluate trainees on CPR and Good Samaritan legal awareness.</p>
              </div>
              <button className="px-4 py-2 rounded-xl bg-amber-500 text-black font-extrabold text-xs flex items-center gap-1.5">
                <Plus className="w-4 h-4" /> Create Assessment
              </button>
            </div>

            <div className="p-5 rounded-2xl bg-surface-50 dark:bg-surface-850 border border-surface-200 dark:border-surface-700 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-surface-900 dark:text-white">Golden Hour CPR & First Aid Exam</h3>
                <p className="text-xs text-surface-500 mt-0.5">15 Questions | Passing Score: 80% | 200 Trainees Taken</p>
              </div>
              <button className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs">
                Review Submissions
              </button>
            </div>
          </div>
        )}

        {/* Tab 5: Certificates */}
        {activeTab === "certificates" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-black text-surface-900 dark:text-white">Certificates & Samaritan Badges</h2>
              <p className="text-xs text-surface-500">Issue official digital certifications signed by accredited GoldenGuard trainers.</p>
            </div>

            <div className="p-6 rounded-3xl bg-gradient-to-br from-amber-500/10 via-surface-850 to-surface-900 border border-amber-500/30 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-amber-500 text-black font-black">
                  <Award className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-black text-base text-surface-900 dark:text-white">Official Certified Good Samaritan Badge</h3>
                  <p className="text-xs text-surface-400">Verifiable on blockchain / digital wallet via QR Code.</p>
                </div>
              </div>

              <div className="flex gap-3">
                <button className="px-4 py-2.5 rounded-xl bg-amber-500 text-black font-extrabold text-xs flex items-center gap-2">
                  <Send className="w-4 h-4" /> Bulk Issue to All Passed Trainees
                </button>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Schedule Session Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleCreateSession} className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-3xl p-5 sm:p-6 max-w-md w-full max-h-[calc(100vh-2rem)] sm:max-h-[90vh] overflow-y-auto custom-scrollbar space-y-4 shadow-2xl animate-in zoom-in-95 break-words">
            <div className="flex justify-between items-center">
              <h3 className="font-black text-base text-surface-900 dark:text-white">Schedule Training Session</h3>
              <button type="button" onClick={() => setShowCreateModal(false)} className="text-surface-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-surface-400 uppercase">Session Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Level-1 CPR Workshop"
                  className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-surface-100 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-xs font-semibold outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-surface-400 uppercase">Date</label>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-surface-100 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-xs font-semibold outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-surface-400 uppercase">Venue / Location</label>
                <input
                  type="text"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  placeholder="e.g. AIIMS Trauma Center Hall B"
                  className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-surface-100 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-xs font-semibold outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 py-2.5 rounded-xl bg-surface-200 dark:bg-surface-800 text-xs font-bold">
                Cancel
              </button>
              <button type="submit" className="flex-1 py-2.5 rounded-xl bg-amber-500 text-black font-black text-xs">
                Create Session
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
