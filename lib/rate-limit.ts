// Simple in-memory rate limiter for MVP
// In production, consider using Redis or a more robust solution

interface RateLimitEntry {
  requests: number[];
  lastCleanup: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();
const CLEANUP_INTERVAL = 5 * 60 * 1000; // 5 minutes

// Clean up expired entries periodically
function cleanupExpiredEntries() {
  const now = Date.now();
  
  for (const [ip, entry] of rateLimitMap.entries()) {
    // Remove requests older than the window
    const cutoff = now - 60 * 1000; // 1 minute window
    entry.requests = entry.requests.filter(time => time > cutoff);
    
    // Remove entry if no recent requests
    if (entry.requests.length === 0) {
      rateLimitMap.delete(ip);
    }
  }
}

// Check if IP is within rate limit
export function checkRateLimit(
  ip: string, 
  limit: number = 10, 
  windowMs: number = 60000
): boolean {
  const now = Date.now();
  
  // Get or create entry for this IP
  let entry = rateLimitMap.get(ip);
  if (!entry) {
    entry = {
      requests: [],
      lastCleanup: now
    };
    rateLimitMap.set(ip, entry);
  }
  
  // Clean up expired requests for this IP
  const cutoff = now - windowMs;
  entry.requests = entry.requests.filter(time => time > cutoff);
  
  // Check if within limit
  if (entry.requests.length >= limit) {
    return false;
  }
  
  // Add current request
  entry.requests.push(now);
  
  // Periodic cleanup of all entries
  if (now - entry.lastCleanup > CLEANUP_INTERVAL) {
    cleanupExpiredEntries();
    entry.lastCleanup = now;
  }
  
  return true;
}

// Get remaining requests for an IP
export function getRemainingRequests(
  ip: string, 
  limit: number = 10, 
  windowMs: number = 60000
): number {
  const entry = rateLimitMap.get(ip);
  if (!entry) {
    return limit;
  }
  
  const now = Date.now();
  const cutoff = now - windowMs;
  const recentRequests = entry.requests.filter(time => time > cutoff);
  
  return Math.max(0, limit - recentRequests.length);
}

// Get reset time for an IP (when the window resets)
export function getResetTime(
  ip: string, 
  windowMs: number = 60000
): number {
  const entry = rateLimitMap.get(ip);
  if (!entry || entry.requests.length === 0) {
    return Date.now();
  }
  
  const oldestRequest = Math.min(...entry.requests);
  return oldestRequest + windowMs;
}

// Clear rate limit for an IP (useful for testing)
export function clearRateLimit(ip: string): void {
  rateLimitMap.delete(ip);
}

// Clear all rate limits (useful for testing)
export function clearAllRateLimits(): void {
  rateLimitMap.clear();
}

// Get current rate limit stats (useful for monitoring)
export function getRateLimitStats(): {
  totalIPs: number;
  totalRequests: number;
} {
  let totalRequests = 0;
  
  for (const entry of rateLimitMap.values()) {
    totalRequests += entry.requests.length;
  }
  
  return {
    totalIPs: rateLimitMap.size,
    totalRequests
  };
}
