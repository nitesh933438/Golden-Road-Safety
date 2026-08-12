import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { 
  ShieldCheck, 
  Lock, 
  Scale, 
  AlertTriangle, 
  FileText, 
  Accessibility as AccessIcon, 
  ArrowLeft 
} from "lucide-react";
import { Link } from "react-router-dom";

type LegalTab = "privacy" | "terms" | "safety" | "consent" | "accessibility";

export function Legal() {
  const [searchParams, setSearchParams] = useSearchParams();
  const docParam = searchParams.get("doc") as LegalTab;
  const [activeTab, setActiveTab] = useState<LegalTab>("privacy");

  useEffect(() => {
    if (docParam && ["privacy", "terms", "safety", "consent", "accessibility"].includes(docParam)) {
      setActiveTab(docParam);
    }
  }, [docParam]);

  const handleTabChange = (tab: LegalTab) => {
    setActiveTab(tab);
    setSearchParams({ doc: tab });
  };

  const tabs = [
    { id: "privacy", label: "Privacy Policy", icon: Lock },
    { id: "terms", label: "Terms of Use", icon: Scale },
    { id: "safety", label: "Safety Guidelines", icon: AlertTriangle },
    { id: "consent", label: "Data & Consent", icon: FileText },
    { id: "accessibility", label: "Accessibility", icon: AccessIcon },
  ] as const;

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      
      {/* Header Banner */}
      <div className="rounded-3xl bg-surface-900 text-white p-8 sm:p-12 border border-surface-800 shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 opacity-10 pointer-events-none">
          <ShieldCheck className="w-96 h-96 text-amber-500" />
        </div>
        
        <div className="relative z-10 max-w-3xl space-y-4">
          <Link to="/" className="inline-flex items-center gap-2 text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors uppercase tracking-wider mb-2">
            <ArrowLeft className="w-4 h-4" /> Back to Safety Center
          </Link>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Policies & Safeguards
          </h1>
          <p className="text-sm sm:text-base text-surface-300 leading-relaxed max-w-2xl">
            Read GoldenGuard's regulatory compliance drafts, safety disclaimers, data-sharing protocols, and visual accessibility standards.
          </p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Navigation Sidebar */}
        <div className="lg:w-64 bg-white dark:bg-surface-900 p-4 rounded-3xl border border-surface-200 dark:border-surface-800 shadow-xl flex flex-col shrink-0 gap-1.5 h-fit">
          <h3 className="px-4 py-2 text-xs font-black uppercase text-surface-400 tracking-wider">Document Index</h3>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all text-left ${
                  activeTab === tab.id
                    ? "bg-amber-500 text-black shadow-md font-black"
                    : "text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800/50"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Document Content Display */}
        <div className="flex-1 bg-white dark:bg-surface-900 p-6 sm:p-8 rounded-3xl border border-surface-200 dark:border-surface-800 shadow-xl space-y-6">
          {activeTab === "privacy" && (
            <div className="space-y-4">
              <div className="flex items-center gap-2.5">
                <Lock className="w-6 h-6 text-amber-500" />
                <h2 className="text-xl sm:text-2xl font-black text-surface-900 dark:text-white">Privacy Policy</h2>
              </div>
              <div className="text-xs sm:text-sm text-surface-600 dark:text-surface-300 space-y-4 leading-relaxed font-medium">
                <p>
                  GoldenGuard is built with an offline-first philosophy to maximize user privacy. Your health profile data, medical ID, and emergency contact details are stored securely within your local device's client-side storage (indexedDB/localStorage). 
                </p>
                <p>
                  This data is transmitted to secured Firebase Firestore instances ONLY when a verified crash event is detected or a manual SOS signal is sent, enabling emergency dispatch coordinators to assist you. GoldenGuard does not persistently track, sell, or profile your private location histories.
                </p>
                <div className="p-4 bg-amber-500/10 rounded-2xl border border-amber-500/20 text-amber-800 dark:text-amber-200 text-xs">
                  <span className="font-bold block mb-1">Notice on Active Transmissions:</span>
                  Location coordinates are only actively updated during an ongoing hazard report or SOS incident to assist safety responders.
                </div>
              </div>
            </div>
          )}

          {activeTab === "terms" && (
            <div className="space-y-4">
              <div className="flex items-center gap-2.5">
                <Scale className="w-6 h-6 text-amber-500" />
                <h2 className="text-xl sm:text-2xl font-black text-surface-900 dark:text-white">Terms of Use</h2>
              </div>
              <div className="text-xs sm:text-sm text-surface-600 dark:text-surface-300 space-y-4 leading-relaxed font-medium">
                <p>
                  By using GoldenGuard, you acknowledge that the platform, including its automatic crash detection and first aid recommendations, is a supportive resource designed to assist during emergencies. 
                </p>
                <p>
                  It is not a substitute for professional emergency dispatchers (such as public 911, 112, or 108 services). While we optimize first responder coordination and 'Golden Hour' corridors, emergency dispatch is handled on a best-effort basis relative to network availability and nearby volunteer proximity.
                </p>
              </div>
            </div>
          )}

          {activeTab === "safety" && (
            <div className="space-y-4">
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="w-6 h-6 text-amber-500" />
                <h2 className="text-xl sm:text-2xl font-black text-surface-900 dark:text-white">Safety Guidelines & Disclaimers</h2>
              </div>
              <div className="text-xs sm:text-sm text-surface-600 dark:text-surface-300 space-y-4 leading-relaxed font-medium">
                <p>
                  GoldenGuard relies on standard device sensors (accelerometers, GPS, and gyroscopes) to run intelligent crash detection algorithms. Physical device configurations, vehicle placements, and environmental interference may affect sensor responsiveness. 
                </p>
                <p>
                  Good Samaritan volunteers who respond to critical first-aid alerts are encouraged to act within their trained capacities and local legal protections (e.g. Good Samaritan laws) to ensure safety first. Do not place yourself in physical danger at an accident scene.
                </p>
              </div>
            </div>
          )}

          {activeTab === "consent" && (
            <div className="space-y-4">
              <div className="flex items-center gap-2.5">
                <FileText className="w-6 h-6 text-amber-500" />
                <h2 className="text-xl sm:text-2xl font-black text-surface-900 dark:text-white">Data Sharing & Consent</h2>
              </div>
              <div className="text-xs sm:text-sm text-surface-600 dark:text-surface-300 space-y-4 leading-relaxed font-medium">
                <p>
                  During profile onboarding, you explicitly consent to sharing your specified medical history (blood type, pre-existing conditions, allergies, and active medications) with authorized emergency responders, medical personnel, and police coordinators during an active emergency event.
                </p>
                <p>
                  You retain complete control over your profile and can revoke consent, modify, or erase all local and cloud data at any time through your Profile page. We maintain strict compliance checks so that your data is handled with maximum care.
                </p>
              </div>
            </div>
          )}

          {activeTab === "accessibility" && (
            <div className="space-y-4">
              <div className="flex items-center gap-2.5">
                <AccessIcon className="w-6 h-6 text-amber-500" />
                <h2 className="text-xl sm:text-2xl font-black text-surface-900 dark:text-white">Accessibility Standard</h2>
              </div>
              <div className="text-xs sm:text-sm text-surface-600 dark:text-surface-300 space-y-4 leading-relaxed font-medium">
                <p>
                  We are committed to ensuring GoldenGuard is fully accessible to all citizens, including those with visual, cognitive, or physical impairments. 
                </p>
                <p>
                  The platform conforms to WCAG 2.1 AA contrast requirements, supports responsive font scaling, maintains strict keyboard-friendly navigation trees, and features screen-reader landmarks across all core emergency control triggers.
                </p>
              </div>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
