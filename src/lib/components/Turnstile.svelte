<script lang="ts">
	import { PUBLIC_TURNSTILE_SITE_KEY } from '$env/static/public';

	interface Props {
		/** Bound token to submit with your form. */
		token?: string;
		theme?: 'auto' | 'light' | 'dark';
		onVerify?: (token: string) => void;
		onExpire?: () => void;
		onError?: () => void;
	}

	let {
		token = $bindable(''),
		theme = 'auto',
		onVerify,
		onExpire,
		onError
	}: Props = $props();

	const SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

	function loadScript(): Promise<void> {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		if ((window as any).turnstile) return Promise.resolve();
		return new Promise((resolve, reject) => {
			const existing = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT_SRC}"]`);
			if (existing) {
				existing.addEventListener('load', () => resolve());
				existing.addEventListener('error', () => reject(new Error('Turnstile failed to load')));
				return;
			}
			const script = document.createElement('script');
			script.src = SCRIPT_SRC;
			script.async = true;
			script.defer = true;
			script.onload = () => resolve();
			script.onerror = () => reject(new Error('Turnstile failed to load'));
			document.head.appendChild(script);
		});
	}

	/** Attachment: renders the Turnstile widget into the node and cleans it up. */
	function turnstile(node: HTMLDivElement) {
		let widgetId: string | undefined;
		let cancelled = false;

		(async () => {
			if (!PUBLIC_TURNSTILE_SITE_KEY) return;
			await loadScript();
			if (cancelled) return;
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			widgetId = (window as any).turnstile.render(node, {
				sitekey: PUBLIC_TURNSTILE_SITE_KEY,
				theme,
				callback: (t: string) => {
					token = t;
					onVerify?.(t);
				},
				'expired-callback': () => {
					token = '';
					onExpire?.();
				},
				'error-callback': () => {
					token = '';
					onError?.();
				}
			});
		})();

		return () => {
			cancelled = true;
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const ts = (window as any).turnstile;
			if (ts && widgetId) ts.remove(widgetId);
		};
	}
</script>

{#if PUBLIC_TURNSTILE_SITE_KEY}
	<div {@attach turnstile}></div>
{/if}
