import type { PageServerLoad } from './$types';

export const load: PageServerLoad = (event) => {
	// `user` is guaranteed by the (app) layout guard.
	return { user: event.locals.user! };
};
