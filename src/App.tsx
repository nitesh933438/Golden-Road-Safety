import React, { Suspense, useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AlertTriangle, WifiOff } from "lucide-react";
import { ThemeProvider } from "./components/theme/ThemeProvider";
import { AuthProvider } from "./context/AuthContext";
import { OfflineSyncProvider } from "./context/OfflineSyncContext";
import { IncidentProvider } from "./context/IncidentContext";
import { CrashDetectionProvider } from "./context/CrashDetectionContext";
import { NotificationProvider } from "./context/NotificationContext";
import { PWAInstallProvider } from "./context/PWAInstallContext";
import { VoiceSOSProvider } from "./context/VoiceSOSContext";
import { VoiceSOSModal } from "./components/voice/VoiceSOSModal";
import { PWAInstallBanner } from "./components/pwa/PWAInstallBanner";
import { PWAInstallModal } from "./components/pwa/PWAInstallModal";
import { Layout } from "./components/layout/Layout";
import { Placeholder } from "./components/ui/Placeholder";
import { ErrorBoundary } from "./components/ui/ErrorBoundary";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { EmergencyInstructions } from "./components/auth/EmergencyInstructions";

import { Admin } from "./pages/Admin";
import { AccessDenied } from "./pages/AccessDenied";

const Dashboard = React.lazy(() => import("./pages/Dashboard").then(m => ({ default: m.Dashboard })));
const SafeRide = React.lazy(() => import("./pages/SafeRide").then(m => ({ default: m.SafeRide })));
const SOS = React.lazy(() => import("./pages/SOS").then(m => ({ default: m.SOS })));
const SyncCenter = React.lazy(() => import("./pages/SyncCenter").then(m => ({ default: m.SyncCenter })));
const FirstAid = React.lazy(() => import("./pages/FirstAid").then(m => ({ default: m.FirstAid })));
const SmartMap = React.lazy(() => import("./pages/SmartMap").then(m => ({ default: m.default })));
const Training = React.lazy(() => import("./pages/Training").then(m => ({ default: m.Training })));
const Community = React.lazy(() => import("./pages/Community").then(m => ({ default: m.Community })));
const TrainerDashboard = React.lazy(() => import("./pages/TrainerDashboard").then(m => ({ default: m.TrainerDashboard })));
const Impact = React.lazy(() => import("./pages/Impact").then(m => ({ default: m.Impact })));
const About = React.lazy(() => import("./pages/About").then(m => ({ default: m.About })));
const Team = React.lazy(() => import("./pages/Team").then(m => ({ default: m.Team })));
const ReportHazard = React.lazy(() => import("./pages/ReportHazard").then(m => ({ default: m.ReportHazard })));
const Profile = React.lazy(() => import("./pages/Profile").then(m => ({ default: m.Profile })));
const Notifications = React.lazy(() => import("./pages/Notifications").then(m => ({ default: m.Notifications })));
const MedicalWallet = React.lazy(() => import("./pages/MedicalWallet").then(m => ({ default: m.MedicalWallet })));
const EmergencyMedicalIDView = React.lazy(() => import("./pages/EmergencyMedicalIDView").then(m => ({ default: m.EmergencyMedicalIDView })));
const Search = React.lazy(() => import("./pages/Search").then(m => ({ default: m.Search })));
const Legal = React.lazy(() => import("./pages/Legal").then(m => ({ default: m.Legal })));

const NotFound = () => (
  <Placeholder 
    title="404 - Not Found" 
    description="The page you are looking for does not exist." 
    icon={AlertTriangle} 
  />
);

const FallbackLoader = () => (
  <div className="flex flex-col items-center justify-center min-h-[100dvh] w-full p-4 bg-surface-50 dark:bg-surface-950">
    <div className="flex-1 flex flex-col items-center justify-center">
      <div className="w-12 h-12 border-4 border-surface-200 dark:border-surface-700 border-t-primary-500 rounded-full animate-spin"></div>
      <p className="mt-4 text-surface-500 font-medium animate-pulse">Loading GoldenGuard...</p>
    </div>
    
    <div className="w-full max-w-lg mt-auto mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300 fill-mode-both">
      <EmergencyInstructions variant="inline" />
    </div>
  </div>
);

const SafeLazyRoute = ({ children }: { children: React.ReactNode }) => (
  <ErrorBoundary>
    <Suspense fallback={<FallbackLoader />}>
      {children}
    </Suspense>
  </ErrorBoundary>
);

