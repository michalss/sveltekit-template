<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';

	interface Props extends HTMLInputAttributes {
		label?: string;
		value?: string;
		error?: string;
	}

	let { label, value = $bindable(''), error, id, class: className = '', ...rest }: Props = $props();

	// Stable id so the label binds to the input even without an explicit id prop.
	const inputId = $derived(id ?? `input-${label?.toLowerCase().replace(/\s+/g, '-') ?? 'field'}`);
</script>

<div class="flex flex-col gap-1.5">
	{#if label}
		<label for={inputId} class="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
	{/if}
	<input
		id={inputId}
		bind:value
		class={[
			'rounded-md border px-3 py-2 text-sm shadow-sm transition focus:outline-none focus:ring-2',
			'bg-white text-gray-900 placeholder:text-gray-400 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500',
			error
				? 'border-red-400 focus:border-red-500 focus:ring-red-500'
				: 'border-gray-300 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-700',
			className
		]}
		aria-invalid={error ? 'true' : undefined}
		{...rest}
	/>
	{#if error}
		<p class="text-xs text-red-600 dark:text-red-400">{error}</p>
	{/if}
</div>
