import { fail, redirect } from '@sveltejs/kit';
import { APIError } from 'better-auth/api';
import { auth } from '$lib/server/auth';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = (event) => {
	// Better Auth sends the token as a query param on the reset link.
	const token = event.url.searchParams.get('token') ?? '';
	return { token };
};

export const actions: Actions = {
	default: async (event) => {
		const form = await event.request.formData();
		const token = form.get('token')?.toString() ?? '';
		const password = form.get('password')?.toString() ?? '';
		const confirm = form.get('confirm')?.toString() ?? '';

		if (!token) return fail(400, { message: 'error_reset_token' });
		if (password.length < 8) return fail(400, { message: 'error_password_short' });
		if (password !== confirm) return fail(400, { message: 'error_password_match' });

		try {
			await auth.api.resetPassword({ body: { token, newPassword: password } });
		} catch (error) {
			if (error instanceof APIError) return fail(400, { message: error.message });
			return fail(500, { message: 'error_generic' });
		}

		redirect(302, '/login');
	}
};
