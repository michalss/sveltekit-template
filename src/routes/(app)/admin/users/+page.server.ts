import { fail } from '@sveltejs/kit';
import { APIError } from 'better-auth/api';
import { auth } from '$lib/server/auth';
import { requireAdmin } from '$lib/server/authorize';
import type { Actions, PageServerLoad, RequestEvent } from './$types';

/** Counts active (non-banned) admins — used to protect the last-admin invariant. */
async function activeAdminCount(event: RequestEvent): Promise<number> {
	const result = await auth.api.listUsers({
		query: { limit: 1000, filterField: 'role', filterValue: 'admin', filterOperator: 'eq' },
		headers: event.request.headers
	});
	return result.users.filter((u) => !(u as { banned?: boolean }).banned).length;
}

export const load: PageServerLoad = async (event) => {
	requireAdmin(event);

	const result = await auth.api.listUsers({
		query: { limit: 100, sortBy: 'createdAt', sortDirection: 'desc' },
		headers: event.request.headers
	});

	return { users: result.users, total: result.total };
};

export const actions: Actions = {
	setRole: async (event) => {
		const admin = requireAdmin(event);
		const form = await event.request.formData();
		const userId = form.get('userId')?.toString() ?? '';
		const role = form.get('role')?.toString() === 'admin' ? 'admin' : 'user';

		// Don't let an admin demote themselves (lockout protection).
		if (userId === admin.id && role !== 'admin') {
			return fail(400, { message: 'You cannot change your own role.' });
		}

		// Protect the last-admin invariant: never demote the final active admin.
		if (role !== 'admin' && (await activeAdminCount(event)) <= 1) {
			return fail(400, { message: 'There must be at least one admin.' });
		}

		try {
			await auth.api.setRole({ body: { userId, role }, headers: event.request.headers });
		} catch (error) {
			if (error instanceof APIError) return fail(400, { message: error.message });
			return fail(500, { message: 'Failed to update role' });
		}
		return { success: true };
	},

	ban: async (event) => {
		const admin = requireAdmin(event);
		const form = await event.request.formData();
		const userId = form.get('userId')?.toString() ?? '';

		// Don't let an admin ban themselves.
		if (userId === admin.id) {
			return fail(400, { message: 'You cannot ban yourself.' });
		}

		// Don't ban the last active admin into a lockout.
		const target = await auth.api
			.listUsers({
				query: { limit: 1, filterField: 'id', filterValue: userId, filterOperator: 'eq' },
				headers: event.request.headers
			})
			.then((r) => r.users[0] as { role?: string } | undefined);
		if (target?.role === 'admin' && (await activeAdminCount(event)) <= 1) {
			return fail(400, { message: 'You cannot ban the last admin.' });
		}

		try {
			await auth.api.banUser({ body: { userId }, headers: event.request.headers });
		} catch (error) {
			if (error instanceof APIError) return fail(400, { message: error.message });
			return fail(500, { message: 'Failed to ban user' });
		}
		return { success: true };
	},

	unban: async (event) => {
		requireAdmin(event);
		const form = await event.request.formData();
		const userId = form.get('userId')?.toString() ?? '';

		try {
			await auth.api.unbanUser({ body: { userId }, headers: event.request.headers });
		} catch (error) {
			if (error instanceof APIError) return fail(400, { message: error.message });
			return fail(500, { message: 'Failed to unban user' });
		}
		return { success: true };
	}
};
