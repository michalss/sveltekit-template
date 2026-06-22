import { fail, redirect } from '@sveltejs/kit';
import { APIError } from 'better-auth/api';
import { auth } from '$lib/server/auth';
import { verifyTurnstile } from '$lib/server/turnstile';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = (event) => {
	if (event.locals.user) {
		redirect(302, '/dashboard');
	}
	return {};
};

export const actions: Actions = {
	default: async (event) => {
		const formData = await event.request.formData();
		const name = formData.get('name')?.toString() ?? '';
		const email = formData.get('email')?.toString() ?? '';
		const password = formData.get('password')?.toString() ?? '';
		const captcha = await verifyTurnstile(
			formData.get('cf-turnstile-response')?.toString() ?? null,
			event.getClientAddress()
		);
		if (!captcha.success) {
			return fail(400, { message: 'error_captcha', name, email });
		}

		try {
			await auth.api.signUpEmail({
				body: { name, email, password },
				headers: event.request.headers
			});
		} catch (error) {
			// Return a generic message regardless of the cause (e.g. duplicate
			// email) so signup cannot be used to enumerate registered accounts.
			if (error instanceof APIError) {
				return fail(400, { message: 'error_generic', name, email });
			}
			return fail(500, { message: 'error_generic', name, email });
		}

		redirect(302, '/dashboard');
	}
};