const OfflineIndicator = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-red-600 text-white text-center py-2 px-4 shadow-lg flex items-center justify-center gap-2 animate-in slide-in-from-top-4 duration-300">
      <WifiOff className="w-4 h-4" />
      <span className="text-sm font-bold tracking-wide">You are currently offline. Some features may not be available.</span>
    </div>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="system" storageKey="goldenguard-theme">
        <AuthProvider>
          <OfflineSyncProvider>
            <IncidentProvider>
              <NotificationProvider>
                <PWAInstallProvider>
                  <Router basename={import.meta.env.BASE_URL}>
                    <VoiceSOSProvider>
                      <CrashDetectionProvider>
                        <PWAInstallBanner />
                        <PWAInstallModal />
                        <VoiceSOSModal />
                        <Routes>
                      {/* Standalone Lockscreen Emergency View */}
                      <Route path="/medical-id/view" element={<SafeLazyRoute><EmergencyMedicalIDView /></SafeLazyRoute>} />
                      <Route path="/emergency-id" element={<SafeLazyRoute><EmergencyMedicalIDView /></SafeLazyRoute>} />

                      <Route path="/" element={<Layout />}>
                        <Route index element={<SafeLazyRoute><Dashboard /></SafeLazyRoute>} />
                        <Route path="saferide" element={<SafeLazyRoute><SafeRide /></SafeLazyRoute>} />
                        <Route path="sos" element={
                          <ProtectedRoute requireProfileComplete={true}>
                            <SafeLazyRoute><SOS /></SafeLazyRoute>
                          </ProtectedRoute>
                        } />
                        <Route path="wallet" element={
                          <ProtectedRoute requireProfileComplete={true}>
                            <SafeLazyRoute><MedicalWallet /></SafeLazyRoute>
                          </ProtectedRoute>
                        } />
                        <Route path="medical-id" element={
                          <ProtectedRoute requireProfileComplete={true}>
                            <SafeLazyRoute><MedicalWallet /></SafeLazyRoute>
                          </ProtectedRoute>
                        } />
                        <Route path="sync" element={<SafeLazyRoute><SyncCenter /></SafeLazyRoute>} />
                        <Route path="first-aid" element={<SafeLazyRoute><FirstAid /></SafeLazyRoute>} />
                        <Route path="map" element={<SafeLazyRoute><SmartMap /></SafeLazyRoute>} />
                        <Route path="impact" element={<SafeLazyRoute><Impact /></SafeLazyRoute>} />
                        <Route path="about" element={<SafeLazyRoute><About /></SafeLazyRoute>} />
                        <Route path="team" element={<SafeLazyRoute><Team /></SafeLazyRoute>} />
                        <Route path="report" element={<SafeLazyRoute><ReportHazard /></SafeLazyRoute>} />
                        <Route path="training" element={<SafeLazyRoute><Training /></SafeLazyRoute>} />
                        <Route path="trainer" element={
                          <ProtectedRoute allowedRoles={["admin", "trainer"]}>
                            <SafeLazyRoute><TrainerDashboard /></SafeLazyRoute>
                          </ProtectedRoute>
                        } />
                        <Route path="community" element={<SafeLazyRoute><Community /></SafeLazyRoute>} />
                        <Route path="admin" element={
                          <ProtectedRoute allowedRoles={["admin"]}>
                            <SafeLazyRoute><Admin /></SafeLazyRoute>
                          </ProtectedRoute>
                        } />
                        <Route path="access-denied" element={<SafeLazyRoute><AccessDenied /></SafeLazyRoute>} />
                        <Route path="profile" element={<SafeLazyRoute><Profile /></SafeLazyRoute>} />
                        <Route path="notifications" element={<SafeLazyRoute><Notifications /></SafeLazyRoute>} />
                        <Route path="search" element={<SafeLazyRoute><Search /></SafeLazyRoute>} />
                        <Route path="legal" element={<SafeLazyRoute><Legal /></SafeLazyRoute>} />
                        <Route path="*" element={<NotFound />} />
                      </Route>
                    </Routes>
                  </CrashDetectionProvider>
                    </VoiceSOSProvider>
                </Router>
              </PWAInstallProvider>
            </NotificationProvider>
            </IncidentProvider>
          </OfflineSyncProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}


