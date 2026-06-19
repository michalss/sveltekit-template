import { fail } from '@sveltejs/kit';
import { APIError } from 'better-auth/api';
import { auth } from '$lib/server/auth';
import { verifyTurnstile } from '$lib/server/turnstile';
import type { Actions } from './$types';

export const actions: Actions = {
	default: async (event) => {
		const form = await event.request.formData();
		const email = form.get('email')?.toString() ?? '';
		const captcha = await verifyTurnstile(
			form.get('cf-turnstile-response')?.toString() ?? null,
			event.getClientAddress()
		);
		if (!captcha.success) {
			return fail(400, { message: 'error_captcha', email });
		}

		try {
			await auth.api.requestPasswordReset({
				body: { email, redirectTo: '/reset-password' },
				headers: event.request.headers
			});
		} catch (error) {
			// Don't reveal whether the email exists — always report success.
			if (!(error instanceof APIError)) {
				return fail(500, { message: 'error_generic', email });
			}
		}

		return { sent: true };
	}
};
