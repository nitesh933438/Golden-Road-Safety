import React from 'react';
import { useAuth, AppRole } from '../../context/AuthContext';
import { AccessDenied } from '../../pages/AccessDenied';
import { CompleteProfile } from './CompleteProfile';
import { Shield, Key } from 'lucide-react';

export const ProtectedRoute = ({ 
  children, 
  allowedRoles,
  requireProfileComplete = false
}: { 
  children: React.ReactNode; 
  allowedRoles?: AppRole[];
  requireProfileComplete?: boolean;
}) => {
  const { currentUser, userProfile, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-8rem)] w-full">
        <div className="w-12 h-12 border-4 border-surface-200 dark:border-surface-700 border-t-amber-500 rounded-full animate-spin"></div>
        <p className="mt-4 text-surface-400 font-medium animate-pulse">Checking authorization...</p>
      </div>
    );
  }

  // 1. Not Logged In Protection
  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-3xl shadow-xl text-center space-y-6">
        <div className="inline-flex p-4 bg-amber-500/10 text-amber-500 rounded-2xl">
          <Key className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-surface-900 dark:text-white tracking-tight">Sign In Required</h2>
          <p className="text-sm text-surface-500 leading-relaxed">
            Please sign in or register an account to access this secure emergency feature.
          </p>
        </div>
        <div className="pt-2">
          <button
            onClick={() => {
              // Dispatch event to open auth modal globally
              window.dispatchEvent(new CustomEvent("open-auth-modal"));
            }}
            className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs tracking-wide shadow-md transition-all uppercase"
          >
            Access Security Gateway
          </button>
        </div>
      </div>
    );
  }

  // 2. Profile Complete Gate (Bypassed for Admins)
  const isComplete = userProfile?.isProfileComplete !== false && userProfile?.profileCompleted !== false;
  if (requireProfileComplete && !isComplete && !isAdmin) {
    return (
      <div className="space-y-6">
        <div className="max-w-3xl mx-auto p-4 bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/30 text-amber-800 dark:text-amber-200 rounded-2xl flex items-center gap-3 shadow-xs">
          <Shield className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
          <span className="text-xs font-bold leading-normal">
            Complete your profile to use emergency features. GoldenGuard requires authentic details to verify identity during emergency dispatches.
          </span>
        </div>
        <CompleteProfile />
      </div>
    );
  }

  const role = userProfile?.role || "citizen";
  
  // Admin has access to all routes; otherwise check if role is in allowedRoles
  if (allowedRoles && !allowedRoles.includes(role) && !isAdmin) {
    return <AccessDenied requiredRoles={allowedRoles} />;
  }

  return <>{children}</>;
};