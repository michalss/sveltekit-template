<script lang="ts">
	import { Eye, Pencil, Columns2 } from '@lucide/svelte';
	import MarkdownToolbar, { type MarkdownAction } from './MarkdownToolbar.svelte';
	import MarkdownRenderer from './MarkdownRenderer.svelte';

	type ViewMode = 'write' | 'preview' | 'split';

	interface Props {
		/** Bindable markdown source. */
		value?: string;
		placeholder?: string;
		rows?: number;
		/** Initial view mode. */
		mode?: ViewMode;
		class?: string;
	}

	let {
		value = $bindable(''),
		placeholder = 'Write some Markdown…',
		rows = 12,
		mode = $bindable<ViewMode>('split'),
		class: className = ''
	}: Props = $props();

	let textarea = $state<HTMLTextAreaElement>();

	const modes: { value: ViewMode; label: string; icon: typeof Eye }[] = [
		{ value: 'write', label: 'Write', icon: Pencil },
		{ value: 'split', label: 'Split', icon: Columns2 },
		{ value: 'preview', label: 'Preview', icon: Eye }
	];

	/** Applies a toolbar action to the current textarea selection. */
	function applyAction(action: MarkdownAction) {
		const el = textarea;
		if (!el) return;

		const start = el.selectionStart;
		const end = el.selectionEnd;
		const selected = value.slice(start, end) || action.placeholder || '';

		let insert: string;
		let caretStart: number;
		let caretEnd: number;

		if (action.linePrefix) {
			// Prefix the beginning of the line the selection starts on.
			const lineStart = value.lastIndexOf('\n', start - 1) + 1;
			insert = value.slice(0, lineStart) + action.before + value.slice(lineStart);
			caretStart = caretEnd = start + action.before.length;
			value = insert;
		} else {
			const before = action.before;
			const after = action.after ?? '';
			insert = value.slice(0, start) + before + selected + after + value.slice(end);
			caretStart = start + before.length;
			caretEnd = caretStart + selected.length;
			value = insert;
		}

		// Restore focus and selection after the DOM updates.
		requestAnimationFrame(() => {
			el.focus();
			el.setSelectionRange(caretStart, caretEnd);
		});
	}
</script>

<div
	class={[
		'overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950',
		className
	]}
>
	<div
		class="flex items-center justify-between border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900"
	>
		<MarkdownToolbar onaction={applyAction} />
		<div class="flex items-center gap-0.5 px-2">
			{#each modes as m (m.value)}
				{@const Icon = m.icon}
				<button
					type="button"
					title={m.label}
					aria-label={m.label}
					aria-pressed={mode === m.value}
					class={[
						'flex items-center gap-1.5 rounded px-2 py-1 text-xs transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500',
						mode === m.value
							? 'bg-white font-medium text-gray-900 shadow-sm dark:bg-gray-800 dark:text-white'
							: 'text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'
					]}
					onclick={() => (mode = m.value)}
				>
					<Icon class="h-3.5 w-3.5" />
					<span class="hidden sm:inline">{m.label}</span>
				</button>
			{/each}
		</div>
	</div>

	<div class="grid" class:grid-cols-2={mode === 'split'}>
		{#if mode !== 'preview'}
			<textarea
				bind:this={textarea}
				bind:value
				{rows}
				{placeholder}
				spellcheck="false"
				class="w-full resize-y border-0 bg-transparent p-4 font-mono text-sm text-gray-900 focus:outline-none focus:ring-0 dark:text-gray-100"
			></textarea>
		{/if}
		{#if mode !== 'write'}
			<div
				class={[
					'overflow-auto p-4',
					mode === 'split' && 'border-l border-gray-200 dark:border-gray-800'
				]}
			>
				{#if value.trim()}
					<MarkdownRenderer source={value} />
				{:else}
					<p class="text-sm text-gray-400">Nothing to preview yet.</p>
				{/if}
			</div>
		{/if}
	</div>
</div>
