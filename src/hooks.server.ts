import { sequence } from '@sveltejs/kit/hooks';
import { building } from '$app/environment';
import { error, type Handle } from '@sveltejs/kit';
import { auth } from '$lib/server/auth';
import { svelteKitHandler } from 'better-auth/svelte-kit';
import { getTextDirection } from '$lib/paraglide/runtime';
import { paraglideMiddleware } from '$lib/paraglide/server';
import { handleSecurityHeaders } from '$lib/server/security-headers';
import { rateLimit, retryAfterSeconds } from '$lib/server/rate-limit';
import { validateEnv } from '$lib/server/env';

// Validate required env on the first request (skipped during build/prerender).
const handleEnv: Handle = ({ event, resolve }) => {
	validateEnv(building);
	return resolve(event);
};

const handleParaglide: Handle = ({ event, resolve }) =>
	paraglideMiddleware(event.request, ({ request, locale }) => {
		event.request = request;

		return resolve(event, {
			transformPageChunk: ({ html }) =>
				html.replace('%paraglide.lang%', locale).replace('%paraglide.dir%', getTextDirection(locale))
		});
	});

/**
 * Rate-limits the sensitive auth endpoints by client IP. Better Auth also has
 * its own limiter (defense in depth); this guards the surface early and cheaply.
 */
const SENSITIVE_FORMS = ['/login', '/signup', '/forgot-password', '/reset-password'];

const handleRateLimit: Handle = async ({ event, resolve }) => {
	const path = event.url.pathname;
	const isAuthPost = event.request.method === 'POST' && path.startsWith('/api/auth');
	const isFormPost =
		event.request.method === 'POST' && SENSITIVE_FORMS.some((p) => path.endsWith(p));

	if (isAuthPost || isFormPost) {
		const ip = event.getClientAddress();
		const result = rateLimit({ key: `auth:${ip}`, limit: 10, windowMs: 60_000 });
		if (!result.success) {
			throw error(429, `Too many attempts. Try again in ${retryAfterSeconds(result.resetAt)}s.`);
		}
	}

	return resolve(event);
};

const handleBetterAuth: Handle = async ({ event, resolve }) => {
	const session = await auth.api.getSession({ headers: event.request.headers });

	if (session) {
		event.locals.session = session.session;
		event.locals.user = session.user;
	}

	return svelteKitHandler({ event, resolve, auth, building });
};

export const handle: Handle = sequence(
	handleEnv,
	handleSecurityHeaders,
	handleParaglide,
	handleRateLimit,
	handleBetterAuth
);
