import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";
import { getApiUrl } from "../lib/api";
import { EMERGENCY_DISPATCH_NUMBER, generateSOSMessage } from "../lib/emergencyCall";
import { getLocalMedicalID } from "../lib/medicalIdStore";
import { useAuth } from "./AuthContext";

export interface VoiceSOSContextType {
  isSupported: boolean;
  isListening: boolean;
  isTriggered: boolean;
  triggerPhrase: string | null;
  lastTranscript: string;
  countdown: number;
  micPermissionStatus: "prompt" | "granted" | "denied" | "unsupported";
  toggleListening: () => void;
  startListening: () => Promise<void>;
  stopListening: () => void;
  testVoiceTrigger: (customPhrase?: string) => void;
  cancelTrigger: () => void;
  confirmImmediateDispatch: () => void;
  recognizedHotwords: string[];
}

const DEFAULT_HOTWORDS = [
  "help me",
  "help",
  "sos",
  "s o s",
  "emergency",
  "save me",
  "call ambulance",
  "call 112",
  "call 911",
  "accident",
  "crash",
  "bachao",
  "madad",
  "medical emergency",
  "send help",
  "golden guard help",
  "golden guard sos",
  "i need help",
  "please help",
];

const CANCEL_WORDS = [
  "cancel",
  "stop",
  "false alarm",
  "i am ok",
  "i am safe",
  "wait",
  "no",
  "abort",
  "ruk jao",
];

const VoiceSOSContext = createContext<VoiceSOSContextType | undefined>(undefined);

const STORAGE_KEY_VOICE_PREF = "goldenguard_voice_sos_enabled";

// Speech Synthesis Helper for clear vocal feedback
function speakFeedback(text: string) {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("Speech synthesis notice:", e);
    }
  }
}

