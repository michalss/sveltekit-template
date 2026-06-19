/**
 * Minimal fixed-window rate limiter.
 *
 * In-memory by default — good for a single Node instance and local dev. For
 * multi-instance deployments, swap the `store` for Redis/Upstash (the interface
 * is intentionally tiny so it's a drop-in replacement).
 */

interface Entry {
	count: number;
	resetAt: number;
}

export interface RateLimitResult {
	success: boolean;
	remaining: number;
	resetAt: number;
}

const store = new Map<string, Entry>();

// Opportunistic cleanup so the map doesn't grow unbounded.
function sweep(now: number) {
	if (store.size < 10_000) return;
	for (const [key, entry] of store) {
		if (entry.resetAt <= now) store.delete(key);
	}
}

export interface RateLimitOptions {
	/** Unique bucket key, e.g. `login:${ip}`. */
	key: string;
	/** Max requests allowed per window. */
	limit: number;
	/** Window length in milliseconds. */
	windowMs: number;
}

export function rateLimit({ key, limit, windowMs }: RateLimitOptions): RateLimitResult {
	const now = Date.now();
	sweep(now);

	const entry = store.get(key);
	if (!entry || entry.resetAt <= now) {
		const resetAt = now + windowMs;
		store.set(key, { count: 1, resetAt });
		return { success: true, remaining: limit - 1, resetAt };
	}

	if (entry.count >= limit) {
		return { success: false, remaining: 0, resetAt: entry.resetAt };
	}

	entry.count += 1;
	return { success: true, remaining: limit - entry.count, resetAt: entry.resetAt };
}

/** Helper: builds a Retry-After header value (seconds) from a reset timestamp. */
export function retryAfterSeconds(resetAt: number): number {
	return Math.max(1, Math.ceil((resetAt - Date.now()) / 1000));
}
