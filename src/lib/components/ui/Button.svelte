<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';

	interface Props extends HTMLButtonAttributes {
		variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
		size?: 'sm' | 'md' | 'lg';
		loading?: boolean;
		children: Snippet;
	}

	let {
		variant = 'primary',
		size = 'md',
		loading = false,
		disabled,
		class: className = '',
		children,
		...rest
	}: Props = $props();

	const variants: Record<string, string> = {
		primary: 'bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-500',
		secondary:
			'bg-gray-100 text-gray-900 hover:bg-gray-200 focus-visible:ring-gray-400 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700',
		outline:
			'border border-gray-300 bg-white text-gray-900 hover:bg-gray-50 focus-visible:ring-gray-400 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800',
		ghost:
			'bg-transparent text-gray-700 hover:bg-gray-100 focus-visible:ring-gray-400 dark:text-gray-300 dark:hover:bg-gray-800',
		danger: 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500'
	};

	const sizes: Record<string, string> = {
		sm: 'px-3 py-1.5 text-sm',
		md: 'px-4 py-2 text-sm',
		lg: 'px-5 py-2.5 text-base'
	};
</script>

<button
	class={[
		'inline-flex items-center justify-center gap-2 rounded-md font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 dark:ring-offset-gray-900',
		variants[variant],
		sizes[size],
		className
	]}
	disabled={disabled || loading}
	{...rest}
>
	{#if loading}
		<span
			class="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
			aria-hidden="true"
		></span>
	{/if}
	{@render children()}
</button>
