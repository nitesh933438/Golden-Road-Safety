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

// ============================================================================
// RATE-LIMIT & EXPONENTIAL BACKOFF FETCH UTILITY
// ============================================================================

interface MemoryCacheEntry {
  data: any;
  timestamp: number;
}

const apiResponseCache = new Map<string, MemoryCacheEntry>();

export interface FetchRetryOptions extends RequestInit {
  maxRetries?: number;
  initialDelayMs?: number;
  cacheTtlMs?: number; // In-memory cache TTL in milliseconds
}

/**
 * Custom Error class for Rate Limits (HTTP 429) so callers can recognize it without crashing.
 */
export class RateLimitError extends Error {
  public status: number;
  constructor(message = "Rate limit exceeded. Please wait a moment before trying again.") {
    super(message);
    this.name = "RateLimitError";
    this.status = 429;
  }
}

/**
 * Resilient fetch wrapper with exponential backoff and rate limit (429) protection.
 * - Does NOT continuously retry 429 Rate Limit errors.
 * - Caches responses in memory if cacheTtlMs is provided.
 * - Uses exponential backoff with jitter for transient errors.
 */
export async function fetchWithRetry(
  url: string,
  options: FetchRetryOptions = {}
): Promise<Response> {
  const {
    maxRetries = 2,
    initialDelayMs = 400,
    cacheTtlMs = 0,
    ...fetchInit
  } = options;

  // Check cache first if requested
  if (cacheTtlMs > 0 && fetchInit.method?.toUpperCase() !== "POST") {
    const cached = apiResponseCache.get(url);
    if (cached && Date.now() - cached.timestamp < cacheTtlMs) {
      return new Response(JSON.stringify(cached.data), {
        status: 200,
        headers: { "Content-Type": "application/json", "X-Cache": "HIT" }
      });
    }
  }

  let attempt = 0;

  while (true) {
    try {
      const response = await fetch(url, fetchInit);

      // Handle HTTP 429 Rate Limit directly without retrying endlessly
      if (response.status === 429) {
        console.warn(`[Rate Limit Notice] 429 Rate Limit Exceeded for ${url}. Aborting retries.`);
        throw new RateLimitError(`Rate limit exceeded for request (${url}). Please try again later.`);
      }

      // If response is successful and caching enabled, store JSON
      if (response.ok && cacheTtlMs > 0 && fetchInit.method?.toUpperCase() !== "POST") {
        try {
          const cloned = response.clone();
          const json = await cloned.json();
          apiResponseCache.set(url, { data: json, timestamp: Date.now() });
        } catch {
          // Non-JSON response, ignore caching
        }
      }

      // If server error (500, 502, 503, 504) and we have retries left
      if (response.status >= 500 && attempt < maxRetries) {
        attempt++;
        const backoff = initialDelayMs * Math.pow(2, attempt) + Math.random() * 100;
        await new Promise((r) => setTimeout(r, backoff));
        continue;
      }

      return response;
    } catch (err: any) {
      if (err instanceof RateLimitError || err.name === "AbortError") {
        throw err;
      }

      if (attempt >= maxRetries) {
        throw err;
      }

      attempt++;
      const backoff = initialDelayMs * Math.pow(2, attempt) + Math.random() * 100;
      await new Promise((r) => setTimeout(r, backoff));
    }
  }
}

