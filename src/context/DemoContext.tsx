import React, { createContext, useContext, useState, useEffect } from "react";
import {
  DEMO_USERS,
  DEMO_VOLUNTEERS,
  DEMO_HOSPITALS,
  DEMO_POLICE_STATIONS,
  DEMO_HAZARDS,
  DEMO_EMERGENCIES,
  DEMO_NOTIFICATIONS,
  DEMO_AI_CHATS,
  DEMO_CERTIFICATES,
  DEMO_POSTS,
  DemoUser,
  DemoVolunteer,
  DemoHospital,
  DemoPoliceStation,
  DemoHazard,
  DemoEmergency,
  DemoNotification,
  DemoAIChat,
  DemoCertificate,
  DemoCommunityPost
} from "../lib/demoData";

interface DemoContextType {
  demoMode: boolean;
  setDemoMode: (val: boolean) => void;
  toggleDemoMode: () => void;
  
  // Guided Tour
  isTourActive: boolean;
  tourStep: number;
  startTour: () => void;
  endTour: () => void;
  setTourStep: (step: number) => void;
  nextTourStep: () => void;
  prevTourStep: () => void;
  
  // Welcome Modal
  showWelcomeModal: boolean;
  setShowWelcomeModal: (show: boolean) => void;

  // Demo Collections
  users: DemoUser[];
  volunteers: DemoVolunteer[];
  hospitals: DemoHospital[];
  policeStations: DemoPoliceStation[];
  hazards: DemoHazard[];
  emergencies: DemoEmergency[];
  notifications: DemoNotification[];
  aiChats: DemoAIChat[];
  certificates: DemoCertificate[];
  communityPosts: DemoCommunityPost[];

  // Mutations (In-Memory Demo Only - never writes to Firestore)
  addDemoHazard: (hazard: Partial<DemoHazard>) => void;
  triggerDemoEmergency: (type?: string) => void;
}

const DemoContext = createContext<DemoContextType | undefined>(undefined);

export const DemoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [demoMode, setDemoModeState] = useState<boolean>(() => {
    return localStorage.getItem("goldenguard_demo_mode") === "true";
  });

  const [showWelcomeModal, setShowWelcomeModal] = useState<boolean>(() => {
    return localStorage.getItem("goldenguard_welcome_seen") !== "true";
  });

  const [isTourActive, setIsTourActive] = useState<boolean>(false);
  const [tourStep, setTourStep] = useState<number>(1);

  // Preloaded Demo Data States
  const [hazards, setHazards] = useState<DemoHazard[]>(DEMO_HAZARDS);
  const [emergencies, setEmergencies] = useState<DemoEmergency[]>(DEMO_EMERGENCIES);
  const [notifications, setNotifications] = useState<DemoNotification[]>(DEMO_NOTIFICATIONS);

  const setDemoMode = (val: boolean) => {
    setDemoModeState(val);
    localStorage.setItem("goldenguard_demo_mode", String(val));
  };

  const toggleDemoMode = () => {
    setDemoMode(!demoMode);
  };

  const startTour = () => {
    setDemoMode(true);
    setIsTourActive(true);
    setTourStep(1);
    setShowWelcomeModal(false);
  };

  const endTour = () => {
    setIsTourActive(false);
  };

  const nextTourStep = () => {
    if (tourStep < 6) {
      setTourStep(prev => prev + 1);
    } else {
      endTour();
    }
  };

  const prevTourStep = () => {
    if (tourStep > 1) {
      setTourStep(prev => prev - 1);
    }
  };

  const addDemoHazard = (hazard: Partial<DemoHazard>) => {
    const newHazard: DemoHazard = {
      id: `demo-hz-${Date.now()}`,
      type: hazard.type || "accident",
      description: hazard.description || "Reported hazard (Demo)",
      lat: hazard.lat || 37.7749,
      lng: hazard.lng || -122.4194,
      timestamp: "Just now",
      reportedBy: "Alex Rivera (Demo)",
      votes: 1,
      status: "active"
    };
    setHazards(prev => [newHazard, ...prev]);
  };

  const triggerDemoEmergency = (type = "Severe Highway Crash") => {
    const newEmergency: DemoEmergency = {
      id: `demo-em-${Date.now()}`,
      patientName: "Demo User (Alex)",
      type: type,
      severity: "critical",
      location: "Current Location (Demo)",
      lat: 37.7749,
      lng: -122.4194,
      timestamp: "Just now",
      status: "dispatched",
      etaMinutes: 2
    };
    setEmergencies(prev => [newEmergency, ...prev]);
  };

  return (
    <DemoContext.Provider
      value={{
        demoMode,
        setDemoMode,
        toggleDemoMode,
        isTourActive,
        tourStep,
        startTour,
        endTour,
        setTourStep,
        nextTourStep,
        prevTourStep,
        showWelcomeModal,
        setShowWelcomeModal,
        users: DEMO_USERS,
        volunteers: DEMO_VOLUNTEERS,
        hospitals: DEMO_HOSPITALS,
        policeStations: DEMO_POLICE_STATIONS,
        hazards,
        emergencies,
        notifications,
        aiChats: DEMO_AI_CHATS,
        certificates: DEMO_CERTIFICATES,
        communityPosts: DEMO_POSTS,
        addDemoHazard,
        triggerDemoEmergency
      }}
    >
      {children}
    </DemoContext.Provider>
  );
};

export const useDemo = () => {
  const context = useContext(DemoContext);
  if (!context) {
    throw new Error("useDemo must be used within a DemoProvider");
  }
  return context;
};
