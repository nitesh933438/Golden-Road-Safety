import React, { useState } from "react";
import { Bell, Send, Users, ShieldAlert, CloudRain, Shield, Building2 } from "lucide-react";

export function AdminNotificationsTab() {
  const [type, setType] = useState("emergency");
  const [target, setTarget] = useState("everyone");

  const types = [
    { id: "emergency", label: "Emergency Alert", icon: ShieldAlert, color: "text-red-500" },
    { id: "road", label: "Road Closure", icon: ShieldAlert, color: "text-amber-500" },
    { id: "weather", label: "Weather Warning", icon: CloudRain, color: "text-blue-500" },
    { id: "maintenance", label: "Maintenance", icon: Bell, color: "text-surface-500" },
    { id: "training", label: "Training Campaign", icon: Users, color: "text-emerald-500" },
  ];

  const targets = [
    { id: "everyone", label: "Everyone", icon: Users },
    { id: "citizens", label: "Citizens", icon: Users },
    { id: "volunteers", label: "Volunteers", icon: HeartIcon },
    { id: "hospitals", label: "Hospitals", icon: Building2 },
    { id: "police", label: "Police", icon: Shield },
  ];

  // Quick fix for Heart icon
  function HeartIcon(props: any) {
    return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Notification Center</h2>
        <p className="text-surface-500 text-sm">Broadcast messages to specific user groups via push notification and in-app alerts.</p>
      </div>

      <div className="bg-white dark:bg-surface-800 rounded-2xl border border-surface-200 dark:border-surface-700 shadow-sm p-6 sm:p-8 space-y-8">
        
        {/* Type Selection */}
        <div className="space-y-3">
          <label className="text-sm font-bold text-surface-900 dark:text-white uppercase tracking-wider">Alert Type</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {types.map((t) => (
              <button
                key={t.id}
                onClick={() => setType(t.id)}
                className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all ${
                  type === t.id 
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/10' 
                    : 'border-surface-200 dark:border-surface-700 hover:border-primary-200'
                }`}
              >
                <t.icon className={`w-6 h-6 ${t.color}`} />
                <span className="text-xs font-bold text-center">{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Target Audience */}
        <div className="space-y-3">
          <label className="text-sm font-bold text-surface-900 dark:text-white uppercase tracking-wider">Target Audience</label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {targets.map((t) => (
              <button
                key={t.id}
                onClick={() => setTarget(t.id)}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${
                  target === t.id 
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/10' 
                    : 'border-surface-200 dark:border-surface-700 hover:border-primary-200'
                }`}
              >
                <t.icon className="w-4 h-4" />
                <span className="text-xs font-bold">{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Message Content */}
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-bold text-surface-900 dark:text-white uppercase tracking-wider">Message Title</label>
            <input 
              type="text" 
              placeholder="e.g. Heavy Rain Warning"
              className="w-full px-4 py-3 bg-surface-50 dark:bg-surface-900/50 border border-surface-200 dark:border-surface-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-surface-900 dark:text-white uppercase tracking-wider">Message Body</label>
            <textarea 
              rows={4}
              placeholder="Provide detailed instructions or information..."
              className="w-full px-4 py-3 bg-surface-50 dark:bg-surface-900/50 border border-surface-200 dark:border-surface-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none resize-none"
            />
          </div>
        </div>

        <button className="w-full py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2 shadow-md">
          <Send className="w-5 h-5" /> Broadcast Message
        </button>

      </div>
    </div>
  );
}
