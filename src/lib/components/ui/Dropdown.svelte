<script lang="ts">
	import type { Snippet } from 'svelte';
	import { ChevronDown } from '@lucide/svelte';

	interface Props {
		/** Content of the trigger button. */
		trigger: Snippet;
		/** Menu content; receives a `close` callback. */
		children: Snippet<[() => void]>;
		label?: string;
		align?: 'left' | 'right';
		showChevron?: boolean;
		class?: string;
	}

	let {
		trigger,
		children,
		label,
		align = 'right',
		showChevron = true,
		class: className = ''
	}: Props = $props();

	let open = $state(false);
	let root = $state<HTMLDivElement>();

	function close() {
		open = false;
	}

	function onPointerDown(event: PointerEvent) {
		if (open && root && !root.contains(event.target as Node)) close();
	}

	function onKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape' && open) {
			close();
			(root?.querySelector('button') as HTMLButtonElement | null)?.focus();
		}
	}
</script>

<svelte:window onpointerdown={onPointerDown} onkeydown={onKeydown} />

<div bind:this={root} class={['relative', className]}>
	<button
		type="button"
		class="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm text-gray-600 transition hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-gray-300 dark:hover:bg-gray-800"
		aria-haspopup="menu"
		aria-expanded={open}
		aria-label={label}
		onclick={() => (open = !open)}
	>
		{@render trigger()}
		{#if showChevron}
			<ChevronDown class={['h-4 w-4 transition-transform', open && 'rotate-180']} />
		{/if}
	</button>

	{#if open}
		<div
			role="menu"
			class={[
				'absolute z-50 mt-1 min-w-[10rem] overflow-hidden rounded-lg border border-gray-200 bg-white p-1 shadow-lg dark:border-gray-700 dark:bg-gray-900',
				align === 'right' ? 'right-0' : 'left-0'
			]}
		>
			{@render children(close)}
		</div>
	{/if}
</div>
