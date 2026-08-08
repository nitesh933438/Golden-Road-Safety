import React, { useEffect, useRef, useState } from "react";

export function RoadSafetyAnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [useCanvasFallback, setUseCanvasFallback] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handleMotionChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleMotionChange);
    }
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener("change", handleMotionChange);
      }
    };
  }, []);

  // Video Autoplay handler with fallback
  useEffect(() => {
    if (videoRef.current && !prefersReducedMotion) {
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // If video autoplay fails or file is unsupported, switch to canvas engine
          setUseCanvasFallback(true);
        });
      }
    } else {
      setUseCanvasFallback(true);
    }
  }, [prefersReducedMotion]);

  // High performance Canvas Road Engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    // City Skyline Buildings (Pre-generated for consistency)
    const buildingWidth = 36;
    const numBuildings = Math.ceil(width / buildingWidth) + 2;
    const buildings = Array.from({ length: numBuildings }, (_, i) => ({
      height: 30 + Math.abs(Math.sin(i * 1.7) * 90) + (i % 4 === 0 ? 50 : 0),
      hasLights: i % 2 === 0,
      lightColor: i % 3 === 0 ? "#f59e0b" : i % 5 === 0 ? "#3b82f6" : "#e0f2fe",
    }));

    // Vehicles State
    // Oncoming (headlights coming closer), Outgoing (taillights moving away), Emergency (strobe lights)
    const numVehicles = 32;
    const vehicles = Array.from({ length: numVehicles }, (_, i) => ({
      lane: (i % 4) - 1.5, // -1.5, -0.5, 0.5, 1.5
      z: (i / numVehicles) * 1.0, // 0 (horizon) to 1 (near viewer)
      speed: 0.0025 + (i % 3) * 0.0015,
      direction: i % 2 === 0 ? 1 : -1, // 1 = outgoing (red), -1 = oncoming (headlights)
      isEmergency: i === 0 || i === 7 || i === 15, // Police/Ambulance
      vehicleType: i % 5 === 0 ? "truck" : "car",
    }));

    // Street Lights / Overhead Gantries
    const numLights = 12;
    let lightOffset = 0;

    let time = 0;

    const render = () => {
      time += 0.016; // ~60fps step
      lightOffset = (lightOffset + 0.003) % 1;

      // 1. NIGHT SKY & ATMOSPHERIC GRADIENT
      const horizonY = height * 0.48;
      const vanishingX = width * 0.5;

      const isDark = document.documentElement.classList.contains("dark");

      const skyGrad = ctx.createLinearGradient(0, 0, 0, horizonY);
      if (isDark) {
        skyGrad.addColorStop(0, "#01030a");
        skyGrad.addColorStop(0.6, "#040918");
        skyGrad.addColorStop(1, "#0a1329");
      } else {
        skyGrad.addColorStop(0, "#f8fafc");
        skyGrad.addColorStop(0.6, "#e2e8f0");
        skyGrad.addColorStop(1, "#cbd5e1");
      }
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, horizonY);

      // Distant Horizon Amber/Blue Emergency Atmosphere Glow
      const horizonGlow = ctx.createRadialGradient(
        vanishingX, horizonY, 10,
        vanishingX, horizonY, width * 0.6
      );
      horizonGlow.addColorStop(0, "rgba(245, 158, 11, 0.22)"); // Amber core
      horizonGlow.addColorStop(0.4, "rgba(30, 58, 138, 0.15)"); // Navy blue
      horizonGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = horizonGlow;
      ctx.fillRect(0, 0, width, horizonY + 20);

      // 2. CITY SKYLINE SILHOUETTES
      ctx.fillStyle = "#060c1d";
      buildings.forEach((b, idx) => {
        const x = idx * buildingWidth;
        const y = horizonY - b.height;
        ctx.fillRect(x, y, buildingWidth - 2, b.height);

        // Windows
        if (b.hasLights) {
          ctx.fillStyle = b.lightColor;
          ctx.globalAlpha = 0.45 + Math.sin(time + idx) * 0.2;
          for (let wy = y + 8; wy < horizonY - 4; wy += 12) {
            for (let wx = x + 4; wx < x + buildingWidth - 6; wx += 8) {
              if ((wx + wy) % 3 === 0) {
                ctx.fillRect(wx, wy, 3, 4);
              }
            }
          }
          ctx.globalAlpha = 1.0;
          ctx.fillStyle = "#060c1d";
        }
      });

      // 3. ASPHALT HIGHWAY SURFACE
      const roadGrad = ctx.createLinearGradient(0, horizonY, 0, height);
      roadGrad.addColorStop(0, "#090d1a");
      roadGrad.addColorStop(0.5, "#0b1224");
      roadGrad.addColorStop(1, "#030610");
      ctx.fillStyle = roadGrad;

      // Draw perspective road trapezoid
      const roadBottomLeft = -width * 0.25;
      const roadBottomRight = width * 1.25;
      const roadTopLeft = vanishingX - width * 0.09;
      const roadTopRight = vanishingX + width * 0.09;

      ctx.beginPath();
      ctx.moveTo(roadTopLeft, horizonY);
      ctx.lineTo(roadTopRight, horizonY);
      ctx.lineTo(roadBottomRight, height);
      ctx.lineTo(roadBottomLeft, height);
      ctx.closePath();
      ctx.fill();

      // Road shoulder lines (solid white / amber)
      ctx.lineWidth = 2;
      ctx.strokeStyle = "rgba(245, 158, 11, 0.6)"; // Left amber line
      ctx.beginPath();
      ctx.moveTo(roadTopLeft, horizonY);
      ctx.lineTo(roadBottomLeft, height);
      ctx.stroke();

      ctx.strokeStyle = "rgba(255, 255, 255, 0.5)"; // Right white line
      ctx.beginPath();
      ctx.moveTo(roadTopRight, horizonY);
      ctx.lineTo(roadBottomRight, height);
      ctx.stroke();

      // 4. MOVING 3D PERSPECTIVE LANE MARKINGS
      const laneDashSpeed = (time * 0.9) % 1;
      const numLanes = 4;
      const numDashes = 18;

      for (let l = 1; l < numLanes; l++) {
        const laneRatio = l / numLanes;
        ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";

        for (let d = 0; d < numDashes; d++) {
          const z1 = ((d / numDashes) + laneDashSpeed / numDashes) % 1;
          if (z1 < 0.02) continue;

          const z2 = z1 + 0.035;
          if (z2 > 0.98) continue;

          // Transform z1 & z2 via perspective quadratic scaling
          const p1 = Math.pow(z1, 2.2);
          const p2 = Math.pow(z2, 2.2);

          const y1 = horizonY + (height - horizonY) * p1;
          const y2 = horizonY + (height - horizonY) * p2;

          const width1 = roadTopLeft + (roadTopRight - roadTopLeft) * laneRatio + (roadBottomLeft + (roadBottomRight - roadBottomLeft) * laneRatio - (roadTopLeft + (roadTopRight - roadTopLeft) * laneRatio)) * p1;
          const width2 = roadTopLeft + (roadTopRight - roadTopLeft) * laneRatio + (roadBottomLeft + (roadBottomRight - roadBottomLeft) * laneRatio - (roadTopLeft + (roadTopRight - roadTopLeft) * laneRatio)) * p2;

          ctx.lineWidth = Math.max(1, p1 * 6);
          ctx.beginPath();
          ctx.moveTo(width1, y1);
          ctx.lineTo(width2, y2);
          ctx.stroke();
        }
      }

      // 5. PASSING STREET LIGHT POLES & OVERHEAD GLOBS
      for (let i = 0; i < numLights; i++) {
        const z = ((i / numLights) + lightOffset) % 1;
        if (z < 0.05) continue;

        const p = Math.pow(z, 2.4);
        const poleY = horizonY + (height - horizonY) * p;
        const poleXLeft = roadTopLeft + (roadBottomLeft - roadTopLeft) * p - 18 * p;
        const poleXRight = roadTopRight + (roadBottomRight - roadTopRight) * p + 18 * p;
        const poleHeight = 45 * p;

        // Streetlamp amber light cone on road
        ctx.fillStyle = "rgba(245, 158, 11, 0.12)";
        ctx.beginPath();
        ctx.ellipse(poleXLeft + 22 * p, poleY, 35 * p, 12 * p, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.ellipse(poleXRight - 22 * p, poleY, 35 * p, 12 * p, 0, 0, Math.PI * 2);
        ctx.fill();

        // Pole light bulb glow
        ctx.fillStyle = "#fbbf24";
        ctx.beginPath();
        ctx.arc(poleXLeft, poleY - poleHeight, Math.max(1, 3.5 * p), 0, Math.PI * 2);
        ctx.arc(poleXRight, poleY - poleHeight, Math.max(1, 3.5 * p), 0, Math.PI * 2);
        ctx.fill();
      }

      // 6. CONTINUOUS MOVING VEHICLES (Headlights, Taillights, Ambulance / Police Strobes)
      // Sort vehicles by depth z so far vehicles are drawn first
      vehicles.sort((a, b) => a.z - b.z);

      vehicles.forEach((v) => {
        if (!prefersReducedMotion) {
          v.z += v.speed * (v.direction === -1 ? 1.4 : 0.85);
          if (v.z > 1.0) v.z = 0.01;
        }

        const p = Math.pow(v.z, 2.3);
        const vY = horizonY + (height - horizonY) * p;

        // X position based on lane (-1.5 to 1.5)
        const laneXStart = roadTopLeft + (roadTopRight - roadTopLeft) * ((v.lane + 2) / 4);
        const laneXEnd = roadBottomLeft + (roadBottomRight - roadBottomLeft) * ((v.lane + 2) / 4);
        const vX = laneXStart + (laneXEnd - laneXStart) * p;

        const vSize = Math.max(2, 18 * p);

        if (vY >= horizonY && vY < height && vX >= 0 && vX < width) {
          if (v.direction === -1) {
            // ONCOMING TRAFFIC -> Dual Headlights (Warm White / Yellow)
            const spread = vSize * 0.85;

            // Headlight beams on road
            const beamGrad = ctx.createRadialGradient(
              vX, vY + vSize * 2, 2,
              vX, vY + vSize * 2, vSize * 7
            );
            beamGrad.addColorStop(0, "rgba(254, 240, 138, 0.45)");
            beamGrad.addColorStop(1, "rgba(254, 240, 138, 0)");
            ctx.fillStyle = beamGrad;
            ctx.beginPath();
            ctx.arc(vX, vY + vSize * 2, vSize * 7, 0, Math.PI * 2);
            ctx.fill();

            // Headlight bulbs
            ctx.fillStyle = "#ffffff";
            ctx.beginPath();
            ctx.arc(vX - spread, vY, Math.max(1, vSize * 0.3), 0, Math.PI * 2);
            ctx.arc(vX + spread, vY, Math.max(1, vSize * 0.3), 0, Math.PI * 2);
            ctx.fill();
          } else {
            // OUTGOING TRAFFIC -> Red Taillights
            const spread = vSize * 0.75;

            // Red light glow
            const tailGlow = ctx.createRadialGradient(
              vX, vY, 1,
              vX, vY, vSize * 4
            );
            tailGlow.addColorStop(0, "rgba(239, 68, 68, 0.7)");
            tailGlow.addColorStop(1, "rgba(239, 68, 68, 0)");
            ctx.fillStyle = tailGlow;
            ctx.beginPath();
            ctx.arc(vX, vY, vSize * 4, 0, Math.PI * 2);
            ctx.fill();

            // Taillight bulbs
            ctx.fillStyle = "#f87171";
            ctx.beginPath();
            ctx.arc(vX - spread, vY, Math.max(1, vSize * 0.3), 0, Math.PI * 2);
            ctx.arc(vX + spread, vY, Math.max(1, vSize * 0.3), 0, Math.PI * 2);
            ctx.fill();
          }

          // EMERGENCY VEHICLE STROBES (Red & Blue Flashing Lightbar)
          if (v.isEmergency) {
            const isRedPhase = Math.floor(time * 12 + v.lane * 5) % 2 === 0;

            // Flash strobe glow on vehicle and road
            const emergencyColor = isRedPhase ? "rgba(239, 68, 68, 0.85)" : "rgba(59, 130, 246, 0.85)";
            const strobeGrad = ctx.createRadialGradient(
              vX, vY - vSize, 2,
              vX, vY - vSize, vSize * 9
            );
            strobeGrad.addColorStop(0, emergencyColor);
            strobeGrad.addColorStop(1, "rgba(0, 0, 0, 0)");

            ctx.fillStyle = strobeGrad;
            ctx.beginPath();
            ctx.arc(vX, vY - vSize, vSize * 9, 0, Math.PI * 2);
            ctx.fill();

            // Strobe Lightbar Core
            ctx.fillStyle = isRedPhase ? "#ef4444" : "#3b82f6";
            ctx.fillRect(vX - vSize * 0.7, vY - vSize * 1.3, vSize * 1.4, Math.max(2, vSize * 0.35));
          }
        }
      });

      // 7. EMERGENCY COMMAND AMBIENT STROBE SWEEPS
      const strobePhase = Math.sin(time * 3.5);
      if (strobePhase > 0.65) {
        ctx.fillStyle = "rgba(220, 38, 38, 0.04)"; // Red Strobe
        ctx.fillRect(0, 0, width, height);
      } else if (strobePhase < -0.65) {
        ctx.fillStyle = "rgba(37, 99, 235, 0.04)"; // Blue Strobe
        ctx.fillRect(0, 0, width, height);
      }

      if (!prefersReducedMotion && document.visibilityState === "visible") {
        animId = requestAnimationFrame(render);
      }
    };

    render();

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && !prefersReducedMotion) {
        render();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (animId) cancelAnimationFrame(animId);
    };
  }, [prefersReducedMotion]);

  if (prefersReducedMotion) {
    return (
      <div
        className="fixed inset-0 w-full h-full pointer-events-none z-[-2] bg-gradient-to-b from-slate-950 via-slate-900 to-black"
        aria-hidden="true"
      />
    );
  }

  return (
    <div
      className="fixed inset-0 w-full h-full pointer-events-none z-[-2] overflow-hidden select-none"
      aria-hidden="true"
    >
      {/* HTML5 Video Element (if local video is playable) */}
      {!useCanvasFallback ? (
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          disablePictureInPicture
          disableRemotePlayback
          onError={() => setUseCanvasFallback(true)}
          className="fixed inset-0 w-full h-full object-cover pointer-events-none z-[-2] brightness-[0.8] contrast-[1.1]"
        >
          <source src="/videos/road-safety-background.mp4" type="video/mp4" />
        </video>
      ) : null}

      {/* HTML5 Canvas Cinematic Road Safety Engine */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-full h-full pointer-events-none z-[-2]"
      />

      {/* Cinematic Dark Translucent Overlay - rgba(3, 8, 20, 0.65) equivalent */}
      <div
        className="fixed inset-0 w-full h-full pointer-events-none z-[-1] bg-slate-950/60 backdrop-blur-[1px] bg-gradient-to-b from-slate-950/70 via-slate-950/50 to-slate-950/75"
      />

      {/* Emergency Command Amber & Blue Ambient Glow Filter */}
      <div className="fixed inset-0 w-full h-full pointer-events-none z-[-1] opacity-25 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-amber-500/20 via-transparent to-blue-600/20" />
    </div>
  );
}

export const RoadSafetyBackground = RoadSafetyAnimatedBackground;
