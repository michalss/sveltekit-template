<script lang="ts">
	import { ShieldCheck } from '@lucide/svelte';
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();
</script>

<div class="mb-6 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
	<ShieldCheck class="h-4 w-4 text-blue-600 dark:text-blue-400" />
	<span class="font-medium text-gray-900 dark:text-gray-100">Admin</span>
</div>

{@render children()}
