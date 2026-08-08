/**
 * API utility for resolving the backend API host.
 * If the application is hosted on an external custom domain like Vercel,
 * it routes requests to our primary Cloud Run backend.
 */

export const BACKEND_URL = "https://ais-pre-ovmzp75riuv2xh7szzuj77-278316738541.asia-southeast1.run.app";

export function getApiUrl(path: string): string {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;

  if (typeof window === "undefined") {
    return cleanPath;
  }

  const hostname = window.location.hostname;

  // Use relative path if we are running in the standard environments (localhost, Cloud Run dev/pre)
  if (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname.includes("ais-dev-") ||
    hostname.includes("ais-pre-")
  ) {
    return cleanPath;
  }

  // Otherwise route to our primary Cloud Run backend deployment
  return `${BACKEND_URL}${cleanPath}`;
}
