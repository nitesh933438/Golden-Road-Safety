import React, { useState, useEffect } from "react";
import { Trophy, Medal, Star, Award, Loader2 } from "lucide-react";
import { collection, getDocs, query, orderBy, limit, where } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useAuth } from "../../context/AuthContext";

interface VolunteerEntry {
  uid: string;
  rank: number;
  name: string;
  rescues: number;
  points: number;
  avatar: string;
}

export function Leaderboard() {
  const { userProfile } = useAuth();
  const [volunteers, setVolunteers] = useState<VolunteerEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const fetchLeaderboard = async () => {
      try {
        const usersRef = collection(db, "users");
        // Fetch all users to rank them (in a real massive app, you'd limit and index, but here we can just fetch and sort or query top users)
        // Since we want REAL data, we query all verified or volunteer/admin users, or just any user.
        const q = query(usersRef, limit(50));
        const snapshot = await getDocs(q);

        if (!active) return;

        let fetchedUsers: VolunteerEntry[] = [];
        
        snapshot.forEach((docSnap) => {
          const d = docSnap.data();
          fetchedUsers.push({
            uid: d.uid || docSnap.id,
            rank: 0,
            name: d.name || "Unknown Citizen",
            rescues: d.rescues || 0,
            points: d.points || 0,
            avatar: d.name ? d.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase() : "CM",
          });
        });

        // Sort by points, then rescues
        fetchedUsers.sort((a, b) => b.points - a.points || b.rescues - a.rescues);
        
        // Assign ranks
        fetchedUsers = fetchedUsers.map((u, idx) => ({ ...u, rank: idx + 1 }));

        // Ensure current user is in the list visually if they don't have many points
        if (userProfile && !fetchedUsers.find(u => u.uid === userProfile.uid)) {
           fetchedUsers.push({
            uid: userProfile.uid,
            rank: fetchedUsers.length + 1,
            name: userProfile.name,
            rescues: 0, // Fallback if missing
            points: 0, // Fallback if missing
            avatar: userProfile.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()
           });
        }

        // Keep top 10 to not overflow
        setVolunteers(fetchedUsers.slice(0, 10));
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchLeaderboard();
    return () => { active = false; };
  }, [userProfile]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-surface-500">
        <Loader2 className="w-8 h-8 animate-spin mb-4" />
        <p>Loading real-time leaderboard...</p>
      </div>
    );
  }

  // Ensure we have at least 3 for the podium visually (if not enough real users, we don't pad it so it stays REAL)
  const podiumTop3 = [volunteers[1], volunteers[0], volunteers[2]];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-8">
      
      <div className="text-center space-y-3 mb-8">
        <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 text-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-4 transform rotate-3">
          <Trophy className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold">Community Heroes</h2>
        <p className="text-surface-600 dark:text-surface-400 max-w-lg mx-auto">
          Recognizing the outstanding volunteers who consistently step up to save lives and make our community safer.
        </p>
      </div>

      {volunteers.length === 0 ? (
        <div className="text-center p-12 bg-surface-50 dark:bg-surface-900/50 rounded-3xl border border-surface-200 dark:border-surface-800">
          <p className="text-surface-600 font-bold">No community heroes registered yet.</p>
          <p className="text-sm text-surface-500 mt-2">Be the first to earn points by participating in the community!</p>
        </div>
      ) : (
        <>
          {/* Top 3 Podium (Desktop only for better layout) */}
          {volunteers.length >= 3 && (
            <div className="hidden md:flex justify-center items-end gap-6 h-64 mb-12">
              {/* Rank 2 */}
              <div className="flex flex-col items-center w-32">
                <div className="w-16 h-16 bg-surface-200 dark:bg-surface-700 rounded-full flex items-center justify-center font-bold text-xl text-surface-600 dark:text-surface-300 mb-3 border-4 border-slate-300 relative overflow-hidden">
                  <span className="relative z-10">{podiumTop3[0].avatar}</span>
                </div>
                <div className="text-center mb-4">
                  <div className="font-bold text-sm truncate w-full">{podiumTop3[0].name}</div>
                  <div className="text-xs text-amber-500 font-bold">{podiumTop3[0].points} pts</div>
                </div>
                <div className="w-full h-32 bg-slate-200 dark:bg-slate-700 rounded-t-2xl flex justify-center pt-4 shadow-inner">
                  <span className="text-4xl font-black text-slate-400 opacity-50">2</span>
                </div>
              </div>

              {/* Rank 1 */}
              <div className="flex flex-col items-center w-36">
                <div className="w-20 h-20 bg-amber-100 dark:bg-amber-900 rounded-full flex items-center justify-center font-bold text-2xl text-amber-600 dark:text-amber-400 mb-3 border-4 border-amber-400 relative overflow-hidden shadow-lg shadow-amber-500/20">
                  <Medal className="absolute -top-3 -right-3 w-8 h-8 text-amber-500 drop-shadow-md z-20" />
                  <span className="relative z-10">{podiumTop3[1].avatar}</span>
                </div>
                <div className="text-center mb-4">
                  <div className="font-bold truncate w-full text-amber-600 dark:text-amber-500">{podiumTop3[1].name}</div>
                  <div className="text-sm text-amber-500 font-bold">{podiumTop3[1].points} pts</div>
                </div>
                <div className="w-full h-40 bg-gradient-to-t from-amber-200 to-amber-100 dark:from-amber-900/60 dark:to-amber-900/30 rounded-t-2xl flex justify-center pt-4 shadow-inner border border-amber-200 dark:border-amber-800">
                  <span className="text-5xl font-black text-amber-400 dark:text-amber-700 opacity-50">1</span>
                </div>
              </div>

              {/* Rank 3 */}
              <div className="flex flex-col items-center w-32">
                <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center font-bold text-xl text-orange-700 dark:text-orange-400 mb-3 border-4 border-orange-300 relative overflow-hidden">
                  <span className="relative z-10">{podiumTop3[2].avatar}</span>
                </div>
                <div className="text-center mb-4">
                  <div className="font-bold text-sm truncate w-full">{podiumTop3[2].name}</div>
                  <div className="text-xs text-amber-500 font-bold">{podiumTop3[2].points} pts</div>
                </div>
                <div className="w-full h-24 bg-orange-200 dark:bg-orange-900/40 rounded-t-2xl flex justify-center pt-4 shadow-inner">
                  <span className="text-4xl font-black text-orange-400/50 dark:text-orange-700/50">3</span>
                </div>
              </div>
            </div>
          )}

          {/* List View */}
          <div className="bg-white dark:bg-surface-800 rounded-3xl border border-surface-200 dark:border-surface-700 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-50 dark:bg-surface-900/50 border-b border-surface-200 dark:border-surface-700">
                    <th className="py-4 px-6 font-bold text-xs uppercase text-surface-500 tracking-wider">Rank</th>
                    <th className="py-4 px-6 font-bold text-xs uppercase text-surface-500 tracking-wider">Volunteer</th>
                    <th className="py-4 px-6 font-bold text-xs uppercase text-surface-500 tracking-wider text-right">Rescues</th>
                    <th className="py-4 px-6 font-bold text-xs uppercase text-surface-500 tracking-wider text-right">Points</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-100 dark:divide-surface-700/50">
                  {volunteers.map((vol) => (
                    <tr key={vol.uid} className={`hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors ${userProfile?.uid === vol.uid ? 'bg-amber-50 dark:bg-amber-900/10' : ''}`}>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <span className={`font-bold w-6 text-center ${vol.rank <= 3 ? 'text-amber-500' : 'text-surface-500'}`}>
                            #{vol.rank}
                          </span>
                          {vol.rank === 1 && <Star className="w-4 h-4 text-amber-500 fill-amber-500" />}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${userProfile?.uid === vol.uid ? 'bg-amber-500 text-white' : 'bg-primary-100 dark:bg-primary-900/30 text-primary-600'}`}>
                            {vol.avatar}
                          </div>
                          <span className="font-bold text-surface-900 dark:text-white">
                            {vol.name} {userProfile?.uid === vol.uid && <span className="text-xs text-amber-600 font-normal ml-2">(You)</span>}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <span className="inline-flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2.5 py-1 rounded-lg">
                          <Award className="w-4 h-4" /> {vol.rescues}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right font-mono font-bold text-surface-600 dark:text-surface-400">
                        {vol.points.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
