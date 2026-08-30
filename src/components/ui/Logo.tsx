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
    sm: { 
      icon: "w-5.5 h-5.5 sm:w-6 sm:h-6", 
      text: "text-base sm:text-lg", 
      subtext: "text-[9px] sm:text-[10px]",
      badge: "p-1.5" 
    },
    md: { 
      icon: "w-7 h-7 sm:w-8 sm:h-8", 
      text: "text-lg sm:text-xl", 
      subtext: "text-[10px] sm:text-xs",
      badge: "p-1.5 sm:p-2" 
    },
    lg: { 
      icon: "w-9 h-9 sm:w-10 sm:h-10", 
      text: "text-xl sm:text-2xl", 
      subtext: "text-xs sm:text-sm",
      badge: "p-2 sm:p-2.5" 
    },
    xl: { 
      icon: "w-11 h-11 sm:w-14 sm:h-14", 
      text: "text-2xl sm:text-3xl", 
      subtext: "text-sm sm:text-base",
      badge: "p-2.5 sm:p-3" 
    },
  };

  const currentSize = sizeMap[size];

  const textColorClass = 
    variant === "light" 
      ? "text-surface-900" 
      : variant === "dark" 
      ? "text-white" 
      : "text-surface-900 dark:text-white";

  const subtextColorClass =
    variant === "light"
      ? "text-surface-500"
      : variant === "dark"
      ? "text-amber-400"
      : "text-surface-500 dark:text-amber-300/90";

  return (
    <div className={`flex items-center gap-2 sm:gap-2.5 select-none group shrink-0 ${className}`}>
      {/* Premium Vector Shield Logo Mark */}
      <div className={`relative flex items-center justify-center rounded-xl sm:rounded-2xl bg-gradient-to-br from-surface-950 via-surface-900 to-amber-950 text-amber-400 shadow-sm shadow-amber-500/20 border border-amber-500/50 ${currentSize.badge} transition-transform duration-200 group-hover:scale-105 shrink-0`}>
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
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Road / Highway Perspective Element inside */}
          <path
            d="M14 10L11 23H13L15 15L17 23H19L16 10Z"
            fill="#fbbf24"
            fillOpacity="0.95"
          />

          {/* Center Road Divider Dashes */}
          <line
            x1="16"
            y1="12"
            x2="16"
            y2="21"
            stroke="#ffffff"
            strokeWidth="1.2"
            strokeDasharray="1.5 1.5"
          />

          {/* AI / Tech Node Spark at top of shield */}
          <circle cx="16" cy="7" r="2.2" fill="#ef4444" />
          <circle cx="16" cy="7" r="1" fill="#ffffff" />

          {/* Gradient definitions */}
          <defs>
            <linearGradient id="shieldGrad" x1="4" y1="2" x2="28" y2="30" gradientUnits="userSpaceOnUse">
              <stop stopColor="#0b111e" />
              <stop offset="0.5" stopColor="#1a2336" />
              <stop offset="1" stopColor="#3b1d03" />
            </linearGradient>
          </defs>
        </svg>

        {/* Ambient subtle glow */}
        <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-amber-500/15 blur-xs opacity-0 group-hover:opacity-100 transition-opacity -z-10" />
      </div>

      {/* Wordmark */}
      {showWordmark && (
        <div className="flex flex-col justify-center shrink-0">
          <span className={`font-black tracking-tight ${currentSize.text} leading-none ${textColorClass} flex items-center gap-1`}>
            Golden<span className="text-amber-500 dark:text-amber-400">Guard</span>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" title="System Active" />
          </span>
          <span className={`${currentSize.subtext} uppercase tracking-widest font-extrabold ${subtextColorClass} mt-0.5 leading-none`}>
            Road Safety
          </span>
        </div>
      )}
    </div>
  );
}

