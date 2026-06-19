import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = (event) => {
	// Exposes the current user to every page (undefined when signed out).
	return { user: event.locals.user };
};
