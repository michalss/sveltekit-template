import { requireUser } from '$lib/server/authorize';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = (event) => {
	// requireUser also rejects banned users (treated as unauthenticated),
	// guarding every route in the (app) group consistently.
	const user = requireUser(event);
	return { user };
};
