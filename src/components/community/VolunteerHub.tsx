import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { VolunteerRegistration } from "./VolunteerRegistration";
import { VolunteerDashboard } from "./VolunteerDashboard";
import { useDemo } from "../../context/DemoContext";

export function VolunteerHub() {
  const { userProfile, updateProfileData } = useAuth();
  const { demoMode } = useDemo();
  // We still use local state for pending to simulate the flow for demo purposes if not approved yet
  const [localStatus, setLocalStatus] = useState<"unregistered" | "pending">("unregistered");

  // If user is actually volunteer in Firestore, they are approved.
  const isApproved = userProfile?.role === "volunteer" || userProfile?.role === "admin";

  if (!isApproved) {
    if (localStatus === "pending") {
      return (
        <div className="flex flex-col items-center justify-center h-full p-8 text-center max-w-md mx-auto">
          <div className="w-24 h-24 bg-amber-100 dark:bg-amber-900/30 text-amber-500 rounded-full flex items-center justify-center mb-6">
            <svg className="w-12 h-12 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-4">Application Pending</h2>
          <p className="text-surface-600 dark:text-surface-400 mb-8">
            Your volunteer application is currently under review by the admin team. You will be notified once approved.
          </p>
          <button 
            onClick={() => {
              if (demoMode && updateProfileData) {
                updateProfileData({ role: "volunteer" });
              }
            }} // Hidden bypass for demo purposes
            className="text-xs text-surface-400 hover:text-primary-500 transition-colors underline"
          >
            (Simulate Admin Approval)
          </button>
        </div>
      );
    }

    return <VolunteerRegistration onSubmit={() => setLocalStatus("pending")} />;
  }

  return <VolunteerDashboard />;
}
