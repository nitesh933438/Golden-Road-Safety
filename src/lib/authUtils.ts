/**
 * Auth utility functions for GoldenGuard.
 */

export function getFriendlyAuthErrorMessage(error: any): string {
  if (!error) return "An unexpected authentication error occurred.";
  
  const code = error.code;
  const message = error.message || "";
  
  switch (code) {
    case "auth/popup-closed-by-user":
      return "The login popup was closed before completing the sign-in. If you are using the embedded preview, please open the application in a new browser tab to complete Google Sign-In, or use Email & Password.";
    
    case "auth/popup-blocked":
      return "The login popup was blocked by your browser. Please check your browser's pop-up blocker settings and try again, or use Email & Password.";
    
    case "auth/unauthorized-domain":
    case "auth/unauthorized-client":
      return "Domain not authorized. This domain is not listed in the Firebase Console's authorized domains for Google Sign-In. Please log in using Email & Password.";
    
    case "auth/network-request-failed":
      return "A network error occurred. Please check your internet connection and try again.";
    
    case "auth/account-exists-with-different-credential":
      return "An account already exists with this email address but using a different login method. Please sign in using your original Email & Password.";
    
    case "auth/operation-not-allowed":
      return "Google Sign-In is not enabled in the Firebase Console. Please verify with the administrator.";
      
    case "auth/configuration-not-found":
    case "auth/internal-error":
      if (message.toLowerCase().includes("configuration") || message.toLowerCase().includes("config")) {
        return "Firebase authentication configuration error. Please verify your Firebase project setup and API keys.";
      }
      return "An internal Firebase error occurred. Please contact the administrator.";
      
    default:
      // Fallback searches in message
      const lowerMessage = message.toLowerCase();
      if (lowerMessage.includes("unauthorized-domain") || lowerMessage.includes("domain not authorized") || lowerMessage.includes("unauthorized domain")) {
        return "Domain not authorized. This domain is not listed in the Firebase Console's authorized domains for Google Sign-In. Please log in using Email & Password.";
      }
      if (lowerMessage.includes("popup-closed-by-user") || lowerMessage.includes("popup closed")) {
        return "The login popup was closed before completing the sign-in. If you are using the embedded preview, please open the application in a new browser tab to complete Google Sign-In, or use Email & Password.";
      }
      if (lowerMessage.includes("popup-blocked") || lowerMessage.includes("popup blocked")) {
        return "The login popup was blocked by your browser. Please check your browser's pop-up blocker settings and try again, or use Email & Password.";
      }
      if (lowerMessage.includes("network")) {
        return "A network error occurred. Please check your internet connection and try again.";
      }
      
      return error.message || "Google Sign-In failed. Please try again or use Email/Password.";
  }
}
