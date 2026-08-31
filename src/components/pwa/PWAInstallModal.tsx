import React from "react";
import { 
  X, 
  Download, 
  Share, 
  PlusSquare, 
  CheckCircle2, 
  Smartphone, 
  ShieldCheck, 
  Zap, 
  WifiOff, 
  ExternalLink,
  ChevronRight
} from "lucide-react";
import { usePWAInstall } from "../../context/PWAInstallContext";

export function PWAInstallModal() {
  const { 
    isGuideOpen, 
    closeInstallGuide, 
    canPrompt, 
    installApp, 
    platformInfo,
    isInstalled 
  } = usePWAInstall();

  if (!isGuideOpen) return null;

  const { isIOS, isSafari, isAndroid } = platformInfo;

  const handlePromptClick = async () => {
    if (canPrompt) {
      await installApp();
      closeInstallGuide();
    }
  };

  return (
    <div 
      id="pwa-install-modal" 
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={closeInstallGuide}
    >
      <div 
        className="w-full sm:max-w-md bg-surface-900 border border-surface-700/80 rounded-t-3xl sm:rounded-3xl p-6 text-white shadow-2xl relative overflow-hidden max-h-[90vh] flex flex-col animate-in slide-in-from-bottom-8 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow accent */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-primary-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-start justify-between relative z-10 pb-4 border-b border-surface-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary-600 via-amber-500 to-red-500 p-0.5 shadow-lg shrink-0">
              <img 
                src="./icon-192.png" 
                alt="GoldenGuard Icon" 
                className="w-full h-full object-cover rounded-[14px]"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
            </div>
            <div>
              <h3 className="text-base font-black text-white tracking-tight flex items-center gap-1.5">
                Install GoldenGuard
                <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-primary-500/20 text-primary-400 border border-primary-500/30">
                  PWA
                </span>
              </h3>
              <p className="text-xs text-surface-400">
                Official Emergency & Lifesaver System
              </p>
            </div>
          </div>
          <button 
            type="button" 
            onClick={closeInstallGuide}
            className="p-2 rounded-xl text-surface-400 hover:text-white hover:bg-surface-800 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar py-4 space-y-4 relative z-10">
          
          {/* Key Advantages */}
          <div className="grid grid-cols-3 gap-2">
            <div className="p-2.5 rounded-xl bg-surface-800/60 border border-surface-700/50 text-center flex flex-col items-center justify-center">
              <Zap className="w-4 h-4 text-amber-400 mb-1" />
              <span className="text-[11px] font-bold text-white">1-Tap SOS</span>
              <span className="text-[9px] text-surface-400">Zero lag</span>
            </div>
            <div className="p-2.5 rounded-xl bg-surface-800/60 border border-surface-700/50 text-center flex flex-col items-center justify-center">
              <WifiOff className="w-4 h-4 text-emerald-400 mb-1" />
              <span className="text-[11px] font-bold text-white">100% Offline</span>
              <span className="text-[9px] text-surface-400">First-aid guides</span>
            </div>
            <div className="p-2.5 rounded-xl bg-surface-800/60 border border-surface-700/50 text-center flex flex-col items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-primary-400 mb-1" />
              <span className="text-[11px] font-bold text-white">Crash Sensor</span>
              <span className="text-[9px] text-surface-400">G-force alerts</span>
            </div>
          </div>

          {/* If browser supports direct native prompt */}
          {canPrompt ? (
            <div className="p-4 rounded-2xl bg-primary-950/40 border border-primary-500/40 text-center space-y-3">
              <p className="text-xs text-primary-200 font-medium">
                Your browser is ready for instant 1-click installation to your home screen or desktop.
              </p>
              <button
                type="button"
                onClick={handlePromptClick}
                className="w-full py-3 px-4 bg-gradient-to-r from-primary-500 to-amber-500 hover:from-primary-400 hover:to-amber-400 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-primary-950 flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Add GoldenGuard to Home Screen</span>
              </button>
            </div>
          ) : isIOS ? (
            /* iOS Safari Instructions */
            <div className="p-4 rounded-2xl bg-surface-800/80 border border-surface-700 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
                <Smartphone className="w-3.5 h-3.5" />
                <span>How to Install on iPhone / iPad</span>
              </div>
              <ol className="space-y-3 text-xs text-surface-300">
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-surface-700 text-white font-black text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </span>
                  <div className="flex-1 leading-relaxed">
                    Tap the <strong className="text-white">Share button</strong> (
                    <Share className="w-3.5 h-3.5 inline text-primary-400 mx-1" />
                    ) in Safari's bottom toolbar.
                  </div>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-surface-700 text-white font-black text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </span>
                  <div className="flex-1 leading-relaxed">
                    Scroll down and tap <strong className="text-white">"Add to Home Screen"</strong> (
                    <PlusSquare className="w-3.5 h-3.5 inline text-amber-400 mx-1" />
                    ).
                  </div>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-surface-700 text-white font-black text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                    3
                  </span>
                  <div className="flex-1 leading-relaxed">
                    Tap <strong className="text-white">"Add"</strong> in the top right corner to complete installation.
                  </div>
                </li>
              </ol>
            </div>
          ) : (
            /* Android / Desktop Chrome / Edge fallback instructions */
            <div className="p-4 rounded-2xl bg-surface-800/80 border border-surface-700 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
                <Smartphone className="w-3.5 h-3.5" />
                <span>How to Install on {isAndroid ? "Android" : "Desktop / Browser"}</span>
              </div>
              <ol className="space-y-3 text-xs text-surface-300">
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-surface-700 text-white font-black text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </span>
                  <div className="flex-1 leading-relaxed">
                    Open your browser's menu (<strong>⋮</strong> three dots in top-right or address bar icon).
                  </div>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-surface-700 text-white font-black text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </span>
                  <div className="flex-1 leading-relaxed">
                    Select <strong className="text-white">"Install GoldenGuard"</strong> or <strong className="text-white">"Add to Home screen"</strong>.
                  </div>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-surface-700 text-white font-black text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                    3
                  </span>
                  <div className="flex-1 leading-relaxed">
                    Confirm prompt to launch GoldenGuard directly from your home screen as a native application.
                  </div>
                </li>
              </ol>
            </div>
          )}

          {isInstalled && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-950/50 border border-emerald-500/40 text-emerald-300 text-xs font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>GoldenGuard is currently installed in standalone app mode!</span>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="pt-3 border-t border-surface-800 flex items-center justify-end gap-2 relative z-10">
          <button
            type="button"
            onClick={closeInstallGuide}
            className="w-full sm:w-auto px-5 py-2.5 bg-surface-800 hover:bg-surface-700 text-surface-200 hover:text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
