import { env } from '$env/dynamic/private';

/**
 * Validates required environment variables once at startup so the app fails
 * fast with a clear message instead of erroring deep inside a request.
 *
 * Optional integrations (OAuth, AI, Turnstile) are intentionally NOT required —
 * they degrade gracefully when unset. But anything the app cannot run without
 * is checked here.
 *
 * Validation is skipped when SKIP_ENV_VALIDATION is set, which is used by tools
 * that load this module outside the running server (e.g. the Better Auth CLI
 * generating the Drizzle schema).
 */

const REQUIRED = ['DATABASE_URL', 'BETTER_AUTH_SECRET', 'ORIGIN'] as const;

const isProd = env.NODE_ENV === 'production';

function validate() {
	const missing = REQUIRED.filter((key) => !env[key]);
	if (missing.length > 0) {
		throw new Error(
			`Missing required environment variable(s): ${missing.join(', ')}. ` +
				`Copy .env.example to .env and fill them in.`
		);
	}

	// A weak/default secret in production is a real risk — refuse to boot.
	if (isProd) {
		const secret = env.BETTER_AUTH_SECRET ?? '';
		if (secret.length < 32) {
			throw new Error(
				'BETTER_AUTH_SECRET must be at least 32 characters in production. ' +
					'Generate one with: npx @better-auth/cli secret'
			);
		}
		if (!env.ORIGIN?.startsWith('https://')) {
			throw new Error('ORIGIN must be an https:// URL in production.');
		}
	}
}

let validated = false;

/**
 * Runs validation once, synchronously, so a failure aborts the request (and
 * surfaces immediately) rather than becoming a swallowed promise rejection.
 *
 * The caller passes `building` (from `$app/environment`) so this module has no
 * static dependency on SvelteKit internals — that keeps it loadable by the
 * Better Auth CLI, which sets SKIP_ENV_VALIDATION to opt out entirely.
 *
 * @param building true during `vite build` / prerender — validation is skipped.
 */
export function validateEnv(building = false): void {
	if (validated || building || env.SKIP_ENV_VALIDATION) return;
	validated = true;
	validate();
}

export const isProduction = isProd;
