import React from "react";
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell 
} from "recharts";

export function AdminAnalyticsTab() {
  const trendData = [
    { name: 'Mon', sos: 12, hazards: 8, rescues: 10 },
    { name: 'Tue', sos: 19, hazards: 12, rescues: 15 },
    { name: 'Wed', sos: 15, hazards: 10, rescues: 14 },
    { name: 'Thu', sos: 22, hazards: 15, rescues: 20 },
    { name: 'Fri', sos: 28, hazards: 18, rescues: 25 },
    { name: 'Sat', sos: 35, hazards: 25, rescues: 30 },
    { name: 'Sun', sos: 30, hazards: 20, rescues: 28 },
  ];

  const responseTimeData = [
    { name: 'Jan', time: 14 },
    { name: 'Feb', time: 12 },
    { name: 'Mar', time: 10 },
    { name: 'Apr', time: 8.5 },
    { name: 'May', time: 7 },
    { name: 'Jun', time: 5.5 },
  ];

  const userGrowthData = [
    { name: 'Jan', citizens: 4000, volunteers: 400 },
    { name: 'Feb', citizens: 5000, volunteers: 600 },
    { name: 'Mar', citizens: 6500, volunteers: 850 },
    { name: 'Apr', citizens: 8500, volunteers: 1200 },
    { name: 'May', citizens: 12000, volunteers: 1800 },
    { name: 'Jun', citizens: 18000, volunteers: 2400 },
  ];

  const COLORS = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6'];

  const emergencyTypes = [
    { name: 'Medical', value: 45 },
    { name: 'Fire', value: 15 },
    { name: 'Accident', value: 30 },
    { name: 'Other', value: 10 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Analytics & Reports</h2>
        <p className="text-surface-500 text-sm">System-wide performance and engagement metrics.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* SOS Trends */}
        <div className="bg-white dark:bg-surface-800 rounded-2xl border border-surface-200 dark:border-surface-700 p-6 shadow-sm">
          <h3 className="font-bold mb-6">Weekly Activity Trend</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorSos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.2} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                <Tooltip />
                <Area type="monotone" dataKey="sos" stroke="#ef4444" fillOpacity={1} fill="url(#colorSos)" name="SOS Alerts" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Response Time */}
        <div className="bg-white dark:bg-surface-800 rounded-2xl border border-surface-200 dark:border-surface-700 p-6 shadow-sm">
          <h3 className="font-bold mb-6">Average Response Time (mins)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={responseTimeData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.2} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                <Tooltip />
                <Line type="monotone" dataKey="time" stroke="#10b981" strokeWidth={3} dot={{r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff'}} name="Avg Response Time" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* User Growth */}
        <div className="bg-white dark:bg-surface-800 rounded-2xl border border-surface-200 dark:border-surface-700 p-6 shadow-sm">
          <h3 className="font-bold mb-6">User & Volunteer Growth</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={userGrowthData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.2} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                <Tooltip />
                <Bar dataKey="citizens" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Citizens" />
                <Bar dataKey="volunteers" fill="#10b981" radius={[4, 4, 0, 0]} name="Volunteers" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Emergency Types */}
        <div className="bg-white dark:bg-surface-800 rounded-2xl border border-surface-200 dark:border-surface-700 p-6 shadow-sm">
          <h3 className="font-bold mb-6">Emergency Breakdown</h3>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={emergencyTypes}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {emergencyTypes.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-2 text-sm">
            {emergencyTypes.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                <span>{entry.name}</span>
              </div>
            ))}
          </div>
        </div>
        
      </div>
    </div>
  );
}
