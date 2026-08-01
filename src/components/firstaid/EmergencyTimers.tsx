import React, { useState, useEffect } from "react";
import { Clock, Play, Pause, RotateCcw, HeartPulse } from "lucide-react";

export function EmergencyTimers() {
  const [goldenHour, setGoldenHour] = useState(3600); // 60 minutes
  const [cprTime, setCprTime] = useState(0);
  const [isCprActive, setIsCprActive] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setGoldenHour((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let timer: any;
    let audioCtx: AudioContext | null = null;
    let metronomeInterval: any = null;

    if (isCprActive) {
      timer = setInterval(() => {
        setCprTime((prev) => prev + 1);
      }, 1000);

      // Metronome at 110 BPM (approx 545ms per beat)
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          audioCtx = new AudioContextClass();
          metronomeInterval = setInterval(() => {
            if (audioCtx && audioCtx.state !== 'closed') {
              const osc = audioCtx.createOscillator();
              const gain = audioCtx.createGain();
              osc.type = "sine";
              osc.frequency.setValueAtTime(800, audioCtx.currentTime);
              gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
              gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.08);
              osc.connect(gain);
              gain.connect(audioCtx.destination);
              osc.start();
              osc.stop(audioCtx.currentTime + 0.08);
            }
          }, 545);
        }
      } catch (err) {
        console.warn("Audio Context not supported for metronome:", err);
      }
    }

    return () => {
      if (timer) clearInterval(timer);
      if (metronomeInterval) clearInterval(metronomeInterval);
      if (audioCtx) {
        try { audioCtx.close(); } catch(e) {}
      }
    };
  }, [isCprActive]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white dark:bg-surface-800 rounded-2xl p-4 border border-surface-200 dark:border-surface-700 shadow-sm flex flex-col gap-4">
      {/* Golden Hour */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2 text-amber-600 dark:text-amber-500">
          <Clock className="w-5 h-5" />
          <span className="font-bold">Golden Hour</span>
        </div>
        <span className="text-xl font-mono font-bold text-amber-600 dark:text-amber-500">
          {formatTime(goldenHour)}
        </span>
      </div>
      
      {/* CPR Timer */}
      <div className="pt-4 border-t border-surface-200 dark:border-surface-700">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2 text-red-600 dark:text-red-500">
            <HeartPulse className="w-5 h-5" />
            <span className="font-bold text-sm">CPR Timer (100-120 bpm)</span>
          </div>
          <span className="text-xl font-mono font-bold text-red-600 dark:text-red-500">
            {formatTime(cprTime)}
          </span>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setIsCprActive(!isCprActive)}
            className={`flex-1 py-2 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors ${
              isCprActive 
                ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"
                : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
            }`}
          >
            {isCprActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {isCprActive ? "PAUSE" : "START CPR"}
          </button>
          <button 
            onClick={() => { setIsCprActive(false); setCprTime(0); }}
            className="p-2 rounded-xl bg-surface-100 dark:bg-surface-700 text-surface-600 dark:text-surface-400 hover:bg-surface-200 dark:hover:bg-surface-600"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
