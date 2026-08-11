import React, { useEffect, useRef, useState } from "react";

export function RoadSafetyAnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
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

  // High performance Cinematic Canvas Road Safety Command Engine
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

    // City Skyline Buildings (Pre-generated for visual consistency)
    const buildingWidth = 40;
    const numBuildings = Math.ceil(width / buildingWidth) + 4;
    const buildings = Array.from({ length: numBuildings }, (_, i) => ({
      height: 40 + Math.abs(Math.sin(i * 1.5) * 110) + (i % 5 === 0 ? 60 : 0),
      hasLights: i % 2 === 0,
      lightColor: i % 3 === 0 ? "#f59e0b" : i % 5 === 0 ? "#3b82f6" : "#e2e8f0",
    }));

    // Vehicles State
    // Oncoming (headlights + white light trails), Outgoing (taillights + red trails), Emergency (strobes)
    const numVehicles = 24;
    const vehicles = Array.from({ length: numVehicles }, (_, i) => ({
      lane: (i % 3) - 1, // Left (-1), Middle (0), Right (1)
      z: (i / numVehicles) * 1.0, // 0 (horizon) to 1 (near)
      speed: 0.003 + (i % 3) * 0.002,
      direction: i % 2 === 0 ? 1 : -1, // 1 = Outgoing, -1 = Oncoming
      isEmergency: i % 6 === 0, // Ambulance or Police Patrol every 6th vehicle
      vehicleType: i % 4 === 0 ? "truck" : "car",
    }));

    // Traffic Lights Gantry (subtle traffic signal indicators)
    const trafficSignals = [
      { xPercent: 0.25, side: "left", state: "green", timer: 0 },
      { xPercent: 0.75, side: "right", state: "red", timer: 120 }
    ];

    // Rain drop streaks
    const numRainDrops = 60;
    const rainDrops = Array.from({ length: numRainDrops }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      length: 12 + Math.random() * 15,
      speed: 8 + Math.random() * 8,
      opacity: 0.08 + Math.random() * 0.12,
    }));

    // Floating Command Safety Indicators (Pulsing holographic responder targets)
    const safetyBeacons = Array.from({ length: 6 }, (_, i) => ({
      xPercent: 0.15 + i * 0.14,
      yPercent: 0.50 + Math.sin(i) * 0.06,
      pulseSpeed: 1.5 + (i % 3) * 0.5,
      label: i % 3 === 0 ? "TRAUMA BAY" : i % 3 === 1 ? "VOLUNTEER" : "POLICE",
      iconColor: i % 3 === 0 ? "#ef4444" : i % 3 === 1 ? "#10b981" : "#3b82f6",
    }));

    let time = 0;
    let lightOffset = 0;

    const render = () => {
      if (width <= 0 || height <= 0) {
        if (!prefersReducedMotion && document.visibilityState === "visible") {
          animId = requestAnimationFrame(render);
        }
        return;
      }

      time += 0.016; // Approx 60fps time step
      lightOffset = (lightOffset + 0.004) % 1;

      const isDark = document.documentElement.classList.contains("dark");
      const horizonY = height * 0.46;
      const vanishingX = width * 0.5;

      // Update Rain Drops
      if (!prefersReducedMotion) {
        rainDrops.forEach((drop) => {
          drop.y += drop.speed;
          drop.x -= 1.5; // windy slant
          if (drop.y > height) {
            drop.y = -drop.length;
            drop.x = Math.random() * width;
          }
        });
      }

      // Update Traffic Signals state cycling
      trafficSignals.forEach((sig) => {
        sig.timer += 1;
        if (sig.timer % 300 === 0) {
          sig.state = sig.state === "green" ? "amber" : sig.state === "amber" ? "red" : "green";
        }
      });

      // 1. SKY & BACKGROUND GRADIENT (Dark vs Light themed command centers)
      const skyGrad = ctx.createLinearGradient(0, 0, 0, horizonY);
      if (isDark) {
        skyGrad.addColorStop(0, "#020617"); // Deep night space
        skyGrad.addColorStop(0.5, "#0b1329"); // Tactical dark blue
        skyGrad.addColorStop(1, "#101b38"); // Ambient blue glow
      } else {
        skyGrad.addColorStop(0, "#f1f5f9"); // Crisp light gray
        skyGrad.addColorStop(0.7, "#e2e8f0"); // Soft sky
        skyGrad.addColorStop(1, "#cbd5e1"); // Silver-blue horizon
      }
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, horizonY);

      // Distant Horizon Amber/Blue Command Network Glow
      const horizonGlow = ctx.createRadialGradient(
        vanishingX, horizonY, 20,
        vanishingX, horizonY, width * 0.7
      );
      if (isDark) {
        horizonGlow.addColorStop(0, "rgba(245, 158, 11, 0.18)"); // Warm Golden Hour Amber
        horizonGlow.addColorStop(0.4, "rgba(59, 130, 246, 0.1)"); // Tactical Blue
        horizonGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
      } else {
        horizonGlow.addColorStop(0, "rgba(245, 158, 11, 0.15)");
        horizonGlow.addColorStop(0.5, "rgba(59, 130, 246, 0.06)");
        horizonGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
      }
      ctx.fillStyle = horizonGlow;
      ctx.fillRect(0, 0, width, horizonY + 15);

      // 2. CITY SKYLINE SILHOUETTES WITH GLOWING WINDOWS
      ctx.fillStyle = isDark ? "#060b18" : "#94a3b8";
      buildings.forEach((b, idx) => {
        const bX = idx * buildingWidth - 20;
        const bY = horizonY - b.height;
        ctx.fillRect(bX, bY, buildingWidth - 3, b.height);

        // Render delicate digital grids / windows inside towers
        if (b.hasLights) {
          ctx.fillStyle = b.lightColor;
          ctx.globalAlpha = isDark ? (0.35 + Math.sin(time + idx * 1.5) * 0.2) : 0.6;
          for (let wy = bY + 10; wy < horizonY - 4; wy += 14) {
            for (let wx = bX + 5; wx < bX + buildingWidth - 8; wx += 9) {
              if ((wx + wy + idx) % 3 === 0) {
                ctx.fillRect(wx, wy, 2.5, 3.5);
              }
            }
          }
          ctx.globalAlpha = 1.0;
          ctx.fillStyle = isDark ? "#060b18" : "#94a3b8";
        }
      });

      // 3. ASPHALT ROADWAY WITH PERSPECTIVE
      const roadGrad = ctx.createLinearGradient(0, horizonY, 0, height);
      if (isDark) {
        roadGrad.addColorStop(0, "#060914"); // Near black horizon
        roadGrad.addColorStop(0.5, "#0b0f1d"); // Deep slate core
        roadGrad.addColorStop(1, "#02040a"); // Dark foreground
      } else {
        roadGrad.addColorStop(0, "#475569"); // Steel gray
        roadGrad.addColorStop(0.5, "#334155"); // Wet pavement
        roadGrad.addColorStop(1, "#1e293b"); // Deep charcoal
      }
      ctx.fillStyle = roadGrad;

      const roadBottomLeft = -width * 0.3;
      const roadBottomRight = width * 1.3;
      const roadTopLeft = vanishingX - width * 0.08;
      const roadTopRight = vanishingX + width * 0.08;

      ctx.beginPath();
      ctx.moveTo(roadTopLeft, horizonY);
      ctx.lineTo(roadTopRight, horizonY);
      ctx.lineTo(roadBottomRight, height);
      ctx.lineTo(roadBottomLeft, height);
      ctx.closePath();
      ctx.fill();

      // Road shoulder solid lines (White and Amber)
      ctx.lineWidth = 3;
      ctx.strokeStyle = "rgba(245, 158, 11, 0.7)"; // Amber safety line on left
      ctx.beginPath();
      ctx.moveTo(roadTopLeft, horizonY);
      ctx.lineTo(roadBottomLeft, height);
      ctx.stroke();

      ctx.strokeStyle = "rgba(255, 255, 255, 0.6)"; // High-visibility white shoulder on right
      ctx.beginPath();
      ctx.moveTo(roadTopRight, horizonY);
      ctx.lineTo(roadBottomRight, height);
      ctx.stroke();

      // 4. EMERGENCY ROUTE / PATH ANIMATION ("Green Safe Corridor")
      // We overlay a glowing neon-blue priority highway channel in the left lane (lane = -1)
      const pathPulse = 0.6 + Math.sin(time * 4) * 0.3;
      const bluePathGrad = ctx.createLinearGradient(vanishingX, horizonY, vanishingX, height);
      bluePathGrad.addColorStop(0, `rgba(59, 130, 246, ${0.1 * pathPulse})`);
      bluePathGrad.addColorStop(1, `rgba(59, 130, 246, ${0.35 * pathPulse})`);

      // Left-lane trapezoid boundaries
      const leftLaneTopLeft = roadTopLeft + (roadTopRight - roadTopLeft) * 0.01;
      const leftLaneTopRight = roadTopLeft + (roadTopRight - roadTopLeft) * 0.33;
      const leftLaneBottomLeft = roadBottomLeft + (roadBottomRight - roadBottomLeft) * 0.01;
      const leftLaneBottomRight = roadBottomLeft + (roadBottomRight - roadBottomLeft) * 0.33;

      ctx.fillStyle = bluePathGrad;
      ctx.beginPath();
      ctx.moveTo(leftLaneTopLeft, horizonY);
      ctx.lineTo(leftLaneTopRight, horizonY);
      ctx.lineTo(leftLaneBottomRight, height);
      ctx.lineTo(leftLaneBottomLeft, height);
      ctx.closePath();
      ctx.fill();

      // Add animated neon-blue arrows or chevrons inside the Green Corridor lane
      ctx.strokeStyle = "rgba(59, 130, 246, 0.6)";
      ctx.lineWidth = 2.5;
      const arrowStep = (time * 1.5) % 1;
      for (let a = 0; a < 8; a++) {
        const zArrow = (a / 8 + arrowStep / 8) % 1;
        const pArrow = Math.pow(zArrow, 2.5);
        const yArrow = horizonY + (height - horizonY) * pArrow;
        
        const laneCenterX = leftLaneTopLeft + (leftLaneTopRight - leftLaneTopLeft) * 0.5;
        const laneCenterBottomX = leftLaneBottomLeft + (leftLaneBottomRight - leftLaneBottomLeft) * 0.5;
        const xArrow = laneCenterX + (laneCenterBottomX - laneCenterX) * pArrow;

        const arrowSize = 10 * pArrow;
        if (yArrow > horizonY && yArrow < height && arrowSize > 1) {
          ctx.beginPath();
          ctx.moveTo(xArrow - arrowSize, yArrow - arrowSize * 0.5);
          ctx.lineTo(xArrow, yArrow);
          ctx.lineTo(xArrow + arrowSize, yArrow - arrowSize * 0.5);
          ctx.stroke();
        }
      }

      // 5. MOVING ROAD-LIGHT GLOW & PERSPECTIVE LANE MARKINGS
      const laneDashSpeed = (time * 0.8) % 1;
      const numLanes = 3;
      const numDashes = 15;

      for (let l = 1; l < numLanes; l++) {
        const laneRatio = l / numLanes;
        ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";

        for (let d = 0; d < numDashes; d++) {
          const z1 = ((d / numDashes) + laneDashSpeed / numDashes) % 1;
          if (z1 < 0.02) continue;

          const z2 = z1 + 0.03;
          if (z2 > 0.98) continue;

          // Square/quadratic scaling for perspective depth
          const p1 = Math.pow(z1, 2.2);
          const p2 = Math.pow(z2, 2.2);

          const y1 = horizonY + (height - horizonY) * p1;
          const y2 = horizonY + (height - horizonY) * p2;

          const width1 = roadTopLeft + (roadTopRight - roadTopLeft) * laneRatio + (roadBottomLeft + (roadBottomRight - roadBottomLeft) * laneRatio - (roadTopLeft + (roadTopRight - roadTopLeft) * laneRatio)) * p1;
          const width2 = roadTopLeft + (roadTopRight - roadTopLeft) * laneRatio + (roadBottomLeft + (roadBottomRight - roadBottomLeft) * laneRatio - (roadTopLeft + (roadTopRight - roadTopLeft) * laneRatio)) * p2;

          ctx.lineWidth = Math.max(1, p1 * 5.5);
          ctx.beginPath();
          ctx.moveTo(width1, y1);
          ctx.lineTo(width2, y2);
          ctx.stroke();
        }
      }

      // Overhead lamp structures & street lights
      const numLights = 10;
      for (let i = 0; i < numLights; i++) {
        const z = ((i / numLights) + lightOffset) % 1;
        if (z < 0.02) continue;

        const p = Math.pow(z, 2.3);
        const poleY = horizonY + (height - horizonY) * p;
        const poleXLeft = roadTopLeft + (roadBottomLeft - roadTopLeft) * p - 12 * p;
        const poleXRight = roadTopRight + (roadBottomRight - roadTopRight) * p + 12 * p;
        
        // Render glowing circles on the pavement representing moving street lamp cones
        const radialGlow = ctx.createRadialGradient(
          poleXLeft + 25 * p, poleY, 0,
          poleXLeft + 25 * p, poleY, 40 * p
        );
        radialGlow.addColorStop(0, "rgba(245, 158, 11, 0.15)");
        radialGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = radialGlow;
        ctx.beginPath();
        ctx.ellipse(poleXLeft + 25 * p, poleY, 40 * p, 12 * p, 0, 0, Math.PI * 2);
        ctx.fill();

        // High-altitude lamp bulbs
        ctx.fillStyle = "#f59e0b";
        ctx.beginPath();
        ctx.arc(poleXLeft, poleY - 45 * p, Math.max(1, 3 * p), 0, Math.PI * 2);
        ctx.arc(poleXRight, poleY - 45 * p, Math.max(1, 3 * p), 0, Math.PI * 2);
        ctx.fill();
      }

      // 6. SUBTLE MOVING TRAFFIC LIGHT STRUCTURES
      trafficSignals.forEach((sig) => {
        const sigX = sig.side === "left" ? width * sig.xPercent - 100 : width * sig.xPercent + 100;
        const sigY = horizonY - 12;
        
        // Draw small structural pole and box
        ctx.strokeStyle = isDark ? "#1e293b" : "#64748b";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(sigX, horizonY);
        ctx.lineTo(sigX, sigY);
        ctx.stroke();

        ctx.fillStyle = "#0f172a";
        ctx.fillRect(sigX - 6, sigY - 18, 12, 20);

        // Draw light based on current cycled state
        ctx.fillStyle = sig.state === "red" ? "#ef4444" : "#1e293b";
        ctx.beginPath();
        ctx.arc(sigX, sigY - 14, 2.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = sig.state === "amber" ? "#f59e0b" : "#1e293b";
        ctx.beginPath();
        ctx.arc(sigX, sigY - 9, 2.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = sig.state === "green" ? "#10b981" : "#1e293b";
        ctx.beginPath();
        ctx.arc(sigX, sigY - 4, 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Glowing halos from the traffic signal
        if (sig.state !== "amber" || Math.floor(time * 10) % 2 === 0) {
          const glowColor = sig.state === "red" ? "rgba(239, 68, 68, 0.4)" : sig.state === "green" ? "rgba(16, 185, 129, 0.4)" : "rgba(245, 158, 11, 0.4)";
          const sigGlow = ctx.createRadialGradient(sigX, sigY - 9, 1, sigX, sigY - 9, 15);
          sigGlow.addColorStop(0, glowColor);
          sigGlow.addColorStop(1, "rgba(0,0,0,0)");
          ctx.fillStyle = sigGlow;
          ctx.beginPath();
          ctx.arc(sigX, sigY - 9, 15, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // 7. HIGH-SPEED VEHICLES & EXQUISITE NEON VEHICLE LIGHT TRAILS
      vehicles.sort((a, b) => a.z - b.z);

      vehicles.forEach((v) => {
        if (!prefersReducedMotion) {
          // Oncoming flows faster to simulate speed differential
          v.z += v.speed * (v.direction === -1 ? 1.3 : 0.8);
          if (v.z > 1.0) {
            v.z = 0.01;
            v.lane = (Math.floor(Math.random() * 3) - 1);
          }
        }

        const p = Math.pow(v.z, 2.2);
        const vY = horizonY + (height - horizonY) * p;

        // Perspective horizontal position mapping
        const laneCenterX = roadTopLeft + (roadTopRight - roadTopLeft) * ((v.lane + 1) / 2);
        const laneCenterBottomX = roadBottomLeft + (roadBottomRight - roadBottomLeft) * ((v.lane + 1) / 2);
        const vX = laneCenterX + (laneCenterBottomX - laneCenterX) * p;

        const vSize = Math.max(3, 20 * p);

        if (vY >= horizonY && vY < height && vX >= 0 && vX < width) {
          if (v.direction === -1) {
            // ONCOMING TRAFFIC: Dual bright white/yellow headlights + long light trails
            const spread = vSize * 0.75;

            // Longitudinal headlight trail stretching toward user
            const headlightTrail = ctx.createLinearGradient(vX, vY, vX, vY + vSize * 6);
            headlightTrail.addColorStop(0, "rgba(254, 240, 138, 0.35)");
            headlightTrail.addColorStop(0.5, "rgba(254, 240, 138, 0.1)");
            headlightTrail.addColorStop(1, "rgba(254, 240, 138, 0)");
            ctx.fillStyle = headlightTrail;
            ctx.beginPath();
            ctx.moveTo(vX - spread * 1.5, vY);
            ctx.lineTo(vX + spread * 1.5, vY);
            ctx.lineTo(vX + spread * 3.5, vY + vSize * 6);
            ctx.lineTo(vX - spread * 3.5, vY + vSize * 6);
            ctx.closePath();
            ctx.fill();

            // Headlight bulbs
            ctx.fillStyle = "#ffffff";
            ctx.beginPath();
            ctx.arc(vX - spread, vY, Math.max(1, vSize * 0.25), 0, Math.PI * 2);
            ctx.arc(vX + spread, vY, Math.max(1, vSize * 0.25), 0, Math.PI * 2);
            ctx.fill();
            
            // Core light center
            ctx.fillStyle = "#fef08a";
            ctx.beginPath();
            ctx.arc(vX - spread, vY, Math.max(0.5, vSize * 0.12), 0, Math.PI * 2);
            ctx.arc(vX + spread, vY, Math.max(0.5, vSize * 0.12), 0, Math.PI * 2);
            ctx.fill();
          } else {
            // OUTGOING TRAFFIC: Red taillights + elegant glowing trails going backwards
            const spread = vSize * 0.65;

            // Taillight speed trail
            const redTrail = ctx.createLinearGradient(vX, vY, vX, vY - vSize * 4);
            redTrail.addColorStop(0, "rgba(239, 68, 68, 0.4)");
            redTrail.addColorStop(1, "rgba(239, 68, 68, 0)");
            ctx.fillStyle = redTrail;
            ctx.beginPath();
            ctx.moveTo(vX - spread, vY);
            ctx.lineTo(vX + spread, vY);
            ctx.lineTo(vX + spread * 0.6, vY - vSize * 4);
            ctx.lineTo(vX - spread * 0.6, vY - vSize * 4);
            ctx.closePath();
            ctx.fill();

            // Taillight bulbs
            ctx.fillStyle = "#ef4444";
            ctx.beginPath();
            ctx.arc(vX - spread, vY, Math.max(1, vSize * 0.25), 0, Math.PI * 2);
            ctx.arc(vX + spread, vY, Math.max(1, vSize * 0.25), 0, Math.PI * 2);
            ctx.fill();
          }

          // EMERGENCY VEHICLE SIRENS (Alternating Red/Blue Strobe flashing)
          if (v.isEmergency) {
            const isRedPhase = Math.floor(time * 14 + v.lane * 3) % 2 === 0;
            const emergencyColor = isRedPhase ? "rgba(239, 68, 68, 0.75)" : "rgba(59, 130, 246, 0.75)";
            const strobeCore = isRedPhase ? "#ef4444" : "#3b82f6";

            // Ambient circular flash
            const sirenFlash = ctx.createRadialGradient(vX, vY - vSize * 0.8, 1, vX, vY - vSize * 0.8, vSize * 8);
            sirenFlash.addColorStop(0, emergencyColor);
            sirenFlash.addColorStop(1, "rgba(0,0,0,0)");
            ctx.fillStyle = sirenFlash;
            ctx.beginPath();
            ctx.arc(vX, vY - vSize * 0.8, vSize * 8, 0, Math.PI * 2);
            ctx.fill();

            // Lightbar physical block
            ctx.fillStyle = strobeCore;
            ctx.fillRect(vX - vSize * 0.5, vY - vSize * 1.1, vSize * 1.0, Math.max(2, vSize * 0.3));
          }
        }
      });

      // 8. SIREN SWEEPS REFLECTING ON THE WET ASPHALT
      const overallSiren = Math.sin(time * 3);
      if (isDark) {
        if (overallSiren > 0.7) {
          ctx.fillStyle = "rgba(220, 38, 38, 0.035)"; // Urgent Red Flash
          ctx.fillRect(0, 0, width, height);
        } else if (overallSiren < -0.7) {
          ctx.fillStyle = "rgba(37, 99, 235, 0.035)"; // Police Blue Flash
          ctx.fillRect(0, 0, width, height);
        }
      }

      // 9. FLOATING SAFETY BEACONS (Command Network status rings)
      safetyBeacons.forEach((b) => {
        const beaconX = width * b.xPercent;
        const beaconY = horizonY - 15 + Math.sin(time * b.pulseSpeed) * 8;
        
        const pulseRatio = (time * b.pulseSpeed) % 1;
        const pulseSize = 10 + pulseRatio * 20;
        const pulseAlpha = 1 - pulseRatio;

        // Outer pulsing target rings
        ctx.strokeStyle = b.iconColor;
        ctx.globalAlpha = pulseAlpha * 0.4;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(beaconX, beaconY, pulseSize, 0, Math.PI * 2);
        ctx.stroke();

        // Solid inner anchor point
        ctx.globalAlpha = 0.85;
        ctx.fillStyle = b.iconColor;
        ctx.beginPath();
        ctx.arc(beaconX, beaconY, 3, 0, Math.PI * 2);
        ctx.fill();

        // Subtle text box floating above
        if (isDark) {
          ctx.fillStyle = "rgba(15, 23, 42, 0.8)";
          ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
        } else {
          ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
          ctx.strokeStyle = "rgba(15, 23, 42, 0.1)";
        }
        ctx.lineWidth = 1;
        ctx.fillRect(beaconX - 25, beaconY - 16, 50, 10);
        ctx.strokeRect(beaconX - 25, beaconY - 16, 50, 10);

        ctx.fillStyle = isDark ? "#e2e8f0" : "#0f172a";
        ctx.font = "bold 6px monospace";
        ctx.textAlign = "center";
        ctx.fillText(b.label, beaconX, beaconY - 9);
        ctx.globalAlpha = 1.0;
      });

      // 10. SUBTLE RAIN & WATER REFLECTIONS overlay
      ctx.strokeStyle = isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(15, 23, 42, 0.05)";
      ctx.lineWidth = 1.2;
      rainDrops.forEach((drop) => {
        ctx.beginPath();
        ctx.moveTo(drop.x, drop.y);
        ctx.lineTo(drop.x - 2.5, drop.y + drop.length);
        ctx.stroke();
      });

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
      {/* HTML5 Canvas Cinematic Road Safety Engine */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-full h-full pointer-events-none z-[-2]"
      />

      {/* Cinematic Semi-Translucent Theme-Dependent Overlay */}
      <div
        className="fixed inset-0 w-full h-full pointer-events-none z-[-1] bg-surface-50/75 dark:bg-slate-950/70 backdrop-blur-[1px] transition-colors duration-300"
      />

      {/* Emergency Command Amber & Blue Ambient Glow Filter */}
      <div className="fixed inset-0 w-full h-full pointer-events-none z-[-1] opacity-20 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-amber-500/20 via-transparent to-blue-600/20" />
    </div>
  );
}

export const RoadSafetyBackground = RoadSafetyAnimatedBackground;
