import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { sendEmergencySMS } from "./src/lib/smsService";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

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
        return res.status(500).json(result);
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

    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "Gemini API key is not configured" });
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

      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: (messages || []).map((m: any) => ({ role: m.role === 'user' ? 'user' : 'model', parts: [{ text: m.content }] })),
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.2,
        }
      });

      return res.status(200).json({ reply: response.text });
    } catch (error: any) {
      console.error("Gemini API Error / Quota Notice:", error);
      // Graceful fallback for quota exceeded / rate limits so user always gets first aid guidance
      const fallbackReply = `⚠️ **Medical First Aid Notice (AI Quota / Rate Limit Notice):** \n\n*This is general first-aid guidance and does not replace professional medical care. For life-threatening situations, call emergency services (112 or 108) immediately.*\n\n**Standard Emergency Steps for ${emergencyType || 'General Emergency'}:**\n1. Ensure the scene is safe.\n2. Check responsiveness and breathing.\n3. Call emergency services or press SOS immediately.\n4. Administer basic life support or first aid as trained while waiting for responders.`;
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
