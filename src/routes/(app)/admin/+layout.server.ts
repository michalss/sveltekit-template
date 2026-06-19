import { requireAdmin } from '$lib/server/authorize';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = (event) => {
	const user = requireAdmin(event);
	return { user };
};
