import React, { useState } from "react";
import { ShieldAlert, CheckCircle2, ChevronRight } from "lucide-react";

export function VolunteerRegistration({ onSubmit }: { onSubmit: () => void }) {
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    city: "",
    state: "",
    bloodGroup: "",
    firstAidTrained: "no",
    cprCertified: "no",
    languages: "",
    emergencyContact: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Normally save to Firestore here
    onSubmit();
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Become a Volunteer Responder</h2>
        <p className="text-surface-600 dark:text-surface-400 text-sm">
          Join the GoldenGuard network. Your rapid response during the Golden Hour can save a life.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-surface-800 rounded-3xl p-6 sm:p-8 border border-surface-200 dark:border-surface-700 shadow-sm space-y-6">
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-surface-500 uppercase tracking-wider">Full Name</label>
            <input required type="text" className="w-full bg-surface-50 dark:bg-surface-900/50 border border-surface-200 dark:border-surface-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary-500 outline-none" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-surface-500 uppercase tracking-wider">Phone Number</label>
            <input required type="tel" className="w-full bg-surface-50 dark:bg-surface-900/50 border border-surface-200 dark:border-surface-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary-500 outline-none" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-surface-500 uppercase tracking-wider">City</label>
            <input required type="text" className="w-full bg-surface-50 dark:bg-surface-900/50 border border-surface-200 dark:border-surface-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary-500 outline-none" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-surface-500 uppercase tracking-wider">State</label>
            <input required type="text" className="w-full bg-surface-50 dark:bg-surface-900/50 border border-surface-200 dark:border-surface-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary-500 outline-none" />
          </div>
        </div>

        <div className="border-t border-surface-200 dark:border-surface-700 pt-6">
          <h3 className="font-bold mb-4">Medical & Skills Profile</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-surface-500 uppercase tracking-wider">Blood Group (Optional)</label>
              <select className="w-full bg-surface-50 dark:bg-surface-900/50 border border-surface-200 dark:border-surface-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary-500 outline-none appearance-none">
                <option value="">Select...</option>
                <option value="A+">A+</option><option value="A-">A-</option>
                <option value="B+">B+</option><option value="B-">B-</option>
                <option value="O+">O+</option><option value="O-">O-</option>
                <option value="AB+">AB+</option><option value="AB-">AB-</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-surface-500 uppercase tracking-wider">Languages Spoken</label>
              <input required type="text" placeholder="e.g. English, Spanish" className="w-full bg-surface-50 dark:bg-surface-900/50 border border-surface-200 dark:border-surface-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary-500 outline-none" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-3">
            <label className="text-xs font-bold text-surface-500 uppercase tracking-wider">Formal First Aid Training?</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="firstAid" value="yes" className="w-4 h-4 text-primary-600 focus:ring-primary-500" />
                <span className="text-sm font-medium">Yes</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="firstAid" value="no" defaultChecked className="w-4 h-4 text-primary-600 focus:ring-primary-500" />
                <span className="text-sm font-medium">No</span>
              </label>
            </div>
          </div>
          <div className="space-y-3">
            <label className="text-xs font-bold text-surface-500 uppercase tracking-wider">CPR Certified?</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="cpr" value="yes" className="w-4 h-4 text-primary-600 focus:ring-primary-500" />
                <span className="text-sm font-medium">Yes</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="cpr" value="no" defaultChecked className="w-4 h-4 text-primary-600 focus:ring-primary-500" />
                <span className="text-sm font-medium">No</span>
              </label>
            </div>
          </div>
        </div>

        <div className="border-t border-surface-200 dark:border-surface-700 pt-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-surface-500 uppercase tracking-wider">Emergency Contact (Name & Phone)</label>
            <input required type="text" className="w-full bg-surface-50 dark:bg-surface-900/50 border border-surface-200 dark:border-surface-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary-500 outline-none" />
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl flex items-start gap-3 mt-6">
          <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <p className="text-xs text-blue-800 dark:text-blue-300 leading-relaxed">
            By submitting this application, I agree to act in good faith as a volunteer responder. I understand that I am protected by the Good Samaritan Law when providing reasonable assistance.
          </p>
        </div>

        <button type="submit" className="w-full py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2 shadow-md shadow-primary-600/20">
          Submit Application <ChevronRight className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
}
