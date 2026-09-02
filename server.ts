import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { sendEmergencySMS } from "./src/lib/smsService";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // CORS Middleware for external domains (e.g. Vercel)
  app.use((req, res, next) => {
    const origin = req.headers.origin;
    const allowedOrigins = [
      "https://golden-road-safety-git-main-nitesh933438-2748s-projects.vercel.app",
      "https://ais-dev-ovmzp75riuv2xh7szzuj77-278316738541.asia-southeast1.run.app",
      "https://ais-pre-ovmzp75riuv2xh7szzuj77-278316738541.asia-southeast1.run.app",
      "http://localhost:3000",
      "http://localhost:5173"
    ];

    if (origin) {
      if (allowedOrigins.includes(origin) || origin.endsWith(".vercel.app")) {
        res.setHeader("Access-Control-Allow-Origin", origin);
      } else {
        res.setHeader("Access-Control-Allow-Origin", "*");
      }
    } else {
      res.setHeader("Access-Control-Allow-Origin", "*");
    }

    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.setHeader("Access-Control-Allow-Credentials", "true");

    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }
    next();
  });

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.post("/api/emergency/sos", async (req, res) => {
    try {
      const { phone, latitude, longitude, timestamp, message } = req.body || {};
      if (!phone) {
        return res.status(400).json({ success: false, status: "FAILED", message: "Recipient phone number is required." });
      }

      const result = await sendEmergencySMS({
        phone,
        latitude: latitude || "Location unavailable",
        longitude: longitude || "Location unavailable",
        timestamp: timestamp || new Date().toISOString(),
        message: message || `🚨 GOLDENGUARD SOS ALERT 🚨\nEmergency assistance requested.\nTime: ${new Date().toLocaleString()}`,
      });

      if (result.success) {
        return res.status(200).json(result);
      } else {
        return res.status(200).json({
          ...result,
          success: false,
          notice: "Emergency alert could not be delivered. Please verify recipient number or use device SMS fallback."
        });
      }
    } catch (error: any) {
      console.error("API Emergency SOS Error:", error);
      return res.status(500).json({
        success: false,
        status: "FAILED",
        message: "Emergency alert could not be sent. Please call emergency services.",
        error: error.message
      });
    }
  });

  app.post("/api/chat", async (req, res) => {
    const { messages, emergencyType } = req.body || {};

    const fallbackReply = `⚠️ **Medical First Aid Protocol (${emergencyType || 'General Emergency'}):** \n\n*This is standard emergency first-aid guidance. For life-threatening situations, call emergency services (112 or 108) immediately.*\n\n**Key Emergency Steps:**\n1. Ensure the scene is completely safe before approaching.\n2. Check if the victim is conscious and breathing normally.\n3. Send someone to call 108/112 or press the GoldenGuard 1-Tap SOS button.\n4. Keep the victim calm and warm until medical responders arrive.`;

    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(200).json({ reply: fallbackReply });
      }

      const ai = new GoogleGenAI({ apiKey });

      const systemInstruction = `You are a medical AI First Aid Assistant. 
You are speaking to a person who may be experiencing or witnessing an emergency. 
They selected the emergency type: ${emergencyType || 'Unknown/General'}.

Follow these strict rules:
1. Always advise calling professional emergency services (e.g., 911, 112, 108) for serious situations.
2. Provide immediate, actionable, step-by-step first aid instructions.
3. Keep it brief and extremely clear.
4. Do not offer a medical diagnosis.
5. Emphasize safety first (ensure the scene is safe).
6. When possible, structure your response so it's easy to read in a high-stress situation.`;

      // Exponential backoff helper for Gemini call (max 2 retries, no retry on 429 rate limit)
      let attempt = 0;
      let response: any = null;
      
      while (attempt <= 2) {
        try {
          response = await ai.models.generateContent({
            model: "gemini-2.0-flash",
            contents: (messages || []).map((m: any) => ({ 
              role: m.role === 'user' ? 'user' : 'model', 
              parts: [{ text: m.content }] 
            })),
            config: {
              systemInstruction: systemInstruction,
              temperature: 0.2,
            }
          });
          break; // Success
        } catch (callErr: any) {
          const errStr = String(callErr?.message || callErr || "").toLowerCase();
          const isRateLimit = errStr.includes("429") || errStr.includes("resource_exhausted") || errStr.includes("quota") || errStr.includes("rate limit") || errStr.includes("rate exceeded");
          
          if (isRateLimit) {
            console.warn("Gemini API Rate Limit / Quota Exceeded. Returning immediate fallback.");
            return res.status(200).json({ reply: fallbackReply });
          }

          attempt++;
          if (attempt > 2) {
            throw callErr;
          }
          // Exponential backoff wait (300ms, 600ms)
          await new Promise(r => setTimeout(r, attempt * 300));
        }
      }

      if (response && response.text) {
        return res.status(200).json({ reply: response.text });
      } else {
        return res.status(200).json({ reply: fallbackReply });
      }
    } catch (error: any) {
      console.warn("Gemini API Notice (using first-aid fallback):", error?.message || error);
      return res.status(200).json({ reply: fallbackReply });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch(console.error);
