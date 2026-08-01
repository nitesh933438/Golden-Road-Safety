import React, { useState, useEffect, useRef, KeyboardEvent } from "react";
import { 
  Search, CheckCircle2, AlertCircle, Mic, MicOff, X, 
  Sparkles, History, ArrowRight, ShieldAlert, ChevronDown
} from "lucide-react";
import { ValidationRules, ValidationResult } from "../../lib/validation";
import { detectAIIntent, AIIntentSuggestion } from "../../lib/aiIntent";
import { useNavigate } from "react-router-dom";

export interface SmartInputProps {
  value: string;
  onChange: (value: string) => void;
  onSelectSuggestion?: (suggestion: string) => void;
  placeholder?: string;
  label?: string;
  validationType?: "email" | "phone" | "pincode" | "vehicleNumber" | "bloodGroup" | "name" | "latLng";
  suggestions?: string[];
  historyKey?: string;
  showVoiceInput?: boolean;
  enableAIIntent?: boolean;
  className?: string;
  inputClassName?: string;
  disabled?: boolean;
  id?: string;
  required?: boolean;
}

export function SmartInput({
  value,
  onChange,
  onSelectSuggestion,
  placeholder = "Type or search...",
  label,
  validationType,
  suggestions = [],
  historyKey,
  showVoiceInput = true,
  enableAIIntent = true,
  className = "",
  inputClassName = "",
  disabled = false,
  id,
  required = false
}: SmartInputProps) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [isListening, setIsListening] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Validation state
  const [validation, setValidation] = useState<ValidationResult>({ isValid: true });

  // AI Intent State
  const [aiIntent, setAiIntent] = useState<AIIntentSuggestion | null>(null);

  // Load History
  useEffect(() => {
    if (historyKey) {
      try {
        const stored = localStorage.getItem(`gg_input_hist_${historyKey}`);
        if (stored) setHistory(JSON.parse(stored));
      } catch (e) {
        console.warn("Error loading input history", e);
      }
    }
  }, [historyKey]);

  // Save item to history
  const saveToHistory = (item: string) => {
    if (!historyKey || !item.trim()) return;
    const updated = [item, ...history.filter(h => h.toLowerCase() !== item.toLowerCase())].slice(0, 5);
    setHistory(updated);
    try {
      localStorage.setItem(`gg_input_hist_${historyKey}`, JSON.stringify(updated));
    } catch (e) {
      console.warn("Error saving input history", e);
    }
  };

  // Run validation on typing
  useEffect(() => {
    if (validationType && ValidationRules[validationType]) {
      const res = ValidationRules[validationType](value);
      setValidation(res);
      if (res.formattedValue && res.formattedValue !== value) {
        onChange(res.formattedValue);
      }
    } else {
      setValidation({ isValid: true });
    }

    // AI Intent check
    if (enableAIIntent) {
      setAiIntent(detectAIIntent(value));
    }
  }, [value, validationType, enableAIIntent]);

  // Filter suggestions
  const filteredSuggestions = suggestions.filter(s => 
    s.toLowerCase().includes(value.toLowerCase()) && s.toLowerCase() !== value.toLowerCase()
  );

  // Combined dropdown list (AI Intent, Suggestions, History)
  const totalDropdownItems = [
    ...filteredSuggestions,
    ...(history.filter(h => !filteredSuggestions.includes(h) && h.toLowerCase().includes(value.toLowerCase())))
  ];

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Voice Search / Dictation
  const toggleVoiceInput = () => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      alert("Voice speech recognition is not supported in this browser.");
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-US";

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        onChange(transcript);
        saveToHistory(transcript);
        setIsOpen(true);
      };

      recognition.start();
    } catch (e) {
      console.error("Speech recognition error:", e);
      setIsListening(false);
    }
  };

  // Keyboard Navigation
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setIsOpen(true);
      setHighlightedIndex(prev => (prev < totalDropdownItems.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setIsOpen(true);
      setHighlightedIndex(prev => (prev > 0 ? prev - 1 : totalDropdownItems.length - 1));
    } else if (e.key === "Enter") {
      if (isOpen && highlightedIndex >= 0 && totalDropdownItems[highlightedIndex]) {
        e.preventDefault();
        const selected = totalDropdownItems[highlightedIndex];
        onChange(selected);
        if (onSelectSuggestion) onSelectSuggestion(selected);
        saveToHistory(selected);
        setIsOpen(false);
      } else if (value.trim()) {
        saveToHistory(value);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  const handleSelect = (item: string) => {
    onChange(item);
    if (onSelectSuggestion) onSelectSuggestion(item);
    saveToHistory(item);
    setIsOpen(false);
  };

  const clearInput = () => {
    onChange("");
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={`relative space-y-1.5 w-full ${className}`}>
      {label && (
        <label htmlFor={id} className="block text-xs font-bold text-surface-700 dark:text-surface-300">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <div className="relative flex items-center">
        <input
          id={id}
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full bg-surface-50 dark:bg-surface-800 border rounded-xl px-3.5 py-2.5 text-sm font-bold text-surface-900 dark:text-white outline-none transition-all pr-20 ${
            !validation.isValid && value
              ? "border-red-500 focus:ring-2 focus:ring-red-500/50"
              : "border-surface-200 dark:border-surface-700 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/30"
          } ${inputClassName}`}
        />

        {/* Right Action Icons (Clear, Voice, Validation Indicator) */}
        <div className="absolute right-3 flex items-center gap-1.5 text-surface-400">
          {value && (
            <button
              type="button"
              onClick={clearInput}
              className="p-1 hover:text-surface-900 dark:hover:text-white transition-colors"
              title="Clear input"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {showVoiceInput && (
            <button
              type="button"
              onClick={toggleVoiceInput}
              className={`p-1 rounded-lg transition-all ${
                isListening 
                  ? "bg-red-500 text-white animate-pulse" 
                  : "hover:text-amber-500"
              }`}
              title={isListening ? "Listening..." : "Voice Search / Dictation"}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
          )}

          {value && (
            validation.isValid ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            )
          )}
        </div>
      </div>

      {/* Validation Message */}
      {value && !validation.isValid && validation.message && (
        <p className="text-[11px] font-bold text-red-500 flex items-center gap-1 pl-1 animate-in fade-in">
          <AlertCircle className="w-3 h-3" /> {validation.message}
        </p>
      )}

      {/* Dropdown Menu (AI Intent + Autocomplete + History) */}
      {isOpen && (aiIntent || totalDropdownItems.length > 0) && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl shadow-2xl z-50 overflow-hidden divide-y divide-surface-100 dark:divide-surface-800/80 animate-in fade-in duration-150">
          
          {/* AI Smart Intent Alert */}
          {aiIntent && (
            <div className="p-3 bg-red-950/80 border-b border-red-500/40 text-white space-y-2">
              <div className="flex items-center justify-between">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${aiIntent.badgeColor}`}>
                  <Sparkles className="w-3 h-3 inline mr-1" /> {aiIntent.title}
                </span>
              </div>
              <p className="text-xs text-red-200 font-medium">{aiIntent.description}</p>
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  navigate(aiIntent.targetUrl);
                }}
                className="w-full py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs flex items-center justify-center gap-1.5 shadow-lg"
              >
                <span>{aiIntent.actionText}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Autocomplete / Filtered Suggestions */}
          {filteredSuggestions.length > 0 && (
            <div className="py-2">
              <div className="px-3 py-1 text-[10px] font-black uppercase text-surface-400 tracking-wider">
                AUTO SUGGESTIONS
              </div>
              {filteredSuggestions.map((item, idx) => {
                const globalIdx = idx;
                const isHighlighted = highlightedIndex === globalIdx;
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => handleSelect(item)}
                    className={`w-full px-3.5 py-2 text-left text-xs font-bold flex items-center justify-between transition-colors ${
                      isHighlighted 
                        ? "bg-amber-500/20 text-amber-500" 
                        : "text-surface-800 dark:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-800"
                    }`}
                  >
                    <span>{item}</span>
                    <ArrowRight className="w-3 h-3 opacity-40" />
                  </button>
                );
              })}
            </div>
          )}

          {/* Search History */}
          {history.length > 0 && (
            <div className="py-2">
              <div className="px-3 py-1 text-[10px] font-black uppercase text-surface-400 tracking-wider flex items-center gap-1">
                <History className="w-3 h-3" /> RECENT SEARCHES
              </div>
              {history.map((item, idx) => {
                const globalIdx = filteredSuggestions.length + idx;
                const isHighlighted = highlightedIndex === globalIdx;
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => handleSelect(item)}
                    className={`w-full px-3.5 py-2 text-left text-xs font-bold flex items-center justify-between transition-colors ${
                      isHighlighted 
                        ? "bg-amber-500/20 text-amber-500" 
                        : "text-surface-700 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <History className="w-3 h-3 text-surface-400" />
                      {item}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

        </div>
      )}
    </div>
  );
}
