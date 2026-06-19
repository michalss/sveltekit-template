import type { Handle } from '@sveltejs/kit';
import { isProduction } from '$lib/server/env';

/**
 * Applies security response headers, including a Content-Security-Policy tuned
 * for this template (allows Cloudflare Turnstile, blocks everything else).
 *
 * Note: SvelteKit can also manage CSP via svelte.config.js with per-render
 * nonces/hashes. This header-based approach is simpler and covers all responses
 * (including API routes); tighten `script-src` further if you remove Turnstile.
 */

const TURNSTILE = 'https://challenges.cloudflare.com';

const csp = [
	`default-src 'self'`,
	// 'unsafe-inline' is needed for the anti-FOUC theme script and Svelte styles.
	`script-src 'self' 'unsafe-inline' ${TURNSTILE}`,
	`style-src 'self' 'unsafe-inline'`,
	`img-src 'self' data: https:`,
	`font-src 'self' data:`,
	`frame-src ${TURNSTILE}`,
	`connect-src 'self' ${TURNSTILE}`,
	`object-src 'none'`,
	`base-uri 'self'`,
	`form-action 'self'`,
	`frame-ancestors 'none'`,
	...(isProduction ? ['upgrade-insecure-requests'] : [])
].join('; ');

export const handleSecurityHeaders: Handle = async ({ event, resolve }) => {
	const response = await resolve(event);

	response.headers.set('Content-Security-Policy', csp);
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
