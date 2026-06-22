<script lang="ts">
	import { renderMarkdown, decodeBase64 } from '$lib/markdown';
	import { highlightCode } from '$lib/highlighter';
	import { renderMermaid } from '$lib/mermaid';
	import { theme } from '$lib/theme.svelte';

	interface Props {
		/** Markdown source to render. */
		source: string;
		class?: string;
	}

	let { source, class: className = '' }: Props = $props();

	// Sanitized HTML, recomputed only when the source changes.
	const html = $derived(renderMarkdown(source));

	let counter = 0;

	/**
	 * Post-processes rendered markdown: syntax-highlight code blocks (Shiki) and
	 * render mermaid diagrams. Re-runs when html or the theme changes.
	 */
	function enhance(node: HTMLElement) {
		$effect(() => {
			// Track dependencies so the effect re-runs on change.
			void html;
			const dark = theme.resolved === 'dark';
			let cancelled = false;

			(async () => {
				// 1. Syntax highlighting.
				for (const pre of Array.from(node.querySelectorAll<HTMLElement>('pre[data-code]'))) {
					const lang = pre.dataset.lang || 'text';
					const code = decodeBase64(pre.dataset.code ?? '');
					try {
						const highlighted = await highlightCode(code, lang);
						if (cancelled) return;
						pre.outerHTML = wrapCodeBlock(highlighted, lang, code);
					} catch {
						/* leave the plain <pre> fallback */
					}
				}

				// 2. Mermaid diagrams.
				for (const block of Array.from(node.querySelectorAll<HTMLElement>('[data-mermaid]'))) {
					const def = decodeBase64(block.dataset.mermaid ?? '');
					try {
						const svg = await renderMermaid(`mermaid-${counter++}`, def, dark);
						if (cancelled) return;
						block.innerHTML = svg;
					} catch (e) {
						block.innerHTML = `<pre class="text-red-600 text-sm">Mermaid error: ${
							e instanceof Error ? e.message : 'invalid diagram'
						}</pre>`;
					}
				}
			})();

			return () => {
				cancelled = true;
			};
		});
	}

	function wrapCodeBlock(highlighted: string, lang: string, raw: string): string {
		const encoded = encodeURIComponent(raw);
		// `lang` comes from pre.dataset.lang (the markdown fence info string) and is
		// interpolated into outerHTML below — restrict it to a safe charset so it
		// can never break out into live markup (XSS), even client-side.
		const safeLang = lang.replace(/[^a-zA-Z0-9+#._-]/g, '').slice(0, 30) || 'text';
		return `<div class="code-block group relative" data-raw="${encoded}">
			<button type="button" class="code-copy" aria-label="Copy code">Copy</button>
			<span class="code-lang">${safeLang}</span>
			${highlighted}
		</div>`;
	}

	// Delegated copy handler for the generated copy buttons.
	function onClick(event: MouseEvent) {
		const btn = (event.target as HTMLElement).closest('.code-copy');
		if (!btn) return;
		const wrapper = btn.closest<HTMLElement>('.code-block');
		const raw = wrapper?.dataset.raw ? decodeURIComponent(wrapper.dataset.raw) : '';
		navigator.clipboard.writeText(raw).then(() => {
			btn.textContent = 'Copied';
			setTimeout(() => (btn.textContent = 'Copy'), 1500);
		});
	}
</script>

<!-- eslint-disable-next-line svelte/no-at-html-tags — content is sanitized in renderMarkdown -->
<div
	class={['prose prose-gray max-w-none dark:prose-invert', className]}
	{@attach enhance}
	onclick={onClick}
	role="presentation"
>
	{@html html}
</div>

<style>
	/* Shiki dual-theme: switch CSS vars based on the document theme. */
	:global(.prose pre.shiki),
	:global(.prose pre.shiki span) {
		color: var(--shiki-light);
		background-color: var(--shiki-light-bg);
	}
	:global(html.dark .prose pre.shiki),
	:global(html.dark .prose pre.shiki span) {
		color: var(--shiki-dark);
		background-color: var(--shiki-dark-bg);
	}

	:global(.prose .code-block) {
		position: relative;
	}
	:global(.prose .code-block .code-lang) {
		position: absolute;
		top: 0.5rem;
		right: 3.5rem;
		font-size: 0.7rem;
		text-transform: uppercase;
		opacity: 0.5;
	}
	:global(.prose .code-block .code-copy) {
		position: absolute;
		top: 0.4rem;
		right: 0.5rem;
		font-size: 0.7rem;
		padding: 0.15rem 0.5rem;
		border-radius: 0.375rem;
		background: rgba(127, 127, 127, 0.2);
		opacity: 0;
		transition: opacity 0.15s;
	}
	:global(.prose .code-block:hover .code-copy) {
		opacity: 1;
	}
	:global(.prose .mermaid-block) {
		display: flex;
		justify-content: center;
	}
	:global(.prose .mermaid-block svg) {
		max-width: 100%;
		height: auto;
	}
</style>
