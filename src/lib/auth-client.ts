import { createAuthClient } from 'better-auth/svelte';
import { magicLinkClient } from 'better-auth/client/plugins';

/**
 * Browser-side Better Auth client.
 *
 * Exposes reactive session state plus sign-in/out helpers used by the UI.
 */
export const authClient = createAuthClient({
	plugins: [magicLinkClient()]
});

export const { signIn, signOut, signUp, useSession } = authClient;
