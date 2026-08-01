import React from "react";
import { Trophy, Medal, Star, Award } from "lucide-react";

const TOP_VOLUNTEERS = [
  { rank: 1, name: "Sarah Jenkins", rescues: 42, training: 12, points: 15400, avatar: "SJ" },
  { rank: 2, name: "David Chen", rescues: 38, training: 15, points: 14250, avatar: "DC" },
  { rank: 3, name: "Priya Sharma", rescues: 35, training: 10, points: 13100, avatar: "PS" },
  { rank: 4, name: "Marcus Johnson", rescues: 28, training: 8, points: 10500, avatar: "MJ" },
  { rank: 5, name: "Emma Wilson", rescues: 25, training: 14, points: 9800, avatar: "EW" },
];

export function Leaderboard() {
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

      {/* Top 3 Podium (Desktop only for better layout) */}
      <div className="hidden md:flex justify-center items-end gap-6 h-64 mb-12">
        {/* Rank 2 */}
        <div className="flex flex-col items-center w-32">
          <div className="w-16 h-16 bg-surface-200 dark:bg-surface-700 rounded-full flex items-center justify-center font-bold text-xl text-surface-600 dark:text-surface-300 mb-3 border-4 border-slate-300">
            {TOP_VOLUNTEERS[1].avatar}
          </div>
          <div className="text-center mb-4">
            <div className="font-bold text-sm truncate w-full">{TOP_VOLUNTEERS[1].name}</div>
            <div className="text-xs text-amber-500 font-bold">{TOP_VOLUNTEERS[1].points} pts</div>
          </div>
          <div className="w-full h-32 bg-slate-200 dark:bg-slate-700 rounded-t-2xl flex justify-center pt-4 shadow-inner">
            <span className="text-4xl font-black text-slate-400 opacity-50">2</span>
          </div>
        </div>

        {/* Rank 1 */}
        <div className="flex flex-col items-center w-36">
          <div className="w-20 h-20 bg-amber-100 dark:bg-amber-900 rounded-full flex items-center justify-center font-bold text-2xl text-amber-600 dark:text-amber-400 mb-3 border-4 border-amber-400 relative">
            <Medal className="absolute -top-3 -right-3 w-8 h-8 text-amber-500 drop-shadow-md" />
            {TOP_VOLUNTEERS[0].avatar}
          </div>
          <div className="text-center mb-4">
            <div className="font-bold truncate w-full text-amber-600 dark:text-amber-500">{TOP_VOLUNTEERS[0].name}</div>
            <div className="text-sm text-amber-500 font-bold">{TOP_VOLUNTEERS[0].points} pts</div>
          </div>
          <div className="w-full h-40 bg-gradient-to-t from-amber-200 to-amber-100 dark:from-amber-900/60 dark:to-amber-900/30 rounded-t-2xl flex justify-center pt-4 shadow-inner border border-amber-200 dark:border-amber-800">
            <span className="text-5xl font-black text-amber-400 dark:text-amber-700 opacity-50">1</span>
          </div>
        </div>

        {/* Rank 3 */}
        <div className="flex flex-col items-center w-32">
          <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center font-bold text-xl text-orange-700 dark:text-orange-400 mb-3 border-4 border-orange-300">
            {TOP_VOLUNTEERS[2].avatar}
          </div>
          <div className="text-center mb-4">
            <div className="font-bold text-sm truncate w-full">{TOP_VOLUNTEERS[2].name}</div>
            <div className="text-xs text-amber-500 font-bold">{TOP_VOLUNTEERS[2].points} pts</div>
          </div>
          <div className="w-full h-24 bg-orange-200 dark:bg-orange-900/40 rounded-t-2xl flex justify-center pt-4 shadow-inner">
            <span className="text-4xl font-black text-orange-400/50 dark:text-orange-700/50">3</span>
          </div>
        </div>
      </div>

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
              {TOP_VOLUNTEERS.map((vol) => (
                <tr key={vol.rank} className="hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors">
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
                      <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 flex items-center justify-center text-xs font-bold shrink-0">
                        {vol.avatar}
                      </div>
                      <span className="font-bold text-surface-900 dark:text-white">{vol.name}</span>
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

    </div>
  );
}
