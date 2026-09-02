import React from "react";
import { Modal } from "../ui/Modal";
import { Battery, Zap, AlertTriangle, X } from "lucide-react";
import { cn } from "../../lib/utils";

interface BatteryModalProps {
  isOpen: boolean;
  onClose: () => void;
  level: number;
  charging: boolean;
  isLow: boolean;
  isCritical: boolean;
  renderBatteryIcon: (size: string) => React.ReactElement;
}

export function BatteryModal({ isOpen, onClose, level, charging, isLow, isCritical, renderBatteryIcon }: BatteryModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Device Power Status">
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={cn("p-2 rounded-lg", isLow ? "bg-red-500 text-white" : "bg-primary-500 text-white")}>
              {renderBatteryIcon("w-5 h-5")}
            </div>
            <span className="text-2xl font-black">{level}%</span>
          </div>
          <span className={cn(
            "text-xs font-bold px-3 py-1 rounded-full",
            charging ? "bg-emerald-100 text-emerald-700" : isLow ? "bg-red-100 text-red-700" : "bg-surface-100 text-surface-600"
          )}>
            {charging ? "Charging" : isLow ? "Low Battery" : "Discharging"}
          </span>
        </div>

        <div className="w-full bg-surface-200 h-2 rounded-full overflow-hidden">
          <div
            className={cn("h-full", isCritical ? "bg-red-600" : isLow ? "bg-amber-500" : "bg-emerald-500")}
            style={{ width: `${level}%` }}
          />
        </div>

        {isLow && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <p>Device battery is low. Keep your charger plugged in so location telemetry & emergency crash detection remain uninterrupted.</p>
          </div>
        )}
      </div>
    </Modal>
  );
}
