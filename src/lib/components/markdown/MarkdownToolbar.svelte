<script lang="ts">
	import {
		Bold,
		Italic,
		Heading,
		Link,
		List,
		ListOrdered,
		Code,
		Quote
	} from '@lucide/svelte';

	export interface MarkdownAction {
		/** Text inserted before the selection. */
		before: string;
		/** Text inserted after the selection. */
		after?: string;
		/** Placeholder used when there is no selection. */
		placeholder?: string;
		/** When true, prefixes the start of the line instead of wrapping. */
		linePrefix?: boolean;
	}

	interface Props {
		onaction: (action: MarkdownAction) => void;
	}

	let { onaction }: Props = $props();

	const buttons: { icon: typeof Bold; label: string; action: MarkdownAction }[] = [
		{ icon: Bold, label: 'Bold', action: { before: '**', after: '**', placeholder: 'bold' } },
		{ icon: Italic, label: 'Italic', action: { before: '_', after: '_', placeholder: 'italic' } },
		{
			icon: Heading,
			label: 'Heading',
			action: { before: '## ', placeholder: 'Heading', linePrefix: true }
		},
		{
			icon: Link,
			label: 'Link',
			action: { before: '[', after: '](https://)', placeholder: 'text' }
		},
		{
			icon: Code,
			label: 'Code',
			action: { before: '`', after: '`', placeholder: 'code' }
		},
		{
			icon: Quote,
			label: 'Quote',
			action: { before: '> ', placeholder: 'quote', linePrefix: true }
		},
		{
			icon: List,
			label: 'Bulleted list',
			action: { before: '- ', placeholder: 'item', linePrefix: true }
		},
		{
			icon: ListOrdered,
			label: 'Numbered list',
			action: { before: '1. ', placeholder: 'item', linePrefix: true }
		}
	];
</script>

<div
	class="flex flex-wrap items-center gap-0.5 border-b border-gray-200 bg-gray-50 px-2 py-1.5 dark:border-gray-800 dark:bg-gray-900"
>
	{#each buttons as button (button.label)}
		{@const Icon = button.icon}
		<button
			type="button"
			title={button.label}
			aria-label={button.label}
			class="rounded p-1.5 text-gray-600 transition hover:bg-gray-200 hover:text-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
			onclick={() => onaction(button.action)}
		>
			<Icon class="h-4 w-4" />
		</button>
	{/each}
</div>
