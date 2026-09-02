import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  ChevronDown, 
  ChevronUp, 
  ShieldCheck, 
  AlertTriangle, 
  Lock,
  Activity,
  Heart,
  User,
  Activity as ActivityIcon,
  ShieldAlert,
  Users
} from "lucide-react";
import { Logo } from "../ui/Logo";
import { useAuth } from "../../context/AuthContext";
import { PWAInstallButton } from "../pwa/PWAInstallButton";
import { motion, AnimatePresence } from "motion/react";

export function Footer() {
  const { currentUser, userProfile, isAdmin } = useAuth();
  const currentYear = new Date().getFullYear();
  const navigate = useNavigate();

  // Accordions for Mobile
  const [openSection, setOpenSection] = useState<string | null>(null);

  // System Health Check state
  const [systemStatus, setSystemStatus] = useState<"Operational" | "Degraded" | "Offline" | "Checking" | "System status unavailable">("Checking");

  useEffect(() => {
    let isMounted = true;
    const checkHealth = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000); // 4-second timeout limit

        const res = await fetch("/api/health", { signal: controller.signal });
        clearTimeout(timeoutId);

        if (res.ok) {
          const data = await res.json();
          if (data && data.status === "ok") {
            if (isMounted) setSystemStatus("Operational");
            return;
          }
        }
        if (isMounted) setSystemStatus("Degraded");
      } catch (err) {
        if (isMounted) {
          if (!navigator.onLine) {
            setSystemStatus("Offline");
          } else {
            setSystemStatus("System status unavailable");
          }
        }
      }
    };

    checkHealth();
    return () => {
      isMounted = false;
    };
  }, []);

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  const userRole = userProfile?.role || "citizen";

  // Quick Links
  const quickLinks = [
    { label: "Home", to: "/" },
    { label: "Emergency SOS", to: "/sos" },
    { label: "Report Road Hazard", to: "/report" },
    { label: "Smart Incident Map", to: "/map" },
    { label: "Road Safety", to: "/saferide" },
    { label: "CPR Academy", to: "/first-aid" },
    { label: "Good Samaritan", to: "/community" },
    { label: "Become a Volunteer", to: "/profile" },
  ];

  // Emergency & Safety
  const emergencyLinks = [
    { label: "Emergency SOS", to: "/sos" },
    { label: "Report Road Hazard", to: "/report" },
    { label: "Find Nearby Hospital", to: "/map" },
    { label: "Safety Guidelines", to: "/legal?doc=safety" },
    { label: "Emergency Contacts", to: "/wallet" },
  ];

  // Legal Links
  const legalLinks = [
    { label: "Privacy Policy", to: "/legal?doc=privacy" },
    { label: "Terms of Use", to: "/legal?doc=terms" },
    { label: "Safety Guidelines", to: "/legal?doc=safety" },
    { label: "Data & Consent", to: "/legal?doc=consent" },
    { label: "Accessibility", to: "/legal?doc=accessibility" },
  ];

  // Conditional Account Links
  const getAccountLinks = () => {
    if (isAdmin || userRole === "admin") {
      return [
        { label: "Admin Dashboard", to: "/admin?tab=dashboard", icon: ShieldAlert },
        { label: "User Management", to: "/admin?tab=users", icon: Users },
        { label: "Incident Management", to: "/admin?tab=emergencies", icon: ActivityIcon },
        { label: "Volunteer Management", to: "/admin?tab=volunteers", icon: Heart },
      ];
    } else if (userRole === "volunteer") {
      return [
        { label: "Volunteer Dashboard", to: "/community?tab=volunteer", icon: Heart },
        { label: "My Profile", to: "/profile", icon: User },
        { label: "Training", to: "/training", icon: ShieldCheck },
        { label: "Availability", to: "/profile", icon: Activity },
      ];
    } else {
      // Normal Citizens
      return [
        { label: "My Profile", to: "/profile", icon: User },
        { label: "Emergency Contacts", to: "/wallet", icon: ShieldCheck },
        { label: "Medical Profile", to: "/medical-id", icon: Activity },
      ];
    }
  };

  const accountLinks = getAccountLinks();
  const appVersion = import.meta.env.VITE_APP_VERSION || "1.0.0";

  return (
    <footer 
      id="app-footer" 
      className="border-t border-surface-200 dark:border-surface-800 bg-surface-100 dark:bg-[#070D19] text-surface-800 dark:text-surface-200 pt-16 pb-[calc(3rem+56px+env(safe-area-inset-bottom))] lg:pb-12 px-4 sm:px-8 mt-auto relative z-20 transition-colors duration-200"
      aria-label="GoldenGuard Page Footer"
    >
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Desktop & Tablet grid */}
        <div className="hidden md:grid grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12 pb-4">
          
          {/* COLUMN 1: BRAND SECTION (Largest width) */}
          <div className="col-span-2 space-y-4">
            <Logo size="md" variant="auto" />
            
            <p className="text-xs text-surface-600 dark:text-surface-400 leading-relaxed max-w-sm font-medium">
              Helping citizens report road hazards, request emergency assistance, and connect with nearby safety resources.
            </p>

            <div className="pt-2 flex flex-col gap-2">
              <PWAInstallButton variant="pill" />
              <p className="text-[10px] text-surface-500 dark:text-surface-500 leading-relaxed max-w-sm italic border-l-2 border-surface-300 dark:border-surface-800 pl-3">
                "GoldenGuard is a safety assistance platform. In a life-threatening emergency, contact your local emergency services."
              </p>
            </div>
          </div>

          {/* COLUMN 2: QUICK LINKS */}
          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase text-surface-700 dark:text-surface-400 tracking-wider">
              Quick Links
            </h4>
            <nav aria-label="Footer Quick Links">
              <ul className="space-y-3">
                {quickLinks.map((link) => (
                  <li key={link.label}>
                    <Link 
                      to={link.to} 
                      className="text-xs font-semibold text-surface-600 dark:text-surface-300 hover:text-amber-600 dark:hover:text-amber-500 transition-colors focus:outline-none focus:ring-1 focus:ring-amber-500 focus:ring-offset-1 rounded px-1 py-0.5"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* COLUMN 3: EMERGENCY & SAFETY */}
          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase text-surface-700 dark:text-surface-400 tracking-wider">
              Emergency & Safety
            </h4>
            <nav aria-label="Footer Emergency and Safety links">
              <ul className="space-y-3">
                {emergencyLinks.map((link) => (
                  <li key={link.label}>
                    <Link 
                      to={link.to} 
                      className="text-xs font-semibold text-surface-600 dark:text-surface-300 hover:text-amber-600 dark:hover:text-amber-500 transition-colors focus:outline-none focus:ring-1 focus:ring-amber-500 focus:ring-offset-1 rounded px-1 py-0.5"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* COLUMN 4: CONDITIONAL ACCOUNT */}
          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase text-surface-700 dark:text-surface-400 tracking-wider flex items-center gap-1.5">
              Account 
              <span className="text-[10px] text-amber-600 dark:text-amber-500 font-black lowercase bg-amber-500/10 px-1.5 py-0.5 rounded">
                {userRole}
              </span>
            </h4>
            <nav aria-label="Footer Account options">
              <ul className="space-y-3">
                {accountLinks.map((link) => (
                  <li key={link.label}>
                    <Link 
                      to={link.to} 
                      className="text-xs font-semibold text-surface-600 dark:text-surface-300 hover:text-amber-600 dark:hover:text-amber-500 transition-colors flex items-center gap-2 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:ring-offset-1 rounded px-1 py-0.5"
                    >
                      {React.createElement(link.icon, { className: "w-3.5 h-3.5 shrink-0 text-surface-500" })}
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

        </div>

        {/* Mobile Viewports (Accordions / Collapsible) */}
        <div className="block md:hidden space-y-4">
          {/* Mobile Brand Info */}
          <div className="space-y-3 pb-4 border-b border-surface-200 dark:border-surface-800">
            <Logo size="md" variant="auto" />
            <p className="text-xs text-surface-600 dark:text-surface-400 leading-relaxed font-medium">
              Helping citizens report road hazards, request emergency assistance, and connect with nearby safety resources.
            </p>
            <p className="text-[10px] text-surface-500 italic">
              GoldenGuard is a safety assistance platform. In a life-threatening emergency, contact your local emergency services.
            </p>
          </div>

          {/* Quick Links Accordion */}
          <div className="border-b border-surface-200 dark:border-surface-800 pb-2">
            <button
              onClick={() => toggleSection("quickLinks")}
              aria-expanded={openSection === "quickLinks"}
              aria-controls="mobile-quicklinks"
              className="w-full flex items-center justify-between py-2 text-xs font-black uppercase text-surface-700 dark:text-surface-300 tracking-wider focus:outline-none min-h-[44px]"
            >
              <span>Quick Links</span>
              {openSection === "quickLinks" ? <ChevronUp className="w-4 h-4 text-amber-500" /> : <ChevronDown className="w-4 h-4 text-surface-500" />}
            </button>
            <motion.div
              id="mobile-quicklinks"
              initial={false}
              animate={{ height: openSection === "quickLinks" ? "auto" : 0, opacity: openSection === "quickLinks" ? 1 : 0 }}
              transition={{ duration: 0.15 }}
              className="overflow-hidden"
            >
              <ul className="py-2 pl-2 space-y-3">
                {quickLinks.map((link) => (
                  <li key={link.label}>
                    <Link 
                      to={link.to} 
                      className="text-xs font-semibold text-surface-600 dark:text-surface-400 hover:text-amber-600 dark:hover:text-amber-500 transition-colors block min-h-[36px] flex items-center"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>

          {/* Emergency Safety Accordion */}
          <div className="border-b border-surface-200 dark:border-surface-800 pb-2">
            <button
              onClick={() => toggleSection("emergency")}
              aria-expanded={openSection === "emergency"}
              aria-controls="mobile-emergency"
              className="w-full flex items-center justify-between py-2 text-xs font-black uppercase text-surface-700 dark:text-surface-300 tracking-wider focus:outline-none min-h-[44px]"
            >
              <span>Emergency & Safety</span>
              {openSection === "emergency" ? <ChevronUp className="w-4 h-4 text-amber-500" /> : <ChevronDown className="w-4 h-4 text-surface-500" />}
            </button>
            <motion.div
              id="mobile-emergency"
              initial={false}
              animate={{ height: openSection === "emergency" ? "auto" : 0, opacity: openSection === "emergency" ? 1 : 0 }}
              transition={{ duration: 0.15 }}
              className="overflow-hidden"
            >
              <ul className="py-2 pl-2 space-y-3">
                {emergencyLinks.map((link) => (
                  <li key={link.label}>
                    <Link 
                      to={link.to} 
                      className="text-xs font-semibold text-surface-600 dark:text-surface-400 hover:text-amber-600 dark:hover:text-amber-500 transition-colors block min-h-[36px] flex items-center"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>

          {/* Account Accordion */}
          <div className="border-b border-surface-200 dark:border-surface-800 pb-2">
            <button
              onClick={() => toggleSection("account")}
              aria-expanded={openSection === "account"}
              aria-controls="mobile-account"
              className="w-full flex items-center justify-between py-2 text-xs font-black uppercase text-surface-700 dark:text-surface-300 tracking-wider focus:outline-none min-h-[44px]"
            >
              <span className="flex items-center gap-1.5">
                Account 
                <span className="text-[10px] text-amber-600 dark:text-amber-500 font-bold lowercase bg-amber-500/10 px-1 py-0.5 rounded">
                  {userRole}
                </span>
              </span>
              {openSection === "account" ? <ChevronUp className="w-4 h-4 text-amber-500" /> : <ChevronDown className="w-4 h-4 text-surface-500" />}
            </button>
            <motion.div
              id="mobile-account"
              initial={false}
              animate={{ height: openSection === "account" ? "auto" : 0, opacity: openSection === "account" ? 1 : 0 }}
              transition={{ duration: 0.15 }}
              className="overflow-hidden"
            >
              <ul className="py-2 pl-2 space-y-3">
                {accountLinks.map((link) => (
                  <li key={link.label}>
                    <Link 
                      to={link.to} 
                      className="text-xs font-semibold text-surface-600 dark:text-surface-400 hover:text-amber-600 dark:hover:text-amber-500 transition-colors flex items-center gap-2 min-h-[36px]"
                    >
                      {React.createElement(link.icon, { className: "w-3.5 h-3.5 text-surface-500" })}
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>

          {/* Legal Accordion */}
          <div className="border-b border-surface-200 dark:border-surface-800 pb-2">
            <button
              onClick={() => toggleSection("legal")}
              aria-expanded={openSection === "legal"}
              aria-controls="mobile-legal"
              className="w-full flex items-center justify-between py-2 text-xs font-black uppercase text-surface-700 dark:text-surface-300 tracking-wider focus:outline-none min-h-[44px]"
            >
              <span>Legal & Privacy</span>
              {openSection === "legal" ? <ChevronUp className="w-4 h-4 text-amber-500" /> : <ChevronDown className="w-4 h-4 text-surface-500" />}
            </button>
            <motion.div
              id="mobile-legal"
              initial={false}
              animate={{ height: openSection === "legal" ? "auto" : 0, opacity: openSection === "legal" ? 1 : 0 }}
              transition={{ duration: 0.15 }}
              className="overflow-hidden"
            >
              <ul className="py-2 pl-2 space-y-3">
                {legalLinks.map((link) => (
                  <li key={link.label}>
                    <Link 
                      to={link.to} 
                      className="text-xs font-semibold text-surface-600 dark:text-surface-400 hover:text-amber-600 dark:hover:text-amber-500 transition-colors block min-h-[36px] flex items-center"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>

        {/* Legal Links Desktop Row */}
        <div className="hidden md:flex flex-wrap items-center gap-x-6 gap-y-2 py-4 border-b border-surface-200 dark:border-surface-800/60 text-xs">
          <span className="font-black uppercase text-surface-500 select-none">
            Legal & Privacy:
          </span>
          {legalLinks.map((link) => (
            <Link 
              key={link.label} 
              to={link.to} 
              className="font-semibold text-surface-600 dark:text-surface-400 hover:text-amber-600 dark:hover:text-amber-500 transition-colors focus:outline-none focus:underline"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Safety Disclaimer and System Info Footer Bar */}
        <div className="space-y-6 pt-2">
          
          {/* COMPACT SAFETY DISCLAIMER (Mandated) */}
          <div className="bg-white dark:bg-[#0e172a]/60 border border-surface-200 dark:border-surface-800/80 rounded-2xl p-4 flex flex-col sm:flex-row items-start gap-3.5 text-xs shadow-xs">
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-surface-600 dark:text-surface-400 leading-normal font-medium text-[11px] sm:text-xs">
              <span className="font-extrabold text-amber-600 dark:text-amber-500 block sm:inline mr-1">Official Safety Disclaimer:</span>
              GoldenGuard provides safety assistance and information. It does not replace professional emergency services, medical care, police, ambulance services, or fire services.
            </p>
          </div>

          {/* Bottom Copyright & Status row */}
          <div className="flex flex-col md:flex-row items-center justify-between border-t border-surface-200 dark:border-surface-800/60 pt-6 text-xs text-surface-500 gap-4">
            
            <div className="text-center md:text-left space-y-1">
              <p className="font-extrabold text-surface-700 dark:text-surface-300">
                © 2026 GoldenGuard — Automated Road Safety & SOS
              </p>
              <p className="text-[10px] text-surface-500">
                Built for safer roads and faster emergency response.
              </p>
            </div>

            {/* REAL SYSTEM STATUS & VERSION */}
            <div className="flex items-center gap-4 flex-wrap justify-center text-[10px]">
              
              {/* REAL STATUS INDICATOR */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 font-extrabold tracking-wide uppercase select-none shadow-xs">
                {systemStatus === "Checking" && (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-surface-500 animate-pulse"></span>
                    <span className="text-surface-600 dark:text-surface-400">Status Check...</span>
                  </>
                )}
                {systemStatus === "Operational" && (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-emerald-600 dark:text-emerald-400">Operational</span>
                  </>
                )}
                {systemStatus === "Degraded" && (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                    <span className="text-amber-600 dark:text-amber-400">Degraded</span>
                  </>
                )}
                {systemStatus === "Offline" && (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                    <span className="text-red-600 dark:text-red-400">Offline</span>
                  </>
                )}
                {systemStatus === "System status unavailable" && (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-surface-600"></span>
                    <span className="text-surface-600 dark:text-surface-400">System status unavailable</span>
                  </>
                )}
              </div>

              {/* Package version read from actual package.json */}
              <span className="font-black text-surface-600 dark:text-surface-400 px-2 py-1 rounded bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 shadow-xs">
                GoldenGuard v{appVersion}
              </span>
            </div>

          </div>

        </div>

      </div>
    </footer>
  );
}
