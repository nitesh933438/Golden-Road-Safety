import { GoogleGenAI } from "@google/genai";

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { messages, emergencyType } = req.body || {};

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "GEMINI_API_KEY environment variable is missing." });
    }

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
      model: "gemini-2.0-flash",
      contents: (messages || []).map((m: any) => ({ role: m.role === 'user' ? 'user' : 'model', parts: [{ text: m.content }] })),
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.2,
      },
    });

    return res.status(200).json({ reply: response.text });
  } catch (error: any) {
    console.error("Gemini API Error / Quota Notice:", error);
    // Graceful fallback for quota exceeded / rate limits so user always gets first aid guidance
    const fallbackReply = `⚠️ **Medical First Aid Notice (AI Quota / Rate Limit Notice):** \n\n*This is general first-aid guidance and does not replace professional medical care. For life-threatening situations, call emergency services (112 or 108) immediately.*\n\n**Standard Emergency Steps for ${emergencyType || 'General Emergency'}:**\n1. Ensure the scene is safe.\n2. Check responsiveness and breathing.\n3. Call emergency services or press SOS immediately.\n4. Administer basic life support or first aid as trained while waiting for responders.`;
    return res.status(200).json({ reply: fallbackReply });
  }
}
