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
	password: async (event) => {
		const formData = await event.request.formData();
		const email = formData.get('email')?.toString() ?? '';
		const password = formData.get('password')?.toString() ?? '';
		const captcha = await verifyTurnstile(
			formData.get('cf-turnstile-response')?.toString() ?? null,
			event.getClientAddress()
		);
		if (!captcha.success) {
			return fail(400, { message: 'error_captcha', email });
		}

		try {
			await auth.api.signInEmail({ body: { email, password }, headers: event.request.headers });
		} catch (error) {
			if (error instanceof APIError) {
				return fail(400, { message: error.message || 'error_generic', email });
			}
			return fail(500, { message: 'error_generic', email });
		}

		redirect(302, '/dashboard');
	},

	magic: async (event) => {
		const formData = await event.request.formData();
		const email = formData.get('email')?.toString() ?? '';
		const captcha = await verifyTurnstile(
			formData.get('cf-turnstile-response')?.toString() ?? null,
			event.getClientAddress()
		);
		if (!captcha.success) {
			return fail(400, { message: 'error_captcha', email });
		}

		try {
			await auth.api.signInMagicLink({
				body: { email, callbackURL: '/dashboard' },
				headers: event.request.headers
			});
		} catch (error) {
			if (error instanceof APIError) {
				return fail(400, { message: error.message || 'error_generic', email });
			}
			return fail(500, { message: 'error_generic', email });
		}

		return { magicSent: true, email };
	}
};
