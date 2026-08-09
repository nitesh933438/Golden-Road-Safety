import React from "react";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showWordmark?: boolean;
  variant?: "auto" | "light" | "dark";
}

export function Logo({
  className = "",
  size = "md",
  showWordmark = true,
  variant = "auto",
}: LogoProps) {
  const sizeMap = {
    sm: { icon: "w-6 h-6 sm:w-7 sm:h-7", text: "text-xs sm:text-sm md:text-base", badge: "p-1 sm:p-1.5" },
    md: { icon: "w-8 h-8 sm:w-9 sm:h-9", text: "text-base sm:text-xl", badge: "p-1.5 sm:p-2" },
    lg: { icon: "w-10 h-10 sm:w-12 sm:h-12", text: "text-xl sm:text-2xl", badge: "p-2 sm:p-2.5" },
    xl: { icon: "w-12 h-12 sm:w-16 sm:h-16", text: "text-2xl sm:text-4xl", badge: "p-2 sm:p-3" },
  };

  const currentSize = sizeMap[size];

  return (
    <div className={`flex items-center gap-3 select-none group ${className}`}>
      {/* Premium Vector Shield Logo Mark */}
      <div className={`relative flex items-center justify-center rounded-2xl bg-gradient-to-br from-surface-900 via-surface-900 to-amber-950 text-amber-400 shadow-lg shadow-amber-500/10 border border-amber-500/30 ${currentSize.badge} transition-transform duration-300 group-hover:scale-105`}>
        {/* SVG Shield + Road + AI Spark Vector */}
        <svg
          className={currentSize.icon}
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Shield Outer Path */}
          <path
            d="M16 2L4 7v8c0 7.2 5.1 13.9 12 15.5 6.9-1.6 12-8.3 12-15.5V7L16 2z"
            fill="url(#shieldGrad)"
            stroke="#f59e0b"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Road / Highway Perspective Element inside */}
          <path
            d="M14 10L11 23H13L15 15L17 23H19L16 10Z"
            fill="#fbbf24"
            fillOpacity="0.9"
          />

          {/* Center Road Divider Dashes */}
          <line
            x1="16"
            y1="12"
            x2="16"
            y2="21"
            stroke="#ffffff"
            strokeWidth="1"
            strokeDasharray="1.5 1.5"
          />

          {/* AI / Tech Node Spark at top of shield */}
          <circle cx="16" cy="7" r="2.5" fill="#ef4444" />
          <circle cx="16" cy="7" r="1.2" fill="#ffffff" className="animate-ping" />

          {/* Gradient definitions */}
          <defs>
            <linearGradient id="shieldGrad" x1="4" y1="2" x2="28" y2="30" gradientUnits="userSpaceOnUse">
              <stop stopColor="#0f172a" />
              <stop offset="0.5" stopColor="#1e293b" />
              <stop offset="1" stopColor="#331a00" />
            </linearGradient>
          </defs>
        </svg>

        {/* Ambient subtle glow */}
        <div className="absolute inset-0 rounded-2xl bg-amber-500/20 blur-sm opacity-0 group-hover:opacity-100 transition-opacity -z-10" />
      </div>

      {/* Wordmark */}
      {showWordmark && (
        <div className="flex flex-col">
          <span className={`font-black tracking-tight ${currentSize.text} leading-none text-surface-900 dark:text-white flex items-center gap-1.5`}>
            Golden<span className="text-amber-500 dark:text-amber-400">Guard</span>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" title="Live AI Emergency Guardian" />
          </span>
          <span className="text-[10px] uppercase tracking-widest font-bold text-surface-400 dark:text-surface-500 mt-0.5">
            AI Road Safety & SOS
          </span>
        </div>
      )}
    </div>
  );
}
