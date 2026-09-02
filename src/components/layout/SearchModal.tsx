import React from "react";
import { Modal } from "../ui/Modal";
import { SmartInput } from "../ui/SmartInput";
import { useNavigate } from "react-router-dom";
import { Shield, ShieldAlert, Stethoscope, MapPin, User } from "lucide-react";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  headerSearch: string;
  setHeaderSearch: (value: string) => void;
}

export function SearchModal({ isOpen, onClose, headerSearch, setHeaderSearch }: SearchModalProps) {
  const navigate = useNavigate();
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="GoldenGuard Smart Search" position="top-right">
      <div className="p-4 space-y-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (headerSearch.trim()) {
              onClose();
              navigate(`/search?q=${encodeURIComponent(headerSearch.trim())}`);
            }
          }}
        >
          <SmartInput
            value={headerSearch}
            onChange={setHeaderSearch}
            onSelectSuggestion={(suggestion) => {
              onClose();
              navigate(`/search?q=${encodeURIComponent(suggestion)}`);
            }}
            placeholder="Type CPR, Hospitals, Police, Hazards, Volunteers..."
            historyKey="mobile_global_search"
            suggestions={[
              "AIIMS Level-1 Trauma Center ICU Bed",
              "Severe Bleeding 30:2 CPR Guide",
              "Highway Patrol Squad 4 Dispatch",
              "Report Oil Spill / Pothole Road Hazard",
              "Rahul Verma (Certified CPR Samaritan)",
              "Emergency Medical ID QR Scan",
              "Trigger 1-Tap Golden Hour SOS"
            ]}
            showVoiceInput={true}
            enableAIIntent={true}
            inputClassName="py-3 text-sm bg-surface-100 dark:bg-surface-800 border-none rounded-2xl"
          />
        </form>

        <div className="space-y-3">
          <span className="text-xs font-black uppercase text-surface-400 tracking-wider">Quick Navigation</span>
          <div className="grid grid-cols-2 gap-2.5">
            <button onClick={() => { onClose(); navigate("/sos"); }} className="p-3 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-500 font-extrabold text-xs flex items-center gap-2">
              <ShieldAlert className="w-4 h-4" /> 1-Tap Golden SOS
            </button>
            <button onClick={() => { onClose(); navigate("/first-aid"); }} className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-500 font-extrabold text-xs flex items-center gap-2">
              <Stethoscope className="w-4 h-4" /> AI First Aid Assistant
            </button>
            <button onClick={() => { onClose(); navigate("/map"); }} className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-500 font-extrabold text-xs flex items-center gap-2">
              <MapPin className="w-4 h-4" /> Smart Resource Map
            </button>
            <button onClick={() => { onClose(); navigate("/wallet"); }} className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-500 font-extrabold text-xs flex items-center gap-2">
              <User className="w-4 h-4" /> Emergency Medical Wallet
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
