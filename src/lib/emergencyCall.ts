// Emergency Call, SMS & Contact Utilities

export const EMERGENCY_DISPATCH_NUMBER = "9334387983";
export const EMERGENCY_DISPATCH_LABEL = "Test Emergency Contact";

/**
 * Detects whether the current device is a mobile browser / phone device
 */
export function isMobileDevice(): boolean {
  if (typeof window === "undefined" || typeof navigator === "undefined") return false;
  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera || "";
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent) || window.innerWidth < 768;
}

/**
 * Generates the standardized SOS alert message string
 */
export function generateSOSMessage(options: {
  userName?: string;
  coords?: { lat: number; lng: number } | null;
  time?: string;
}): string {
  const contactName = options.userName || "GoldenGuard User";
  const currentTime = options.time || new Date().toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  if (options.coords) {
    const lat = options.coords.lat.toFixed(6);
    const lng = options.coords.lng.toFixed(6);
    return `🚨 GOLDENGUARD SOS ALERT 🚨

Emergency assistance has been requested.

Contact: ${contactName}
Status: EMERGENCY ACTIVATED

Location:
${lat}, ${lng}

OpenStreetMap / Maps:
https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=16/${lat}/${lng}

Time:
${currentTime}

`;
  }

  return `🚨 GOLDENGUARD SOS ALERT 🚨

Emergency assistance has been requested.

Contact: ${contactName}
Status: EMERGENCY ACTIVATED

Location:
Location unavailable

Time:
${currentTime}

`;
}

/**
 * Triggers native device SMS app prefilled with recipient and encoded message body
 */
export function triggerEmergencySMS(phoneNumber: string = EMERGENCY_DISPATCH_NUMBER, messageBody: string): void {
  if (typeof window === "undefined") return;

  const formattedNumber = phoneNumber.replace(/[^\d+]/g, "");
  const encodedBody = encodeURIComponent(messageBody);

  // iOS uses & or ? depending on device, standard cross-platform format:
  const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
  const delimiter = isIOS ? "&" : "?";
  const smsUrl = `sms:${formattedNumber}${delimiter}body=${encodedBody}`;

  try {
    const link = document.createElement("a");
    link.href = smsUrl;
    link.rel = "noopener noreferrer";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (e) {
    console.warn("Direct SMS link click failed, falling back to window.location.href:", e);
    window.location.href = smsUrl;
  }
}

/**
 * Triggers the device's native phone dialer with the target phone number.
 */
export function triggerEmergencyCall(phoneNumber: string = EMERGENCY_DISPATCH_NUMBER): void {
  if (typeof window === "undefined") return;
  
  const formattedNumber = phoneNumber.replace(/[^\d+]/g, "");
  const telUrl = `tel:${formattedNumber}`;
  
  try {
    const link = document.createElement("a");
    link.href = telUrl;
    link.rel = "noopener noreferrer";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (e) {
    console.warn("Direct link click failed, falling back to window.location.href:", e);
    window.location.href = telUrl;
  }
}

/**
 * Copies arbitrary text to clipboard
 */
export async function copyTextToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      return true;
    }
  } catch (err) {
    console.error("Failed to copy text:", err);
    return false;
  }
}

/**
 * Alias for copying emergency phone number
 */
export async function copyEmergencyNumber(phoneNumber: string = EMERGENCY_DISPATCH_NUMBER): Promise<boolean> {
  return copyTextToClipboard(phoneNumber);
}