export const VoiceSOSProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { userProfile } = useAuth();
  const navigate = useNavigate();

  const [isSupported, setIsSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isTriggered, setIsTriggered] = useState(false);
  const [triggerPhrase, setTriggerPhrase] = useState<string | null>(null);
  const [lastTranscript, setLastTranscript] = useState("");
  const [countdown, setCountdown] = useState(5);
  const [micPermissionStatus, setMicPermissionStatus] = useState<
    "prompt" | "granted" | "denied" | "unsupported"
  >("prompt");

  const recognitionRef = useRef<any>(null);
  const isListeningRef = useRef(false);
  const isTriggeredRef = useRef(false);
  const countdownIntervalRef = useRef<any>(null);
  const restartTimeoutRef = useRef<any>(null);

  // Keep refs updated for event handlers
  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);

  useEffect(() => {
    isTriggeredRef.current = isTriggered;
  }, [isTriggered]);

  // Check browser support for Web Speech API
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        setIsSupported(true);
        // Check permission if query is available
        if (navigator.permissions && navigator.permissions.query) {
          navigator.permissions
            .query({ name: "microphone" as PermissionName })
            .then((perm) => {
              setMicPermissionStatus(perm.state as any);
              perm.onchange = () => {
                setMicPermissionStatus(perm.state as any);
              };
            })
            .catch(() => {
              setMicPermissionStatus("prompt");
            });
        }
      } else {
        setIsSupported(false);
        setMicPermissionStatus("unsupported");
      }
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      if (restartTimeoutRef.current) clearTimeout(restartTimeoutRef.current);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          // ignore
        }
      }
    };
  }, []);

  // Dispatch Emergency Workflow
  const executeEmergencyDispatch = useCallback(
    async (spokenPhrase: string) => {
      setIsTriggered(false);
      isTriggeredRef.current = false;
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }

      // Auditory confirmation
      speakFeedback("Voice SOS verified. Dispatched emergency response. Help is on the way!");

      if (navigator.vibrate) {
        try {
          navigator.vibrate([200, 100, 200, 100, 400]);
        } catch (e) {
          // ignore
        }
      }

      // Navigate to SOS page with auto trigger flags
      navigate("/sos?active=true&source=voice&phrase=" + encodeURIComponent(spokenPhrase));
    },
    [navigate]
  );

  // Cancel Trigger
  const cancelTrigger = useCallback(() => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    setIsTriggered(false);
    isTriggeredRef.current = false;
    setTriggerPhrase(null);
    setCountdown(5);

    speakFeedback("Emergency cancelled. Resuming standby monitoring.");
  }, []);

  // Confirm Immediate Dispatch (bypass countdown)
  const confirmImmediateDispatch = useCallback(() => {
    executeEmergencyDispatch(triggerPhrase || "Manual Confirmation");
  }, [executeEmergencyDispatch, triggerPhrase]);

  // Handle Trigger Detected
  const handleTriggerDetected = useCallback(
    (matchedPhrase: string) => {
      if (isTriggeredRef.current) return;
      setIsTriggered(true);
      isTriggeredRef.current = true;
      setTriggerPhrase(matchedPhrase);
      setCountdown(5);

      // Haptic & Audio prompt
      if (navigator.vibrate) {
        try {
          navigator.vibrate([150, 100, 150]);
        } catch (e) {
          // ignore
        }
      }

      speakFeedback("Emergency keyword detected. Dispatching in five seconds. Say cancel to abort.");

      let currentSec = 5;
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);

      countdownIntervalRef.current = setInterval(() => {
        currentSec -= 1;
        setCountdown(currentSec);

        if (currentSec <= 0) {
          clearInterval(countdownIntervalRef.current);
          countdownIntervalRef.current = null;
          executeEmergencyDispatch(matchedPhrase);
        }
      }, 1000);
    },
    [executeEmergencyDispatch]
  );

  // Initialize Speech Recognition instance
  const initSpeechRecognition = useCallback(() => {
    if (typeof window === "undefined") return null;
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return null;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognition.maxAlternatives = 3;

    recognition.onresult = (event: any) => {
      let combinedInterim = "";
      let combinedFinal = "";

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const transcript = event.results[i][0]?.transcript || "";
        if (event.results[i].isFinal) {
          combinedFinal += transcript + " ";
        } else {
          combinedInterim += transcript + " ";
        }
      }

      const fullSpoken = (combinedFinal + " " + combinedInterim).trim().toLowerCase();
      if (!fullSpoken) return;
      setLastTranscript(fullSpoken);

      // Check if we are currently in countdown mode and user said cancel / stop
      if (isTriggeredRef.current) {
        for (const cancelWord of CANCEL_WORDS) {
          if (fullSpoken.includes(cancelWord)) {
            cancelTrigger();
            return;
          }
        }
        if (fullSpoken.includes("send now") || fullSpoken.includes("dispatch") || fullSpoken.includes("yes")) {
          confirmImmediateDispatch();
          return;
        }
        return;
      }

      // Check against hotwords
      for (const hotword of DEFAULT_HOTWORDS) {
        // Regex with word boundaries or substring match
        const regex = new RegExp(`\\b${hotword}\\b`, "i");
        if (regex.test(fullSpoken) || fullSpoken.includes(hotword)) {
          handleTriggerDetected(hotword);
          break;
        }
      }
    };

    recognition.onerror = (event: any) => {
      console.warn("Web Speech API recognition error:", event.error);
      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        setMicPermissionStatus("denied");
        setIsListening(false);
        isListeningRef.current = false;
      }
    };

    recognition.onend = () => {
      // Auto-restart if user still wants listening active
      if (isListeningRef.current) {
        if (restartTimeoutRef.current) clearTimeout(restartTimeoutRef.current);
        restartTimeoutRef.current = setTimeout(() => {
          if (isListeningRef.current && recognitionRef.current) {
            try {
              recognitionRef.current.start();
            } catch (e) {
              // already running or failed
            }
          }
        }, 400);
      }
    };

    return recognition;
  }, [cancelTrigger, confirmImmediateDispatch, handleTriggerDetected]);

  // Start Listening
  const startListening = useCallback(async () => {
    if (!isSupported) {
      alert("Web Speech API is not supported in this browser. Please use Chrome, Edge, or Safari.");
      return;
    }

    try {
      if (!recognitionRef.current) {
        recognitionRef.current = initSpeechRecognition();
      }

      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (e) {
          // might be running
        }
      }

      setIsListening(true);
      isListeningRef.current = true;
      setMicPermissionStatus("granted");
      localStorage.setItem(STORAGE_KEY_VOICE_PREF, "true");

      speakFeedback("Hands-free Voice SOS listening activated. Say help me or SOS if you need emergency assistance.");
    } catch (err) {
      console.error("Failed to start voice recognition:", err);
      setIsListening(false);
      isListeningRef.current = false;
    }
  }, [initSpeechRecognition, isSupported]);

  // Stop Listening
  const stopListening = useCallback(() => {
    setIsListening(false);
    isListeningRef.current = false;
    localStorage.setItem(STORAGE_KEY_VOICE_PREF, "false");

    if (restartTimeoutRef.current) clearTimeout(restartTimeoutRef.current);

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // ignore
      }
    }
  }, []);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  // Simulated Voice Trigger for testing
  const testVoiceTrigger = useCallback(
    (customPhrase = "help me") => {
      setLastTranscript(`[Simulation] ${customPhrase}`);
      handleTriggerDetected(customPhrase);
    },
    [handleTriggerDetected]
  );

  const contextValue = useMemo(() => ({
    isSupported,
    isListening,
    isTriggered,
    triggerPhrase,
    lastTranscript,
    countdown,
    micPermissionStatus,
    toggleListening,
    startListening,
    stopListening,
    testVoiceTrigger,
    cancelTrigger,
    confirmImmediateDispatch,
    recognizedHotwords: DEFAULT_HOTWORDS,
  }), [
    isSupported,
    isListening,
    isTriggered,
    triggerPhrase,
    lastTranscript,
    countdown,
    micPermissionStatus,
    toggleListening,
    startListening,
    stopListening,
    testVoiceTrigger,
    cancelTrigger,
    confirmImmediateDispatch,
  ]);

  return (
    <VoiceSOSContext.Provider value={contextValue}>
      {children}
    </VoiceSOSContext.Provider>
  );
};

export const useVoiceSOS = (): VoiceSOSContextType => {
  const context = useContext(VoiceSOSContext);
  if (!context) {
    throw new Error("useVoiceSOS must be used within a VoiceSOSProvider");
  }
  return context;
};
