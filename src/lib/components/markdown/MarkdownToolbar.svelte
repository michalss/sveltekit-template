<script lang="ts">
	import {
		Bold,
		Italic,
		Heading,
		Link,
		List,
		ListOrdered,
		Code,
		Quote,
		Image as ImageIcon
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
		/** Called when the image button is clicked (omit to hide the button). */
		onimage?: () => void;
	}

	let { onaction, onimage }: Props = $props();

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

	{#if onimage}
		<span class="mx-1 h-5 w-px bg-gray-300 dark:bg-gray-700"></span>
		<button
			type="button"
			title="Insert image"
			aria-label="Insert image"
			class="rounded p-1.5 text-gray-600 transition hover:bg-gray-200 hover:text-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
			onclick={onimage}
		>
			<ImageIcon class="h-4 w-4" />
		</button>
	{/if}
</div>
