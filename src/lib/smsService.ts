// SMS Service Abstraction Layer for Backend Emergency Dispatch
// Supports Twilio REST API integration using server environment variables:
// TWILIO_ACCOUNT_SID / SMS_ACCOUNT_SID, TWILIO_AUTH_TOKEN / SMS_AUTH_TOKEN, TWILIO_FROM_NUMBER / SMS_FROM_NUMBER / TWILIO_PHONE_NUMBER.

export interface SMSPayload {
  phone?: string;
  phones?: string[];
  recipientName?: string;
  latitude: string | number;
  longitude: string | number;
  timestamp: string;
  message: string;
}

export interface RecipientResult {
  phone: string;
  success: boolean;
  status: "SENT" | "FAILED";
  message: string;
  providerResponse?: any;
}

export interface SMSResponse {
  success: boolean;
  status: "SENT" | "FAILED" | "PENDING";
  message: string;
  sentCount?: number;
  failedCount?: number;
  recipientResults?: RecipientResult[];
  providerResponse?: any;
}

/**
 * Validates if a phone number is in valid E.164 format (+[country code][number]).
 */
export function isValidE164(phone: string): boolean {
  if (!phone) return false;
  const e164Regex = /^\+[1-9]\d{1,14}$/;
  return e164Regex.test(phone.trim());
}

/**
 * Formats a phone number into E.164 format if possible.
 * Converts Indian 10-digit numbers to +91XXXXXXXXXX automatically.
 */
export function formatToE164(phone: string): string {
  if (!phone) return "";
  let cleaned = phone.trim().replace(/[\s()-]/g, "");
  if (!cleaned.startsWith("+")) {
    if (cleaned.length === 10) {
      cleaned = `+91${cleaned}`;
    } else {
      cleaned = `+${cleaned}`;
    }
  }
  return cleaned;
}

/**
 * Sends an emergency SOS SMS via Twilio to real saved emergency contacts.
 * Keeps private API credentials strictly server-side.
 * Never uses fake/demo fallback simulator data.
 */
export async function sendEmergencySMS(payload: SMSPayload): Promise<SMSResponse> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID || process.env.SMS_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN || process.env.SMS_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_FROM_NUMBER || process.env.SMS_FROM_NUMBER || process.env.TWILIO_PHONE_NUMBER;

  // Extract real target phone numbers
  const rawList: string[] = [];
  if (Array.isArray(payload.phones)) {
    payload.phones.forEach((p) => {
      if (typeof p === "string" && p.trim()) rawList.push(p.trim());
    });
  }
  if (payload.phone && typeof payload.phone === "string" && payload.phone.trim()) {
    if (!rawList.includes(payload.phone.trim())) {
      rawList.push(payload.phone.trim());
    }
  }

  if (rawList.length === 0) {
    return {
      success: false,
      status: "FAILED",
      message: "No emergency contacts configured. Please save real emergency contacts in your profile/medical ID.",
      sentCount: 0,
      failedCount: 0,
    };
  }

  // Verify Twilio configuration
  if (!accountSid || !authToken || !fromNumber) {
    const missing: string[] = [];
    if (!accountSid) missing.push("TWILIO_ACCOUNT_SID");
    if (!authToken) missing.push("TWILIO_AUTH_TOKEN");
    if (!fromNumber) missing.push("TWILIO_FROM_NUMBER");

    console.warn(`[SMS Service Configuration Error]: Missing Twilio server credentials: ${missing.join(", ")}`);
    return {
      success: false,
      status: "FAILED",
      message: `Emergency SMS service is not configured on the server (missing ${missing.join(", ")}).`,
      sentCount: 0,
      failedCount: rawList.length,
    };
  }

  const textMessage = payload.message || 
    `🚨 GOLDENGUARD SOS ALERT 🚨\nEmergency assistance requested.\nTime: ${payload.timestamp}\nLocation: Latitude: ${payload.latitude}, Longitude: ${payload.longitude}\nMap: https://www.google.com/maps?q=${payload.latitude},${payload.longitude}`;

  const credentials = Buffer.from(`${accountSid}:${authToken}`).toString("base64");
  const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;

  const results: RecipientResult[] = [];

  for (const rawPhone of rawList) {
    const formattedRecipient = formatToE164(rawPhone);

    if (!isValidE164(formattedRecipient)) {
      results.push({
        phone: rawPhone,
        success: false,
        status: "FAILED",
        message: `Invalid phone number format (${rawPhone}). Must be a valid phone number with country code (e.g. +91XXXXXXXXXX).`,
      });
      continue;
    }

    try {
      const response = await fetch(twilioUrl, {
        method: "POST",
        headers: {
          "Authorization": `Basic ${credentials}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          From: fromNumber,
          To: formattedRecipient,
          Body: textMessage,
        }).toString(),
      });

      const data = await response.json();

      if (!response.ok) {
        const errCode = data.code || data.error?.code || response.status;
        const errMessage = data.message || data.error?.message || "Twilio request failed";
        console.error(`[Twilio SMS Error for ${formattedRecipient}]:`, {
          code: errCode,
          message: errMessage,
          status: response.status,
        });

        results.push({
          phone: formattedRecipient,
          success: false,
          status: "FAILED",
          message: `Twilio Error ${errCode}: ${errMessage}`,
          providerResponse: data,
        });
      } else {
        results.push({
          phone: formattedRecipient,
          success: true,
          status: "SENT",
          message: "SMS delivered to Twilio carrier queue.",
          providerResponse: data,
        });
      }
    } catch (sendErr: any) {
      console.error(`[SMS Send Exception for ${formattedRecipient}]:`, sendErr);
      results.push({
        phone: formattedRecipient,
        success: false,
        status: "FAILED",
        message: sendErr?.message || "Network communication error with SMS provider.",
      });
    }
  }

  const successful = results.filter((r) => r.success);
  const failed = results.filter((r) => !r.success);

  if (successful.length === results.length && results.length > 0) {
    return {
      success: true,
      status: "SENT",
      message: `Emergency SMS successfully dispatched to ${successful.length} contact(s).`,
      sentCount: successful.length,
      failedCount: 0,
      recipientResults: results,
    };
  } else if (successful.length > 0) {
    return {
      success: true,
      status: "SENT",
      message: `Emergency SMS dispatched to ${successful.length} contact(s) (${failed.length} failed).`,
      sentCount: successful.length,
      failedCount: failed.length,
      recipientResults: results,
    };
  } else {
    return {
      success: false,
      status: "FAILED",
      message: `Failed to deliver emergency SMS to contacts: ${failed.map((f) => `${f.phone}: ${f.message}`).join("; ")}`,
      sentCount: 0,
      failedCount: failed.length,
      recipientResults: results,
    };
  }
}
