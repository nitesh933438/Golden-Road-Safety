import { sendEmergencySMS } from "../../src/lib/smsService";

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

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
    });
  }
}
