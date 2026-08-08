import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShieldAlert, ArrowLeft, Lock, UserCheck, Shield } from "lucide-react";
import { useAuth } from "../context/AuthContext";

interface AccessDeniedProps {
  requiredRoles?: string[];
  message?: string;
}

export function AccessDenied({ requiredRoles, message }: AccessDeniedProps) {
  const navigate = useNavigate();
  const { userProfile, currentUser, logout } = useAuth();
  const currentRole = userProfile?.role || "user";

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] p-4 sm:p-8 animate-in fade-in duration-300">
      <div className="bg-white/90 dark:bg-surface-900/90 backdrop-blur-xl border border-surface-200 dark:border-surface-800 p-8 sm:p-10 rounded-3xl shadow-2xl text-center max-w-lg w-full space-y-6 relative overflow-hidden">
        
        {/* Top Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-600 via-amber-500 to-red-600"></div>

        {/* Warning Badge Icon */}
        <div className="relative mx-auto w-20 h-20 rounded-2xl bg-red-500/10 dark:bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-500 shadow-inner">
          <ShieldAlert className="w-10 h-10 animate-bounce" />
          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center text-xs">
            <Lock className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Text Details */}
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-black text-surface-900 dark:text-white tracking-tight">
            Access Restricted
          </h1>
          <p className="text-xs sm:text-sm text-surface-600 dark:text-surface-300 leading-relaxed">
            {message || "You do not have permission to access this protected area."}
          </p>
        </div>

        {/* Role Identity Box */}
        <div className="bg-surface-50 dark:bg-surface-800/60 p-4 rounded-2xl border border-surface-200 dark:border-surface-700/60 text-left space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-surface-500">
            <span>Your Account Identity</span>
            <span className="font-mono text-[10px] text-amber-500">
              {currentUser ? currentUser.email : "Guest User"}
            </span>
          </div>
          
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-black uppercase text-surface-900 dark:text-white">Current Role:</span>
            </div>
            <span className={`px-2.5 py-1 rounded-lg text-xs font-black uppercase tracking-wider ${
              currentRole === "admin" 
                ? "bg-red-500/20 text-red-400 border border-red-500/30"
                : currentRole === "trainer"
                ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
            }`}>
              {currentRole}
            </span>
          </div>

          {requiredRoles && requiredRoles.length > 0 && (
            <div className="text-[11px] text-surface-500 pt-2 border-t border-surface-200 dark:border-surface-700/50 flex items-center justify-between">
              <span>Required Role Authorization:</span>
              <span className="font-extrabold text-red-500 uppercase">
                {requiredRoles.join(" OR ")}
              </span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <Link
            to="/"
            className="w-full sm:flex-1 py-3 px-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs transition-all shadow-lg flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Dashboard</span>
          </Link>

          {currentUser && (
            <button
              onClick={logout}
              className="w-full sm:w-auto py-3 px-4 rounded-2xl bg-surface-200 dark:bg-surface-800 hover:bg-surface-300 dark:hover:bg-surface-700 text-surface-900 dark:text-white font-bold text-xs transition-colors"
            >
              Sign Out & Switch Account
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
