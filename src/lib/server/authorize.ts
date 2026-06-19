import { error, redirect } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';

/**
 * Authorization helpers used by load functions and endpoints.
 *
 * `locals.user` is populated by the Better Auth handle in hooks.server.ts. The
 * admin plugin adds a `role` field to the user.
 */

type MaybeUser = (App.Locals['user'] & { role?: string | null; banned?: boolean | null }) | undefined;

export function isAdmin(user: MaybeUser): boolean {
	return user?.role === 'admin' && !user?.banned;
}

export function isBanned(user: MaybeUser): boolean {
	return !!user?.banned;
}

/**
 * Require a signed-in, non-banned user; redirect to /login otherwise.
 * Returns the user. Banned users are treated as unauthenticated.
 */
export function requireUser(event: RequestEvent): NonNullable<App.Locals['user']> {
	const user = event.locals.user as MaybeUser;
	if (!user || isBanned(user)) {
		redirect(302, `/login?redirectTo=${encodeURIComponent(event.url.pathname)}`);
	}
	return event.locals.user as NonNullable<App.Locals['user']>;
}

/** Require an admin; redirect to /login if anonymous, 403 if a non-admin. */
export function requireAdmin(event: RequestEvent) {
	const user = requireUser(event);
	if (!isAdmin(user as MaybeUser)) {
		error(403, 'Forbidden');
	}
	return user;
}
