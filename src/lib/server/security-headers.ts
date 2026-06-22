import type { Handle } from '@sveltejs/kit';
import { isProduction } from '$lib/server/env';

/**
 * Applies security response headers.
 *
 * The Content-Security-Policy itself is configured in svelte.config.js via
 * `kit.csp`, so SvelteKit can add per-render nonces/hashes for its inline
 * scripts and we can avoid 'unsafe-inline' in script-src. This handle adds the
 * remaining hardening headers that CSP does not cover.
 */

export const handleSecurityHeaders: Handle = async ({ event, resolve }) => {
	const response = await resolve(event);

	response.headers.set('X-Content-Type-Options', 'nosniff');
	response.headers.set('X-Frame-Options', 'DENY');
	response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
	response.headers.set('X-DNS-Prefetch-Control', 'off');
	response.headers.set(
		'Permissions-Policy',
		'camera=(), microphone=(), geolocation=(), interest-cohort=()'
	);

	// HSTS only over HTTPS in production.
	if (isProduction) {
		response.headers.set(
			'Strict-Transport-Security',
			'max-age=63072000; includeSubDomains; preload'
		);
	}

	return response;
};
