import { env } from '$env/dynamic/private';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { sveltekitCookies } from 'better-auth/svelte-kit';
import { magicLink, admin } from 'better-auth/plugins';
import { getRequestEvent } from '$app/server';
import { db } from '$lib/server/db';
import {
	sendMagicLinkEmail,
	sendVerificationEmail,
	sendPasswordResetEmail
} from '$lib/server/email';
import { isProduction } from '$lib/server/env';

/** Origins allowed to start auth flows / receive cookies. */
function trustedOrigins(): string[] {
	const origins = new Set<string>();
	if (env.ORIGIN) origins.add(env.ORIGIN);
	for (const extra of (env.TRUSTED_ORIGINS ?? '').split(',')) {
		const trimmed = extra.trim();
		if (trimmed) origins.add(trimmed);
	}
	return [...origins];
}

/**
 * Better Auth instance.
 *
 * Providers configured:
 *  - Email + password
 *  - Magic link (passwordless, via email)
 *  - Google OAuth
 *  - Microsoft (Entra ID) OAuth
 *
 * Social providers are only registered when their client id/secret are present
 * in the environment, so the template runs out of the box without them.
 */
function socialProviders() {
	const providers: Record<string, unknown> = {};

	if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) {
		providers.google = {
			clientId: env.GOOGLE_CLIENT_ID,
			clientSecret: env.GOOGLE_CLIENT_SECRET
		};
	}

	if (env.MICROSOFT_CLIENT_ID && env.MICROSOFT_CLIENT_SECRET) {
		providers.microsoft = {
			clientId: env.MICROSOFT_CLIENT_ID,
			clientSecret: env.MICROSOFT_CLIENT_SECRET,
			// "common" allows both work/school and personal Microsoft accounts.
			tenantId: env.MICROSOFT_TENANT_ID || 'common'
		};
	}

	return providers;
}

/**
 * Which social providers are actually configured (client id/secret present).
 * Exposed to the client so the UI only renders buttons that will work.
 */
export function enabledSocialProviders() {
	const keys = Object.keys(socialProviders()) as Array<'google' | 'microsoft'>;
	return {
		google: keys.includes('google'),
		microsoft: keys.includes('microsoft')
	};
}

export const auth = betterAuth({
	baseURL: env.ORIGIN,
	secret: env.BETTER_AUTH_SECRET,
	database: drizzleAdapter(db, { provider: 'mysql' }),
	trustedOrigins: trustedOrigins(),
	emailAndPassword: {
		enabled: true,
		// Enforce a reasonable password policy server-side.
		minPasswordLength: 8,
		maxPasswordLength: 128,
		// Require verification only in production (frictionless local dev).
		requireEmailVerification: isProduction,
		sendResetPassword: async ({ user, url }) => {
			await sendPasswordResetEmail(user.email, url);
		}
	},
	emailVerification: {
		sendOnSignUp: true,
		autoSignInAfterVerification: true,
		sendVerificationEmail: async ({ user, url }) => {
			await sendVerificationEmail(user.email, url);
		}
	},
	socialProviders: socialProviders(),
	// Harden session cookies. Secure + httpOnly + sameSite=lax by default.
	advanced: {
		useSecureCookies: isProduction,
		defaultCookieAttributes: {
			httpOnly: true,
			sameSite: 'lax',
			secure: isProduction
		}
	},
	session: {
		expiresIn: 60 * 60 * 24 * 7, // 7 days
		updateAge: 60 * 60 * 24, // refresh once per day
		cookieCache: { enabled: true, maxAge: 5 * 60 }
	},
	rateLimit: {
		// Better Auth's own per-endpoint limiter (defense in depth alongside ours).
		enabled: true,
		window: 60,
		max: 100
	},
	plugins: [
		admin({
			// User ids listed here always have admin access (comma-separated env).
			adminUserIds: (env.ADMIN_USER_IDS ?? '')
				.split(',')
				.map((id) => id.trim())
				.filter(Boolean),
			defaultRole: 'user',
			adminRoles: ['admin']
		}),
		magicLink({
			sendMagicLink: async ({ email, url }) => {
				await sendMagicLinkEmail(email, url);
			}
		}),
		sveltekitCookies(getRequestEvent) // make sure this is the last plugin in the array
	]
});

export type Auth = typeof auth;
