<script lang="ts">
	import type { Snippet } from 'svelte';
	import { CircleAlert, CircleCheck, Info, TriangleAlert } from '@lucide/svelte';

	interface Props {
		variant?: 'info' | 'success' | 'warning' | 'error';
		children: Snippet;
	}

	let { variant = 'info', children }: Props = $props();

	const styles: Record<string, string> = {
		info: 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950/40 dark:text-blue-200 dark:border-blue-900',
		success:
			'bg-green-50 text-green-800 border-green-200 dark:bg-green-950/40 dark:text-green-200 dark:border-green-900',
		warning:
			'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-200 dark:border-amber-900',
		error: 'bg-red-50 text-red-800 border-red-200 dark:bg-red-950/40 dark:text-red-200 dark:border-red-900'
	};

	const icons = {
		info: Info,
		success: CircleCheck,
		warning: TriangleAlert,
		error: CircleAlert
	};

	const Icon = $derived(icons[variant]);
</script>

<div class={['flex items-start gap-3 rounded-lg border px-4 py-3 text-sm', styles[variant]]} role="alert">
	<Icon class="mt-0.5 h-4 w-4 shrink-0" />
	<div>{@render children()}</div>
</div>
