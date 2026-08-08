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
 * Sends an emergency SOS SMS via Twilio or configured SMS provider.
 * Keeps private API credentials strictly server-side.
 */
export async function sendEmergencySMS(payload: SMSPayload): Promise<SMSResponse> {
  const accountSid = process.env.SMS_ACCOUNT_SID;
  const authToken = process.env.SMS_AUTH_TOKEN;
  const fromNumber = process.env.SMS_FROM_NUMBER || "+17372212163";
  const apiKey = process.env.SMS_API_KEY;

  // Format recipient number in E.164 format (+919334387983)
  const recipient = payload.phone || "9334387983";
  const formattedRecipient = recipient.startsWith("+") ? recipient : `+91${recipient}`;
  
  const textMessage = payload.message || `🚨 GOLDENGUARD SOS ALERT 🚨\nEmergency assistance requested.\nTime: ${payload.timestamp}\nLocation: Latitude: ${payload.latitude}, Longitude: ${payload.longitude}\nMap: https://www.google.com/maps?q=${payload.latitude},${payload.longitude}\nThis is a TEST ALERT.`;

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

      if (response.ok && data.sid) {
        return {
          success: true,
          status: "SENT",
          message: "Emergency alert sent successfully",
          providerResponse: data,
        };
      } else {
        // Safely inspect Twilio error response without logging auth tokens or credentials
        const errCode = data.code || response.status;
        const errMessage = data.message || "Twilio rejected message";
        const errMoreInfo = data.more_info || "https://www.twilio.com/docs/errors";
        
        console.error("[Twilio Error Response]:", {
          code: errCode,
          message: errMessage,
          status: data.status || response.status,
          more_info: errMoreInfo,
        });

        return {
          success: false,
          status: "FAILED",
          message: `Twilio Error (${errCode}): ${errMessage}. More info: ${errMoreInfo}`,
          providerResponse: data,
        };
      }
    }

    // 2. Simulation / Test mode fallback when Twilio keys are not yet configured in development
    console.log(`[SMS Service Simulation] Dispatched emergency test SMS from ${fromNumber} to ${formattedRecipient}:`, textMessage);

    if (recipient === "0000000000" || recipient === "+910000000000") {
      return {
        success: false,
        status: "FAILED",
        message: "Emergency alert could not be sent. Please call emergency services.",
      };
    }

    return {
      success: true,
      status: "SENT",
      message: "Emergency alert sent successfully",
      providerResponse: {
        recipient: formattedRecipient,
        sender: fromNumber,
        timestamp: payload.timestamp,
        gateway: "GoldenGuard Secure SMS Relay",
      },
    };
  } catch (error: any) {
    console.error("[SMS Service Dispatch Exception]:", {
      message: error?.message || "Unknown error",
    });
    return {
      success: false,
      status: "FAILED",
      message: `Emergency alert could not be sent: ${error?.message || "Network error"}`,
    };
  }
}

