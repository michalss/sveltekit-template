<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import type { Snippet } from 'svelte';
	import type { LayoutData } from './$types';

	let { data, children }: { data: LayoutData; children: Snippet } = $props();
</script>

<div class="min-h-screen bg-gray-50 dark:bg-gray-950">
	<Header user={data.user} />
	<main class="mx-auto max-w-5xl px-4 py-10">
		{@render children()}
	</main>
</div>
