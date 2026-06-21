import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),

	compilerOptions: {
		// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
		runes: ({ filename }) => (filename.split(/[/\\]/).includes('node_modules') ? undefined : true)
	},

	kit: {
		// adapter-node — for self-hosted servers (systemd / pm2).
		// Build output: `build/index.js` (entry for `node build`).
		adapter: adapter({ out: 'build' }),

		// CSRF: OAuth providers (esp. Microsoft via form_post) POST back from their
		// own origin, which SvelteKit would block by default. Better Auth has its own
		// CSRF protection via the OAuth state parameter, so whitelisting is safe.
		csrf: {
			trustedOrigins: [
				'https://accounts.google.com',
				'https://login.microsoftonline.com',
				'https://login.live.com'
			]
		},

		typescript: {
			config: (config) => ({
				...config,
				include: [...config.include, '../drizzle.config.ts']
			})
		}
	}
};

export default config;
