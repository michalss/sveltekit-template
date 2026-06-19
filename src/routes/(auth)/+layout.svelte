<script lang="ts">
	import { Card } from '$lib/components/ui';
	import ThemeToggle from '$lib/components/ThemeToggle.svelte';
	import LangSwitch from '$lib/components/LangSwitch.svelte';
	import * as m from '$lib/paraglide/messages';
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();
</script>

<div class="relative flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 dark:bg-gray-950">
	<div class="absolute right-4 top-4 flex items-center gap-1">
		<ThemeToggle />
		<LangSwitch />
	</div>
	<div class="w-full max-w-md">
		<a
			href="/"
			class="mb-6 block text-center text-lg font-semibold text-gray-900 dark:text-gray-100"
		>
			{m.app_name()}
		</a>
		<Card>
			{@render children()}
		</Card>
	</div>
</div>
