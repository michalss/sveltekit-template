import { env } from '$env/dynamic/private';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { sveltekitCookies } from 'better-auth/svelte-kit';
import { magicLink } from 'better-auth/plugins';
import { getRequestEvent } from '$app/server';
import { db } from '$lib/server/db';
import { sendMagicLinkEmail } from '$lib/server/email';

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

export const auth = betterAuth({
	baseURL: env.ORIGIN,
	secret: env.BETTER_AUTH_SECRET,
	database: drizzleAdapter(db, { provider: 'mysql' }),
	emailAndPassword: { enabled: true },
	socialProviders: socialProviders(),
	plugins: [
		magicLink({
			sendMagicLink: async ({ email, url }) => {
				await sendMagicLinkEmail(email, url);
			}
		}),
		sveltekitCookies(getRequestEvent) // make sure this is the last plugin in the array
	]
});

export type Auth = typeof auth;
