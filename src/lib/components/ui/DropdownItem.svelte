<script lang="ts">
	import type { Snippet } from 'svelte';
	import { Check } from '@lucide/svelte';

	interface Props {
		onclick?: () => void;
		selected?: boolean;
		children: Snippet;
	}

	let { onclick, selected = false, children }: Props = $props();
</script>

<button
	type="button"
	role="menuitem"
	class="flex w-full items-center justify-between gap-2 rounded-md px-3 py-2 text-left text-sm text-gray-700 transition hover:bg-gray-100 focus:bg-gray-100 focus:outline-none dark:text-gray-200 dark:hover:bg-gray-800 dark:focus:bg-gray-800"
	{onclick}
>
	<span class="flex items-center gap-2">{@render children()}</span>
	{#if selected}
		<Check class="h-4 w-4 text-blue-600 dark:text-blue-400" />
	{/if}
</button>
