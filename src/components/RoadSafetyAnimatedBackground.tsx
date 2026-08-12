import React from "react";

export function RoadSafetyAnimatedBackground() {
  return (
    <div
      className="fixed inset-0 w-full h-full pointer-events-none z-[-10] overflow-hidden select-none bg-surface-50 dark:bg-surface-950 transition-colors duration-300"
      aria-hidden="true"
    >
      {/* Self-contained high-performance keyframe styles */}
      <style>{`
        /* Core animations using hardware acceleration keyframes */
        @keyframes floatSlow {
          0% {
            transform: translate3d(0, 0, 0) scale(1);
          }
          33% {
            transform: translate3d(8vw, 6vh, 0) scale(1.15);
          }
          66% {
            transform: translate3d(-6vw, 12vh, 0) scale(0.9);
          }
          100% {
            transform: translate3d(0, 0, 0) scale(1);
          }
        }

        @keyframes floatSlowAlt {
          0% {
            transform: translate3d(0, 0, 0) scale(1.1);
          }
          50% {
            transform: translate3d(-10vw, -8vh, 0) scale(0.85);
          }
          100% {
            transform: translate3d(0, 0, 0) scale(1.1);
          }
        }

        @keyframes floatSlowThird {
          0% {
            transform: translate3d(0, 0, 0) scale(0.95);
          }
          50% {
            transform: translate3d(6vw, -10vh, 0) scale(1.2);
          }
          100% {
            transform: translate3d(0, 0, 0) scale(0.95);
          }
        }

        @keyframes particleRising {
          0% {
            transform: translate3d(0, 110vh, 0) scale(0.8);
            opacity: 0;
          }
          15% {
            opacity: 0.6;
          }
          85% {
            opacity: 0.6;
          }
          100% {
            transform: translate3d(var(--drift-x, 40px), -10vh, 0) scale(1.4);
            opacity: 0;
          }
        }

        @keyframes laneFlow {
          0% {
            background-position: 0% 0px;
          }
          100% {
            background-position: 0% 120px;
          }
        }

        @keyframes lightStreakActive {
          0% {
            transform: translateY(-20%) scaleY(0.6);
            opacity: 0;
          }
          15% {
            opacity: 0.7;
          }
          85% {
            opacity: 0.7;
          }
          100% {
            transform: translateY(140%) scaleY(1.8);
            opacity: 0;
          }
        }

        @keyframes pulseSoft {
          0%, 100% {
            opacity: 0.4;
            transform: scale(0.96);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.04);
          }
        }

        /* Highly-optimized animation performance utilities */
        .g-gpu {
          transform: translate3d(0, 0, 0);
          backface-visibility: hidden;
          perspective: 1000px;
          will-change: transform, opacity;
        }

        .anim-float-1 {
          animation: floatSlow 28s ease-in-out infinite;
        }

        .anim-float-2 {
          animation: floatSlowAlt 34s ease-in-out infinite;
        }

        .anim-float-3 {
          animation: floatSlowThird 38s ease-in-out infinite;
        }

        .anim-particle-gentle {
          animation: particleRising var(--duration, 20s) linear infinite;
        }

        .anim-lane-drift {
          animation: laneFlow 4.5s linear infinite;
        }

        .anim-streak-fast {
          animation: lightStreakActive 5s cubic-bezier(0.2, 0.8, 0.4, 1) infinite;
        }

        .anim-pulse-indicator {
          animation: pulseSoft 3.5s ease-in-out infinite;
        }

        /* Perspective lane support */
        .lane-wrapper {
          perspective: 350px;
          perspective-origin: 50% 10%;
        }

        .lane-plane {
          transform: rotateX(60deg);
          transform-origin: 50% 0%;
        }

        /* Accessibility: prefers-reduced-motion media query */
        @media (prefers-reduced-motion: reduce) {
          .anim-float-1,
          .anim-float-2,
          .anim-float-3,
          .anim-particle-gentle,
          .anim-lane-drift,
          .anim-streak-fast,
          .anim-pulse-indicator {
            animation: none !important;
            transform: none !important;
            opacity: 0.1 !important;
          }
          .lane-plane {
            transform: rotateX(60deg) !important;
          }
          .anim-lane-drift {
            background-position: 0% 0px !important;
          }
          .anim-streak-fast {
            display: none !important;
          }
        }
      `}</style>

      {/* 1. Large Subtle Drifting Ambient Gradient Orbs (Noticeable but clean) */}
      <div className="absolute inset-0 w-full h-full overflow-hidden z-[-5]">
        {/* Soft Gold/Amber Orb (Warning & road guidance) */}
        <div className="absolute top-[5%] left-[8%] w-[60vw] h-[60vw] max-w-[650px] max-h-[650px] rounded-full bg-amber-400/12 dark:bg-amber-500/8 blur-[100px] md:blur-[140px] anim-float-1 g-gpu" />

        {/* Deep Emergency Blue Orb (Response & safety) */}
        <div className="absolute bottom-[8%] right-[10%] w-[65vw] h-[65vw] max-w-[700px] max-h-[700px] rounded-full bg-blue-500/14 dark:bg-blue-600/8 blur-[110px] md:blur-[150px] anim-float-2 g-gpu" />

        {/* Life-saving Green Orb (All-clear, compliance, volunteer theme) */}
        <div className="absolute top-[45%] right-[22%] w-[45vw] h-[45vw] max-w-[500px] max-h-[500px] rounded-full bg-emerald-400/10 dark:bg-emerald-500/6 blur-[90px] md:blur-[120px] anim-float-3 g-gpu" />

        {/* Center Secondary Red/Amber Caution Glow */}
        <div className="absolute top-[25%] left-[40%] w-[35vw] h-[35vw] max-w-[400px] max-h-[400px] rounded-full bg-rose-400/6 dark:bg-rose-500/4 blur-[100px] anim-float-1 g-gpu" />
      </div>

      {/* 2. Soft Rising Glowing Safety Particles */}
      <div className="absolute inset-0 w-full h-full overflow-hidden z-[-4]">
        <div className="absolute left-[8%] anim-particle-gentle opacity-40" style={{ "--duration": "22s", "--drift-x": "50px" } as React.CSSProperties}>
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400 dark:bg-amber-500 blur-[1px] shadow-md shadow-amber-400/50" />
        </div>
        <div className="absolute left-[28%] anim-particle-gentle opacity-30" style={{ "--duration": "28s", "--drift-x": "-30px", "animationDelay": "4s" } as React.CSSProperties}>
          <div className="w-1.5 h-1.5 rounded-full bg-blue-400 dark:bg-blue-500 blur-[0.5px] shadow-md shadow-blue-400/50" />
        </div>
        <div className="absolute left-[48%] anim-particle-gentle opacity-45" style={{ "--duration": "24s", "--drift-x": "60px", "animationDelay": "8s" } as React.CSSProperties}>
          <div className="w-2 h-2 rounded-full bg-emerald-400 dark:bg-emerald-500 blur-[1px] shadow-md shadow-emerald-400/50" />
        </div>
        <div className="absolute left-[68%] anim-particle-gentle opacity-35" style={{ "--duration": "19s", "--drift-x": "-40px", "animationDelay": "12s" } as React.CSSProperties}>
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400 dark:bg-amber-500 blur-[1px] shadow-md shadow-amber-400/50" />
        </div>
        <div className="absolute left-[88%] anim-particle-gentle opacity-40" style={{ "--duration": "30s", "--drift-x": "30px", "animationDelay": "6s" } as React.CSSProperties}>
          <div className="w-2 h-2 rounded-full bg-blue-400 dark:bg-blue-500 blur-[0.5px] shadow-md shadow-blue-400/50" />
        </div>
      </div>

      {/* 3. Infinite Horizon Lane/Highway Drifting (Representing road-safety grid) */}
      <div className="absolute bottom-0 left-0 w-full h-[60vh] md:h-[50vh] lane-wrapper overflow-hidden z-[-3]">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[220vw] sm:w-[160vw] md:w-[130vw] lg:w-[110vw] h-[200%] lane-plane border-t border-slate-200/20 dark:border-slate-800/15">
          
          {/* Subtle Road Asphalt Surface gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-100/15 via-slate-100/5 to-transparent dark:from-slate-950/50 dark:via-slate-950/20 dark:to-transparent" />

          {/* Lane dashes flowing towards the user */}
          <div 
            className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-3/4 h-full anim-lane-drift g-gpu opacity-[0.22] dark:opacity-[0.12]"
            style={{
              backgroundImage: `
                linear-gradient(90deg, transparent 49.5%, var(--lane-color, currentColor) 49.5%, var(--lane-color, currentColor) 50.5%, transparent 50.5%),
                linear-gradient(90deg, transparent 24.5%, var(--lane-color, currentColor) 24.5%, var(--lane-color, currentColor) 25.5%, transparent 25.5%),
                linear-gradient(90deg, transparent 74.5%, var(--lane-color, currentColor) 74.5%, var(--lane-color, currentColor) 75.5%, transparent 75.5%),
                repeating-linear-gradient(0deg, var(--lane-color, currentColor) 0px, var(--lane-color, currentColor) 20px, transparent 20px, transparent 65px)
              `,
              backgroundSize: "100% 100%, 100% 100%, 100% 100%, 100% 65px"
            }}
          />

          {/* Left Side Safety Shoulder (Solid Amber) */}
          <div className="absolute inset-y-0 left-[12%] w-[2px] bg-amber-500/30 dark:bg-amber-500/20" />

          {/* Right Side Safety Shoulder (Solid Blue) */}
          <div className="absolute inset-y-0 right-[12%] w-[2px] bg-blue-500/30 dark:bg-blue-500/20" />

          {/* Gliding Safety Light Streaks along lane lines */}
          <div className="absolute inset-y-0 left-[24%] w-[3px] overflow-hidden opacity-25 dark:opacity-15">
            <div className="absolute top-0 left-0 w-full h-[25%] bg-gradient-to-b from-transparent via-amber-400 to-transparent anim-streak-fast g-gpu" />
          </div>

          <div className="absolute inset-y-0 left-[50%] w-[3px] overflow-hidden opacity-35 dark:opacity-20">
            <div className="absolute top-0 left-0 w-full h-[20%] bg-gradient-to-b from-transparent via-blue-400 to-transparent anim-streak-fast style-delay-2 g-gpu" style={{ "animationDelay": "1.8s" } as React.CSSProperties} />
          </div>

          <div className="absolute inset-y-0 right-[24%] w-[3px] overflow-hidden opacity-25 dark:opacity-15">
            <div className="absolute top-0 left-0 w-full h-[30%] bg-gradient-to-b from-transparent via-emerald-400 to-transparent anim-streak-fast style-delay-1 g-gpu" style={{ "animationDelay": "3.5s" } as React.CSSProperties} />
          </div>

          {/* Side safety lights blinking softly */}
          <div className="absolute inset-y-0 left-[9%] flex flex-col justify-around py-16">
            {[1, 2, 3].map((idx) => (
              <div key={`s-left-${idx}`} className="w-2.5 h-2.5 rounded-full bg-amber-500/80 anim-pulse-indicator blur-[0.5px]" style={{ "animationDelay": `${idx * 0.8}s` } as React.CSSProperties} />
            ))}
          </div>

          <div className="absolute inset-y-0 right-[9%] flex flex-col justify-around py-16">
            {[1, 2, 3].map((idx) => (
              <div key={`s-right-${idx}`} className="w-2.5 h-2.5 rounded-full bg-blue-500/80 anim-pulse-indicator blur-[0.5px]" style={{ "animationDelay": `${idx * 0.8 + 0.4}s` } as React.CSSProperties} />
            ))}
          </div>

        </div>
      </div>

      {/* 4. Subtle Horizon Blur Fade Overlay */}
      <div className="absolute bottom-[58vh] md:bottom-[48vh] left-0 w-full h-[15vh] bg-gradient-to-b from-transparent to-surface-50 dark:to-surface-950 z-[-2]" />

      {/* 5. Precision Overlay Mask layer: balances noticeable movement with superb content legibility */}
      <div className="absolute inset-0 w-full h-full bg-surface-50/70 dark:bg-surface-950/82 backdrop-blur-[0.5px] transition-colors duration-300 z-[-1]" />
    </div>
  );
}

export const RoadSafetyBackground = RoadSafetyAnimatedBackground;
export const AnimatedBackground = RoadSafetyAnimatedBackground;
