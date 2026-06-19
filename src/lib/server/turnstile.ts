import { env } from '$env/dynamic/private';
import { isProduction } from '$lib/server/env';

const VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

export interface TurnstileResult {
	success: boolean;
	errorCodes?: string[];
}

/**
 * Verifies a Cloudflare Turnstile token server-side.
 *
 * Behaviour when TURNSTILE_SECRET_KEY is unset:
 *  - development: verification is skipped (returns success) for convenience.
 *  - production: fails CLOSED, so captcha can never be silently bypassed in a
 *    real deployment where the key was forgotten.
 */
export async function verifyTurnstile(token: string | null, remoteIp?: string): Promise<TurnstileResult> {
	const secret = env.TURNSTILE_SECRET_KEY;
	if (!secret) {
		if (isProduction) {
			console.error('TURNSTILE_SECRET_KEY is not set in production — rejecting request.');
			return { success: false, errorCodes: ['missing-secret'] };
		}
		return { success: true };
	}

	if (!token) {
		return { success: false, errorCodes: ['missing-input-response'] };
	}

	const body = new FormData();
	body.append('secret', secret);
	body.append('response', token);
	if (remoteIp) body.append('remoteip', remoteIp);

	const res = await fetch(VERIFY_URL, { method: 'POST', body });
	const data = (await res.json()) as { success: boolean; 'error-codes'?: string[] };

	return { success: data.success, errorCodes: data['error-codes'] };
}
