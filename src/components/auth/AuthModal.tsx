import React, { useState } from "react";
import { X, LogIn, Mail, Lock, User, ShieldCheck, CheckCircle2, AlertCircle, LogOut } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { getFriendlyAuthErrorMessage } from "../../lib/authUtils";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { 
    currentUser, 
    userProfile, 
    loginWithGoogle, 
    loginWithEmail, 
    signupWithEmail, 
    logout,
    isAdmin 
  } = useAuth();

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      await loginWithGoogle();
      onClose();
    } catch (err: any) {
      setError(getFriendlyAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === "login") {
        await loginWithEmail(email, password);
      } else {
        if (!name.trim()) throw new Error("Please enter your name");
        await signupWithEmail(email, password, name);
      }
      onClose();
    } catch (err: any) {
      if (err.code === 'auth/invalid-credential') {
        setError("Invalid email or password.");
      } else if (err.code === 'auth/email-already-in-use') {
        setError("Email already in use. Please sign in instead.");
      } else if (err.code === 'auth/weak-password') {
        setError("Password should be at least 6 characters.");
      } else {
        setError(err.message || "Authentication error");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (quickEmail: string, quickPass: string, quickName: string) => {
    setError(null);
    setLoading(true);
    try {
      try {
        await loginWithEmail(quickEmail, quickPass);
      } catch (loginErr: any) {
        // If account doesn't exist yet, auto create it
        if (loginErr.code === 'auth/user-not-found' || loginErr.code === 'auth/invalid-credential') {
          await signupWithEmail(quickEmail, quickPass, quickName);
        } else {
          throw loginErr;
        }
      }
      onClose();
    } catch (err: any) {
      setError(getFriendlyAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-surface-400 hover:text-surface-900 dark:hover:text-white hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {currentUser ? (
          /* User Logged In State */
          <div className="text-center space-y-5 pt-2">
            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-tr from-amber-500 to-red-600 p-1 shadow-xl relative">
              {userProfile?.photoURL ? (
                <img src={userProfile.photoURL} alt="Avatar" className="w-full h-full object-cover rounded-full" />
              ) : (
                <div className="w-full h-full rounded-full bg-surface-900 flex items-center justify-center text-white text-2xl font-black">
                  {userProfile?.name?.charAt(0) || "U"}
                </div>
              )}
              {isAdmin && (
                <div className="absolute -bottom-1 -right-1 bg-amber-500 text-black p-1 rounded-full border-2 border-white dark:border-surface-900" title="Admin User">
                  <ShieldCheck className="w-4 h-4" />
                </div>
              )}
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-black text-surface-900 dark:text-white">{userProfile?.name}</h3>
              <p className="text-xs text-surface-500">{userProfile?.email}</p>
              <div className="pt-2 flex justify-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-black ${
                  isAdmin 
                    ? "bg-amber-500 text-black shadow-md" 
                    : "bg-surface-200 dark:bg-surface-800 text-surface-700 dark:text-surface-300"
                }`}>
                  ROLE: {userProfile?.role?.toUpperCase()}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 capitalize">
                  {userProfile?.provider || "auth"} login
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-surface-200 dark:border-surface-800 flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-3 rounded-2xl bg-surface-100 hover:bg-surface-200 dark:bg-surface-800 dark:hover:bg-surface-700 font-bold text-xs text-surface-900 dark:text-white transition-all"
              >
                Close Window
              </button>
              <button
                onClick={() => { logout(); onClose(); }}
                className="py-3 px-5 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs flex items-center gap-2 transition-all shadow-md"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        ) : (
          /* Login / Signup Form */
          <div className="space-y-5">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-black">
                <LogIn className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-black text-surface-900 dark:text-white">
                {mode === "login" ? "Sign In to GoldenGuard" : "Create Samaritan Account"}
              </h2>
              <p className="text-xs text-surface-500">
                Synchronize Golden Hour dispatches, certifications & community posts.
              </p>
            </div>

            {error && (
              <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-semibold space-y-2">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              </div>
            )}

            {/* Google Sign In Button */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-2xl border-2 border-surface-200 dark:border-surface-700 hover:border-amber-500 bg-white dark:bg-surface-800 text-surface-900 dark:text-white font-extrabold text-xs flex items-center justify-center gap-3 transition-all shadow-sm active:scale-95 disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Continue with Google</span>
            </button>

            {/* Quick Samaritan Direct Sign-In Helper */}
            <div className="bg-surface-50 dark:bg-surface-800/60 p-3 rounded-2xl border border-surface-200 dark:border-surface-700/80 space-y-2">
              <span className="text-[10px] font-black uppercase text-surface-400 tracking-wider block">⚡ Quick Samaritan Sign-In</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickLogin("nitesh933438@gmail.com", "admin123456", "Admin Samaritan")}
                  disabled={loading}
                  className="py-2 px-2.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-xl text-[11px] font-extrabold border border-amber-500/30 transition-all text-center"
                >
                  Admin Access
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickLogin("samaritan@goldenguard.org", "samaritan123", "Good Samaritan Volunteer")}
                  disabled={loading}
                  className="py-2 px-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl text-[11px] font-extrabold border border-emerald-500/30 transition-all text-center"
                >
                  Volunteer Access
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="h-px flex-1 bg-surface-200 dark:bg-surface-800"></span>
              <span className="text-[10px] font-black uppercase text-surface-400">OR EMAIL</span>
              <span className="h-px flex-1 bg-surface-200 dark:bg-surface-800"></span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              {mode === "signup" && (
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Full Display Name"
                    className="w-full bg-surface-100 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-2xl py-3 pl-10 pr-4 text-xs font-semibold text-surface-900 dark:text-white placeholder-surface-400 outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                </div>
              )}

              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email Address"
                  className="w-full bg-surface-100 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-2xl py-3 pl-10 pr-4 text-xs font-semibold text-surface-900 dark:text-white placeholder-surface-400 outline-none focus:ring-2 focus:ring-amber-500"
                />
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
              </div>

              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full bg-surface-100 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-2xl py-3 pl-10 pr-4 text-xs font-semibold text-surface-900 dark:text-white placeholder-surface-400 outline-none focus:ring-2 focus:ring-amber-500"
                />
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs shadow-lg transition-all active:scale-95 disabled:opacity-50"
              >
                {loading ? "Processing..." : mode === "login" ? "Sign In" : "Register Samaritan Account"}
              </button>
            </form>

            <div className="text-center pt-2 border-t border-surface-200 dark:border-surface-800">
              <button
                onClick={() => setMode(mode === "login" ? "signup" : "login")}
                className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline"
              >
                {mode === "login" 
                  ? "Don't have an account? Create One" 
                  : "Already registered? Sign In"}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
