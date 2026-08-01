import React, { useState } from "react";
import { Power, MapPin, Navigation, Clock, ShieldAlert, CheckCircle2, AlertTriangle, ArrowRight } from "lucide-react";

interface Emergency {
  id: string;
  type: string;
  severity: "high" | "medium" | "critical";
  distance: string;
  eta: string;
  timeSinceSos: string;
  location: string;
}

const MOCK_EMERGENCIES: Emergency[] = [
  {
    id: "sos-102",
    type: "Road Accident",
    severity: "critical",
    distance: "1.2 km",
    eta: "4 mins",
    timeSinceSos: "2 mins ago",
    location: "Intersection of Main St & 4th Ave"
  }
];

export function VolunteerDashboard() {
  const [isOnline, setIsOnline] = useState(false);
  const [activeRescue, setActiveRescue] = useState<Emergency | null>(null);
  const [rescueStep, setRescueStep] = useState<"en_route" | "arrived" | "assisting" | "completed">("en_route");

  // Accept Rescue
  const acceptRescue = (emergency: Emergency) => {
    setActiveRescue(emergency);
    setRescueStep("en_route");
  };

  const advanceRescue = () => {
    if (rescueStep === "en_route") setRescueStep("arrived");
    else if (rescueStep === "arrived") setRescueStep("assisting");
    else if (rescueStep === "assisting") setRescueStep("completed");
    else {
      setActiveRescue(null);
      // Reset
    }
  };

  const cancelRescue = () => {
    setActiveRescue(null);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      
      {/* Status Header */}
      <div className="bg-white dark:bg-surface-800 rounded-3xl p-6 border border-surface-200 dark:border-surface-700 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className={`relative w-16 h-16 rounded-2xl flex items-center justify-center border-2 transition-colors ${isOnline ? 'bg-emerald-50 border-emerald-200 text-emerald-600 dark:bg-emerald-900/20 dark:border-emerald-800' : 'bg-surface-100 border-surface-200 text-surface-400 dark:bg-surface-700 dark:border-surface-600'}`}>
            <Power className="w-8 h-8" />
            <div className={`absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full border-2 border-white dark:border-surface-800 ${isOnline ? 'bg-emerald-500' : 'bg-surface-400'}`}></div>
          </div>
          <div>
            <h2 className="text-xl font-bold mb-1">Status: {isOnline ? 'Online & Ready' : 'Offline'}</h2>
            <p className="text-sm text-surface-500">
              {isOnline ? 'Listening for nearby SOS signals...' : 'Toggle to receive emergency requests.'}
            </p>
          </div>
        </div>
        
        <button 
          onClick={() => setIsOnline(!isOnline)}
          className={`px-8 py-3 rounded-xl font-bold transition-all ${isOnline ? 'bg-surface-900 text-white dark:bg-white dark:text-surface-900' : 'bg-emerald-600 text-white hover:bg-emerald-700'}`}
        >
          {isOnline ? 'Go Offline' : 'Go Online'}
        </button>
      </div>

      {/* Active Rescue Workflow */}
      {activeRescue ? (
        <div className="bg-red-50 dark:bg-red-900/10 border-2 border-red-200 dark:border-red-900/50 rounded-3xl p-6 overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-red-200 dark:bg-red-900/50">
            <div className="h-full bg-red-600 animate-pulse w-full"></div>
          </div>
          
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 text-red-600 rounded-full flex items-center justify-center animate-pulse">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-red-900 dark:text-red-100 text-lg">Active Rescue: {activeRescue.type}</h3>
                <p className="text-sm text-red-700 dark:text-red-300 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" /> {activeRescue.location}
                </p>
              </div>
            </div>
            {rescueStep !== "completed" && (
              <button onClick={cancelRescue} className="text-sm font-bold text-red-600 hover:text-red-800 transition-colors">
                Abort
              </button>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={advanceRescue}
              className="flex-1 py-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors shadow-lg shadow-red-600/20"
            >
              {rescueStep === "en_route" && <><Navigation className="w-5 h-5" /> I Have Arrived</>}
              {rescueStep === "arrived" && <><ShieldAlert className="w-5 h-5" /> Start Assisting</>}
              {rescueStep === "assisting" && <><CheckCircle2 className="w-5 h-5" /> Medical Help Arrived (Complete)</>}
              {rescueStep === "completed" && "Finish & View Log"}
            </button>
            {rescueStep === "en_route" && (
              <button className="flex-1 py-4 bg-white dark:bg-surface-800 text-surface-900 dark:text-white border border-surface-200 dark:border-surface-700 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-surface-50 dark:hover:bg-surface-700 transition-colors">
                <Navigation className="w-5 h-5 text-blue-500" /> Navigate ({activeRescue.eta})
              </button>
            )}
          </div>

          {/* Workflow Steps */}
          <div className="mt-8 flex justify-between items-center relative">
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-red-200 dark:bg-red-900/30 -z-10"></div>
            {[
              { id: "en_route", label: "En Route" },
              { id: "arrived", label: "Arrived" },
              { id: "assisting", label: "Assisting" },
              { id: "completed", label: "Done" }
            ].map((step, i) => {
              const stages = ["en_route", "arrived", "assisting", "completed"];
              const currentIndex = stages.indexOf(rescueStep);
              const isPast = i < currentIndex;
              const isCurrent = i === currentIndex;
              
              return (
                <div key={step.id} className="flex flex-col items-center gap-2 bg-red-50 dark:bg-surface-900 px-2">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    isPast ? 'bg-green-500 text-white' : isCurrent ? 'bg-red-600 text-white ring-4 ring-red-200 dark:ring-red-900/50' : 'bg-surface-200 dark:bg-surface-700 text-surface-500'
                  }`}>
                    {isPast ? <CheckCircle2 className="w-4 h-4" /> : (i + 1)}
                  </div>
                  <span className={`text-xs font-bold ${isCurrent ? 'text-red-600' : 'text-surface-500'}`}>{step.label}</span>
                </div>
              );
            })}
          </div>

        </div>
      ) : (
        <>
          {/* Incoming Emergencies */}
          {isOnline && (
            <div className="space-y-4">
              <h3 className="font-bold text-sm uppercase tracking-wider text-surface-500 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" /> Nearby Emergencies
              </h3>
              
              {MOCK_EMERGENCIES.map((em) => (
                <div key={em.id} className="bg-white dark:bg-surface-800 border border-red-200 dark:border-red-900/50 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row gap-4 items-center animate-in fade-in slide-in-from-bottom-4">
                  <div className="flex-1 w-full">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
                        {em.severity}
                      </span>
                      <span className="text-sm font-bold text-red-600 animate-pulse">{em.timeSinceSos}</span>
                    </div>
                    <h4 className="text-lg font-bold mb-1">{em.type}</h4>
                    <p className="text-sm text-surface-600 dark:text-surface-400 flex items-center gap-1.5 mb-2">
                      <MapPin className="w-4 h-4" /> {em.location}
                    </p>
                    <div className="flex items-center gap-4 text-sm font-semibold">
                      <span className="flex items-center gap-1"><Navigation className="w-4 h-4 text-blue-500" /> {em.distance}</span>
                      <span className="flex items-center gap-1"><Clock className="w-4 h-4 text-amber-500" /> {em.eta}</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => acceptRescue(em)}
                    className="w-full sm:w-auto px-8 py-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors shadow-md"
                  >
                    Accept SOS <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {!isOnline && (
            <div className="bg-surface-50 dark:bg-surface-800/50 border border-surface-200 dark:border-surface-700 rounded-3xl p-8 text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-surface-200 dark:bg-surface-700 text-surface-400 rounded-full flex items-center justify-center mb-4">
                <Power className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-lg mb-2">You are currently offline</h3>
              <p className="text-surface-500 text-sm max-w-md mx-auto">
                Go online to start receiving nearby emergency alerts and help save lives in your community.
              </p>
            </div>
          )}
        </>
      )}

    </div>
  );
}
