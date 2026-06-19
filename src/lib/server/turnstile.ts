import { env } from '$env/dynamic/private';

const VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

export interface TurnstileResult {
	success: boolean;
	errorCodes?: string[];
}

/**
 * Verifies a Cloudflare Turnstile token server-side.
 *
 * If TURNSTILE_SECRET_KEY is not set, verification is skipped (returns success)
 * so the template works out of the box during local development.
 */
export async function verifyTurnstile(token: string | null, remoteIp?: string): Promise<TurnstileResult> {
	const secret = env.TURNSTILE_SECRET_KEY;
	if (!secret) {
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
