/**
 * Auth utility functions for GoldenGuard.
 */

export function getFriendlyAuthErrorMessage(error: any): string {
  if (!error) return "An unexpected authentication error occurred.";
  
  const code = error.code;
  const message = error.message || "";
  const currentHost = typeof window !== "undefined" ? window.location.hostname : "your domain";
  
  switch (code) {
    case "auth/popup-closed-by-user":
    case "auth/cancelled-popup-request":
      return "The login popup was closed before completing sign-in. If you are viewing in an embedded iframe, open in a new tab or use Email/Password.";
    
    case "auth/popup-blocked":
      return "The login popup was blocked by your browser. Please allow popups or use Email & Password sign-in.";
    
    case "auth/unauthorized-domain":
    case "auth/unauthorized-client":
      return `Domain '${currentHost}' is not authorized in Firebase Console. To enable Google Login for live deployments, add '${currentHost}' under Firebase Console > Authentication > Settings > Authorized Domains. Alternatively, use Email/Password or Quick Samaritan Sign-In below.`;
    
    case "auth/network-request-failed":
      return "A network error occurred. Please check your connection and try again.";
    
    case "auth/account-exists-with-different-credential":
      return "An account already exists with this email address under another provider. Please sign in with Email & Password.";
    
    case "auth/operation-not-allowed":
      return "Google Sign-In is not enabled in Firebase Console. Enable 'Google' under Authentication > Sign-in method.";
      
    case "auth/configuration-not-found":
    case "auth/internal-error":
      if (message.toLowerCase().includes("configuration") || message.toLowerCase().includes("config")) {
        return "Firebase authentication configuration error. Please verify your Firebase project settings.";
      }
      return "An internal Firebase error occurred. Please try Email/Password sign in.";
      
    default:
      const lowerMessage = message.toLowerCase();
      if (lowerMessage.includes("unauthorized-domain") || lowerMessage.includes("domain not authorized") || lowerMessage.includes("unauthorized domain")) {
        return `Domain '${currentHost}' is not authorized in Firebase Console. Add '${currentHost}' to Firebase Console > Authentication > Settings > Authorized Domains, or sign in using Email/Password below.`;
      }
      if (lowerMessage.includes("popup-closed-by-user") || lowerMessage.includes("popup closed")) {
        return "The login popup was closed. Please open the app in a new tab or use Email/Password.";
      }
      if (lowerMessage.includes("popup-blocked") || lowerMessage.includes("popup blocked")) {
        return "The login popup was blocked by your browser. Please allow popups or use Email/Password.";
      }
      if (lowerMessage.includes("network")) {
        return "A network error occurred. Please check your internet connection.";
      }
      
      return error.message || "Sign-In failed. Please try again or use Email/Password.";
  }
}
