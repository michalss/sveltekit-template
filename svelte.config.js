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

		// Content-Security-Policy. SvelteKit augments script-src/style-src with
		// per-render nonces (dynamic) or hashes (prerendered) for the inline
		// scripts/styles it generates, so we can avoid 'unsafe-inline' for scripts.
		// (style-src keeps 'unsafe-inline' because Svelte transitions inject inline
		// <style> elements that aren't covered by hashing.)
		csp: {
			mode: 'auto',
			directives: {
				'default-src': ['self'],
				'script-src': ['self', 'https://challenges.cloudflare.com'],
				'style-src': ['self', 'unsafe-inline'],
				'img-src': ['self', 'data:', 'https:'],
				'font-src': ['self', 'data:'],
				'frame-src': ['https://challenges.cloudflare.com'],
				'connect-src': ['self', 'https://challenges.cloudflare.com'],
				'object-src': ['none'],
				'base-uri': ['self'],
				'form-action': ['self'],
				'frame-ancestors': ['none']
			}
		},

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
