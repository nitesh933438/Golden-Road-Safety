import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API routes FIRST
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.post("/api/chat", async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "GEMINI_API_KEY environment variable is missing." });
      }

      const { messages, emergencyType } = req.body;
      const ai = new GoogleGenAI({ apiKey });

      const systemInstruction = `You are a medical AI First Aid Assistant. 
You provide immediate, step-by-step first aid instructions.
Current emergency context: ${emergencyType || 'Unknown'}.
CRITICAL RULES:
1. ALWAYS start with a clear, bold disclaimer that you are providing general first-aid guidance and NOT replacing professional medical care. Advise contacting emergency services immediately for life-threatening situations.
2. Be extremely concise. Use short sentences.
3. Provide instructions step-by-step. 
4. Ask follow-up questions if you need more clarity to provide safe help.
5. If the situation is critical, instruct them to call emergency services (e.g., 108 in India or 112) BEFORE doing anything else.
6. When possible, structure your response so it's easy to read in a high-stress situation.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: messages.map((m: any) => ({ role: m.role === 'user' ? 'user' : 'model', parts: [{ text: m.content }] })),
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.2,
        },
      });

      res.json({ reply: response.text });
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      res.status(500).json({ error: error.message || "Failed to generate response" });
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
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
