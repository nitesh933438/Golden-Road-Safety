const fs = require('fs');
const { spawn } = require('child_process');

console.log("Building cinematic 15-second 720p 30fps seamless road safety MP4 video...");

const width = 1280;
const height = 720;
const fps = 30;
const duration = 15;
const totalFrames = fps * duration;

const ffmpeg = spawn('ffmpeg', [
  '-y',
  '-f', 'rawvideo',
  '-vcodec', 'rawvideo',
  '-s', `${width}x${height}`,
  '-pix_fmt', 'rgb24',
  '-r', `${fps}`,
  '-i', '-',
  '-c:v', 'libx264',
  '-pix_fmt', 'yuv420p',
  '-preset', 'fast',
  '-crf', '20',
  'public/videos/road-safety-background.mp4'
]);

ffmpeg.stderr.on('data', (data) => {
  // Silence ffmpeg verbose output unless error
});

ffmpeg.on('close', (code) => {
  console.log(`FFmpeg finished with code ${code}. Video created at public/videos/road-safety-background.mp4`);
});

const horizonY = Math.floor(height * 0.50);
const vanishingX = Math.floor(width * 0.5);

// Precompute static horizon & sky background buffer
const bgBuffer = Buffer.alloc(width * height * 3);

// Generate skyline heights
const buildingWidth = 32;
const numBuildings = Math.ceil(width / buildingWidth);
const buildingHeights = new Array(numBuildings).fill(0).map((_, i) => {
  return Math.floor(25 + Math.abs(Math.sin(i * 1.8) * 80) + (i % 5 === 0 ? 40 : 0));
});

for (let y = 0; y < height; y++) {
  const isSky = y < horizonY;
  const isRoad = y >= horizonY;

  for (let x = 0; x < width; x++) {
    const idx = (y * width + x) * 3;

    if (isSky) {
      const buildingIdx = Math.floor(x / buildingWidth);
      const bHeight = buildingHeights[buildingIdx] || 30;
      const buildingTop = horizonY - bHeight;

      if (y >= buildingTop) {
        // Building silhouette
        bgBuffer[idx] = 6;
        bgBuffer[idx + 1] = 11;
        bgBuffer[idx + 2] = 22;

        // Glowing windows in buildings
        if ((x % 8 >= 2 && x % 8 <= 4) && (y % 12 >= 2 && y % 12 <= 4) && (buildingIdx % 2 === 0)) {
          bgBuffer[idx] = 245;
          bgBuffer[idx + 1] = 158;
          bgBuffer[idx + 2] = 11; // Amber window glow
        }
      } else {
        // Night sky gradient
        const factor = y / horizonY;
        bgBuffer[idx] = Math.floor(3 + factor * 8);
        bgBuffer[idx + 1] = Math.floor(7 + factor * 12);
        bgBuffer[idx + 2] = Math.floor(18 + factor * 22);
      }
    } else {
      // Asphalt Road gradient
      const roadFactor = (y - horizonY) / (height - horizonY);
      bgBuffer[idx] = Math.floor(10 + roadFactor * 12);
      bgBuffer[idx + 1] = Math.floor(14 + roadFactor * 15);
      bgBuffer[idx + 2] = Math.floor(24 + roadFactor * 20);
    }
  }
}

// Traffic Vehicles Data (Headlights, Taillights, Emergency Vehicles)
const numVehicles = 40;
const vehicles = [];
for (let i = 0; i < numVehicles; i++) {
  vehicles.push({
    z: (i / numVehicles) * 1.0, // depth 0..1
    speed: 0.002 + Math.random() * 0.003,
    laneOffset: (Math.random() - 0.5) * 0.85,
    type: i % 8 === 0 ? 'emergency' : i % 2 === 0 ? 'taillight' : 'headlight'
  });
}

