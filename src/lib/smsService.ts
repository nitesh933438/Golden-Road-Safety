// SMS Service Abstraction Layer for Backend Emergency Dispatch
// Supports Twilio REST API integration using server environment variables:
// SMS_ACCOUNT_SID, SMS_AUTH_TOKEN, SMS_FROM_NUMBER.

export interface SMSPayload {
  phone: string;
  latitude: string | number;
  longitude: string | number;
  timestamp: string;
  message: string;
}

export interface SMSResponse {
  success: boolean;
  status: "SENT" | "FAILED" | "PENDING";
  message: string;
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
 * Sends an emergency SOS SMS via Twilio or configured SMS provider.
 * Keeps private API credentials strictly server-side.
 */
export async function sendEmergencySMS(payload: SMSPayload): Promise<SMSResponse> {
  const accountSid = process.env.SMS_ACCOUNT_SID;
  const authToken = process.env.SMS_AUTH_TOKEN;
  const fromNumber = process.env.SMS_FROM_NUMBER || "+17372212163";

  const rawPhone = payload.phone || "";
  const formattedRecipient = formatToE164(rawPhone);

  if (!isValidE164(formattedRecipient)) {
    return {
      success: false,
      status: "FAILED",
      message: `Emergency alert could not be delivered: Invalid phone number format (${rawPhone}). Must be in valid E.164 format (e.g., +91XXXXXXXXXX).`,
    };
  }
  
  const textMessage = payload.message || `🚨 GOLDENGUARD SOS ALERT 🚨\nEmergency assistance requested.\nTime: ${payload.timestamp}\nLocation: Latitude: ${payload.latitude}, Longitude: ${payload.longitude}\nMap: https://www.google.com/maps?q=${payload.latitude},${payload.longitude}`;

  try {
    // 1. Real Twilio Integration via REST API if credentials are provided
    if (accountSid && authToken && fromNumber) {
      const credentials = Buffer.from(`${accountSid}:${authToken}`).toString("base64");
      const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
      
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
        const errMoreInfo = data.more_info || data.error?.more_info || "https://www.twilio.com/docs/errors";
        
        console.error("[Twilio SMS Dispatch Error]:", {
          code: errCode,
          message: errMessage,
          status: response.status,
          more_info: errMoreInfo,
        });

        return {
          success: false,
          status: "FAILED",
          message: `Emergency alert could not be delivered. Twilio Error ${errCode}: ${errMessage}`,
          providerResponse: data,
        };
      }

      return {
        success: true,
        status: "SENT",
        message: "Emergency alert dispatched successfully via Twilio",
        providerResponse: data,
      };
    }

    // 2. Real SMS provider is NOT configured - never simulate SMS success
    return {
      success: false,
      status: "FAILED",
      message: "SMS service is not configured (missing Twilio credentials).",
    };
  } catch (error: any) {
    console.error("[SMS Service Dispatch Exception]:", {
      message: error?.message || "Unknown error",
    });
    return {
      success: false,
      status: "FAILED",
      message: `Emergency alert could not be delivered: ${error?.message || "Network error"}`,
    };
  }
}
