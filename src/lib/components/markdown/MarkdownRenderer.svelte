<script lang="ts">
	import { renderMarkdown } from '$lib/markdown';

	interface Props {
		/** Markdown source to render. */
		source: string;
		class?: string;
	}

	let { source, class: className = '' }: Props = $props();

	// Sanitized HTML, recomputed only when the source changes.
	const html = $derived(renderMarkdown(source));
</script>

<!-- eslint-disable-next-line svelte/no-at-html-tags — content is sanitized in renderMarkdown -->
<div class={['prose prose-gray max-w-none dark:prose-invert', className]}>
	{@html html}
</div>
