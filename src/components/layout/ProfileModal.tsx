import React from "react";
import { Link } from "react-router-dom";
import { Modal } from "../ui/Modal";
import { LogOut, User, ShieldAlert, Bike, Award, CheckCircle2, Lock } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: any;
  userProfile: any;
  isAdmin: boolean;
  logout: () => Promise<void>;
  isOnline: boolean;
  pendingCount: number;
}

export function ProfileModal({ 
  isOpen, onClose, currentUser, userProfile, isAdmin, logout, isOnline, pendingCount 
}: ProfileModalProps) {
  if (!isOpen) return null;
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Account & Settings" position="top-right">
      {/* User Profile Card Header */}
      <div className="p-4 bg-gradient-to-br from-surface-50 to-amber-500/10 dark:from-surface-850 dark:to-surface-900 flex items-center gap-3 border-b border-surface-200 dark:border-surface-800">
        <div className="w-12 h-12 rounded-xl bg-amber-500 text-black font-black text-xl flex items-center justify-center shrink-0 shadow-xs ring-2 ring-amber-500/40 overflow-hidden">
          {userProfile?.photoURL ? (
            <img src={userProfile.photoURL} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            userProfile?.name?.charAt(0).toUpperCase() || "U"
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <h4 className="font-black text-sm text-surface-900 dark:text-white truncate">
              {userProfile?.name || currentUser?.displayName || "GoldenGuard User"}
            </h4>
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          </div>
          <p className="text-xs text-surface-500 truncate">{currentUser?.email || ""}</p>
          <div className="mt-1 flex items-center gap-1.5">
            <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 text-[10px] font-black uppercase">
              {userProfile?.role || "Verified Samaritan"}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="p-2 space-y-1">
        <Link to="/profile" onClick={onClose} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-surface-700 dark:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors">
          <User className="w-5 h-5 text-amber-500" />
          <span>My Profile & Emergency Medical ID</span>
        </Link>
        <Link to="/wallet" onClick={onClose} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-surface-700 dark:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors">
          <ShieldAlert className="w-5 h-5 text-red-500" />
          <span>Emergency Medical Wallet Card</span>
        </Link>
        <Link to="/saferide" onClick={onClose} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-surface-700 dark:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors">
          <Bike className="w-5 h-5 text-blue-500" />
          <span>SafeRide Telemetry & Crash Guard</span>
        </Link>
        <Link to="/training" onClick={onClose} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-surface-700 dark:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors">
          <Award className="w-5 h-5 text-emerald-500" />
          <span>First Aid Certificates & Badges</span>
        </Link>
        {isAdmin && (
          <Link to="/admin" onClick={onClose} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-black text-red-600 dark:text-red-400 bg-red-500/10 hover:bg-red-500/20 transition-colors">
            <Lock className="w-5 h-5" />
            <span>Admin Control Center</span>
          </Link>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-surface-200 dark:border-surface-800 bg-surface-50 dark:bg-surface-900">
        <button
          onClick={async () => { onClose(); await logout(); }}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold text-red-500 hover:bg-red-500/10 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Sign Out</span>
        </button>
      </div>
    </Modal>
  );
}
