import React, { useState, useRef, useEffect } from "react";
import { Info, Mic, Volume2, ShieldAlert, X } from "lucide-react";
import { useVoiceSOS } from "../../context/VoiceSOSContext";
import { cn } from "../../lib/utils";

export function VoiceCommandsTooltip() {
  const [isOpen, setIsOpen] = useState(false);
  const { recognizedHotwords } = useVoiceSOS();
  const containerRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // High-priority words to highlight
  const primaryCommands = ["help me", "sos", "emergency", "call ambulance"];
  const secondaryCommands = recognizedHotwords.filter(w => !primaryCommands.includes(w)).slice(0, 8); // show a few more

  return (
    <div className="relative inline-flex items-center" ref={containerRef}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="p-1.5 rounded-full text-surface-400 hover:text-surface-600 dark:hover:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
        title="View Voice Commands"
      >
        <Info className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-[280px] sm:w-[320px] bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-700 shadow-xl rounded-2xl p-4 z-50 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2 text-surface-900 dark:text-white">
              <div className="p-1.5 bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400 rounded-lg">
                <Mic className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-sm">Voice Commands</h4>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-surface-400 hover:text-surface-600 dark:hover:text-surface-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-surface-600 dark:text-surface-400 mb-4 leading-relaxed">
            When Hands-Free SOS is active, say any of these phrases clearly to trigger an emergency dispatch.
          </p>

          <div className="space-y-4">
            <div>
              <h5 className="text-[10px] font-black uppercase tracking-wider text-surface-500 mb-2 flex items-center gap-1.5">
                <ShieldAlert className="w-3 h-3 text-red-500" />
                Primary Triggers
              </h5>
              <div className="flex flex-wrap gap-1.5">
                {primaryCommands.map(cmd => (
                  <span key={cmd} className="px-2 py-1 bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-500/30 rounded-lg text-xs font-bold capitalize shadow-sm">
                    "{cmd}"
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h5 className="text-[10px] font-black uppercase tracking-wider text-surface-500 mb-2">
                Supported Alternatives
              </h5>
              <div className="flex flex-wrap gap-1.5">
                {secondaryCommands.map(cmd => (
                  <span key={cmd} className="px-2 py-1 bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-300 border border-surface-200 dark:border-surface-700 rounded-lg text-[11px] font-semibold capitalize">
                    "{cmd}"
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-surface-100 dark:border-surface-800 flex items-start gap-2 text-[11px] text-surface-500 dark:text-surface-400 bg-surface-50 dark:bg-surface-800/50 p-2.5 rounded-xl">
            <Volume2 className="w-4 h-4 shrink-0 text-amber-500 mt-0.5" />
            <p>
              Once triggered, you have 5 seconds to say <strong>"Cancel"</strong> or <strong>"Stop"</strong> to abort a false alarm.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