function drawCircle(buf, cx, cy, radius, r, g, b, alpha = 1.0) {
  const minX = Math.max(0, Math.floor(cx - radius));
  const maxX = Math.min(width - 1, Math.ceil(cx + radius));
  const minY = Math.max(0, Math.floor(cy - radius));
  const maxY = Math.min(height - 1, Math.ceil(cy + radius));
  const rSq = radius * radius;

  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      const dx = x - cx;
      const dy = y - cy;
      const distSq = dx * dx + dy * dy;
      if (distSq <= rSq) {
        const falloff = 1.0 - Math.sqrt(distSq) / radius;
        const currentAlpha = alpha * falloff;
        const idx = (y * width + x) * 3;

        buf[idx] = Math.min(255, Math.floor(buf[idx] * (1 - currentAlpha) + r * currentAlpha));
        buf[idx + 1] = Math.min(255, Math.floor(buf[idx + 1] * (1 - currentAlpha) + g * currentAlpha));
        buf[idx + 2] = Math.min(255, Math.floor(buf[idx + 2] * (1 - currentAlpha) + b * currentAlpha));
      }
    }
  }
}

// Render each frame
for (let frame = 0; frame < totalFrames; frame++) {
  const frameBuf = Buffer.from(bgBuffer);
  const time = frame / fps;

  // 1. Draw Horizon Line Glow
  const horizonGlowAlpha = 0.35 + Math.sin(time * 2) * 0.1;
  for (let x = 0; x < width; x++) {
    for (let dy = -3; dy <= 3; dy++) {
      const y = horizonY + dy;
      if (y >= 0 && y < height) {
        const idx = (y * width + x) * 3;
        frameBuf[idx] = Math.min(255, frameBuf[idx] + Math.floor(245 * horizonGlowAlpha * 0.4));
        frameBuf[idx + 1] = Math.min(255, frameBuf[idx + 1] + Math.floor(158 * horizonGlowAlpha * 0.4));
        frameBuf[idx + 2] = Math.min(255, frameBuf[idx + 2] + Math.floor(11 * horizonGlowAlpha * 0.4));
      }
    }
  }

  // 2. Road Edges & Center Dashed Lines
  const numDashes = 14;
  for (let i = 0; i < numDashes; i++) {
    const p1 = (i / numDashes + (time * 0.25) % (1 / numDashes));
    if (p1 > 0 && p1 <= 1) {
      const p1Sq = p1 * p1;
      const y = Math.floor(horizonY + (height - horizonY) * p1Sq);
      const dashWidth = Math.floor(2 + p1Sq * 8);

      if (y >= horizonY && y < height) {
        for (let dx = -dashWidth; dx <= dashWidth; dx++) {
          const cx = vanishingX + dx;
          if (cx >= 0 && cx < width) {
            const idx = (y * width + cx) * 3;
            frameBuf[idx] = 255;
            frameBuf[idx + 1] = 255;
            frameBuf[idx + 2] = 255;
          }
        }
      }
    }
  }

  // 3. Render Vehicles (Headlights, Taillights, Emergency Vehicles)
  vehicles.forEach((v) => {
    v.z += v.speed;
    if (v.z > 1.0) {
      v.z = 0.01;
      v.laneOffset = (Math.random() - 0.5) * 0.85;
    }

    const scale = Math.pow(v.z, 2.2);
    const currY = horizonY + (height - horizonY) * scale;
    const spread = (width * 0.44) * scale;
    const currX = vanishingX + v.laneOffset * spread;
    const size = 2 + scale * 12;

    if (currY >= horizonY && currY < height && currX >= 0 && currX < width) {
      if (v.type === 'taillight') {
        drawCircle(frameBuf, currX, currY, size * 2.5, 239, 68, 68, 0.4); // Red glow
        drawCircle(frameBuf, currX, currY, size, 255, 100, 100, 0.95); // Core
      } else if (v.type === 'headlight') {
        drawCircle(frameBuf, currX, currY, size * 3, 245, 158, 11, 0.35); // Amber glow
        drawCircle(frameBuf, currX, currY, size, 255, 250, 220, 0.95); // Core
      } else if (v.type === 'emergency') {
        const isRedPhase = Math.sin(time * 12 + v.laneOffset * 10) > 0;
        if (isRedPhase) {
          drawCircle(frameBuf, currX, currY, size * 4, 239, 68, 68, 0.6);
          drawCircle(frameBuf, currX, currY, size * 1.2, 255, 255, 255, 0.95);
        } else {
          drawCircle(frameBuf, currX, currY, size * 4, 59, 130, 246, 0.6);
          drawCircle(frameBuf, currX, currY, size * 1.2, 255, 255, 255, 0.95);
        }
      }
    }
  });

  ffmpeg.stdin.write(frameBuf);
}

ffmpeg.stdin.end();
