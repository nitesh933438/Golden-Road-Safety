import React from "react";
import { AlertTriangle, Phone, Mic } from "lucide-react";
import { cn } from "../../lib/utils";

interface EmergencyInstructionsProps {
  className?: string;
  variant?: "inline" | "overlay";
}

export function EmergencyInstructions({ className, variant = "inline" }: EmergencyInstructionsProps) {
  return (
    <div
      className={cn(
        "bg-white dark:bg-surface-900 border-2 border-red-500/30 rounded-2xl p-4 sm:p-5 shadow-lg shadow-red-500/5 overflow-hidden relative",
        variant === "overlay" && "absolute z-50 bottom-4 left-4 right-4 sm:static sm:mb-4 max-w-lg mx-auto",
        className
      )}
    >
      <div className="absolute top-0 left-0 w-1.5 h-full bg-red-500" />
      
      <div className="flex items-start gap-3">
        <div className="p-2 bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 rounded-xl shrink-0 mt-0.5">
          <AlertTriangle className="w-5 h-5" />
        </div>
        
        <div>
          <h4 className="text-sm sm:text-base font-black text-red-600 dark:text-red-400 uppercase tracking-widest mb-1.5">
            Emergency Use Only
          </h4>
          <p className="text-xs sm:text-sm text-surface-600 dark:text-surface-300 leading-relaxed font-medium mb-3">
            This device belongs to a protected user. If you are a first responder or bystander:
          </p>
          
          <div className="space-y-2.5">
            <div className="flex items-center gap-2.5 text-xs sm:text-sm text-surface-700 dark:text-surface-200 bg-surface-50 dark:bg-surface-800/50 p-2 rounded-lg">
              <Phone className="w-4 h-4 text-amber-500" />
              <span>Tap <strong>Emergency Info</strong> to access critical medical records.</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs sm:text-sm text-surface-700 dark:text-surface-200 bg-surface-50 dark:bg-surface-800/50 p-2 rounded-lg">
              <Mic className="w-4 h-4 text-red-500" />
              <span>Say <strong>"SOS"</strong> or <strong>"Help me"</strong> to trigger hands-free dispatch.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
