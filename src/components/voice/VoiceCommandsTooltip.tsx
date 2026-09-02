import React, { useState } from "react";
import { Info, Mic, Volume2, X } from "lucide-react";
import { useVoiceSOS } from "../../context/VoiceSOSContext";
import { cn } from "../../lib/utils";
import { Modal } from "../ui/Modal";

export function VoiceCommandsTooltip() {
  const [isOpen, setIsOpen] = useState(false);
  const { recognizedHotwords } = useVoiceSOS();

  // High-priority words to highlight
  const primaryCommands = ["help me", "sos", "emergency", "call ambulance"];
  const secondaryCommands = recognizedHotwords.filter(w => !primaryCommands.includes(w)).slice(0, 8); // show a few more

  return (
    <div className="relative inline-flex items-center">
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

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Voice SOS">
        <div className="flex-1 overflow-y-auto flex flex-col items-center justify-center p-6 space-y-8 custom-scrollbar pb-6">
          {/* Mic Status */}
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="p-6 bg-amber-500/10 text-amber-500 rounded-full animate-pulse">
              <Mic className="w-12 h-12" />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-surface-950 dark:text-white">Listening for Voice SOS</h2>
              <p className="text-surface-500 dark:text-surface-400">Say a command clearly to trigger dispatch</p>
            </div>
          </div>

          {/* Commands */}
          <div className="w-full max-w-lg space-y-6">
            <div>
              <h5 className="text-xs font-bold uppercase tracking-wider text-surface-500 mb-4 text-center">
                Primary Triggers
              </h5>
              <div className="flex flex-wrap justify-center gap-3">
                {primaryCommands.map(cmd => (
                  <span key={cmd} className="px-6 py-3 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800/50 rounded-2xl text-lg font-bold capitalize shadow-sm">
                    "{cmd}"
                  </span>
                ))}
              </div>
            </div>

            {secondaryCommands.length > 0 && (
              <div>
                <h5 className="text-xs font-bold uppercase tracking-wider text-surface-500 mb-4 text-center">
                  Alternatives
                </h5>
                <div className="flex flex-wrap justify-center gap-2">
                  {secondaryCommands.map(cmd => (
                    <span key={cmd} className="px-4 py-2 bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-300 rounded-xl text-sm font-medium capitalize">
                      "{cmd}"
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Warning */}
          <div className="w-full max-w-lg flex items-start gap-4 text-sm text-surface-700 dark:text-surface-200 bg-amber-50/50 dark:bg-amber-950/20 p-5 rounded-2xl border border-amber-200/50 dark:border-amber-900/30">
            <Volume2 className="w-6 h-6 shrink-0 text-amber-600 dark:text-amber-400" />
            <p className="leading-relaxed">
              Once triggered, you have <strong>5 seconds</strong> to say <strong>"Cancel"</strong> or <strong>"Stop"</strong> to abort.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
}
