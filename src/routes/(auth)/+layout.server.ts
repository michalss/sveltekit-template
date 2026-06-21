import { enabledSocialProviders } from '$lib/server/auth';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = () => {
	// Only the providers configured via env are exposed, so SocialButtons
	// renders only buttons that actually work.
	return { socialProviders: enabledSocialProviders() };
};
