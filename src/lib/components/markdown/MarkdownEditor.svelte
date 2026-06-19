<script lang="ts">
	import { Eye, Pencil, Columns2, LoaderCircle } from '@lucide/svelte';
	import MarkdownToolbar, { type MarkdownAction } from './MarkdownToolbar.svelte';
	import MarkdownRenderer from './MarkdownRenderer.svelte';
	import { uploadImage } from '$lib/upload';

	type ViewMode = 'write' | 'preview' | 'split';

	interface Props {
		/** Bindable markdown source. */
		value?: string;
		placeholder?: string;
		rows?: number;
		/** Initial view mode. */
		mode?: ViewMode;
		/** Enable image upload via button, paste and drag & drop. */
		allowImageUpload?: boolean;
		class?: string;
	}

	let {
		value = $bindable(''),
		placeholder = 'Write some Markdown…',
		rows = 12,
		mode = $bindable<ViewMode>('split'),
		allowImageUpload = true,
		class: className = ''
	}: Props = $props();

	let textarea = $state<HTMLTextAreaElement>();
	let fileInput = $state<HTMLInputElement>();
	let uploading = $state(0);
	let dragOver = $state(false);
	let uploadError = $state('');

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

	/** Inserts text at the current caret position (or appends if no textarea). */
	function insertAtCursor(text: string) {
		const el = textarea;
		if (!el) {
			value += text;
			return;
		}
		const start = el.selectionStart;
		const end = el.selectionEnd;
		value = value.slice(0, start) + text + value.slice(end);
		const caret = start + text.length;
		requestAnimationFrame(() => {
			el.focus();
			el.setSelectionRange(caret, caret);
		});
	}

	/** Uploads one image file and inserts a Markdown image at the cursor. */
	async function handleImageFile(file: File) {
		if (!file.type.startsWith('image/')) return;
		uploadError = '';
		uploading += 1;
		// Insert a placeholder so the user sees progress, then swap in the URL.
		const placeholderText = `![uploading ${file.name}…]()`;
		insertAtCursor(placeholderText);
		try {
			const url = await uploadImage(file);
			value = value.replace(placeholderText, `![${file.name}](${url})`);
		} catch (e) {
			value = value.replace(placeholderText, '');
			uploadError = e instanceof Error ? e.message : 'Upload failed';
		} finally {
			uploading -= 1;
		}
	}

	async function handleFiles(files: FileList | File[] | null | undefined) {
		if (!files) return;
		for (const file of Array.from(files)) {
			if (file.type.startsWith('image/')) await handleImageFile(file);
		}
	}

	function openFilePicker() {
		fileInput?.click();
	}

	function onPaste(event: ClipboardEvent) {
		if (!allowImageUpload) return;
		const images = Array.from(event.clipboardData?.items ?? [])
			.filter((item) => item.type.startsWith('image/'))
			.map((item) => item.getAsFile())
			.filter((f): f is File => f !== null);
		if (images.length) {
			event.preventDefault();
			handleFiles(images);
		}
	}

	function onDrop(event: DragEvent) {
		if (!allowImageUpload) return;
		const files = event.dataTransfer?.files;
		if (files && files.length) {
			event.preventDefault();
			dragOver = false;
			handleFiles(files);
		}
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
		<MarkdownToolbar onaction={applyAction} onimage={allowImageUpload ? openFilePicker : undefined} />
		<div class="flex items-center gap-0.5 px-2">
			{#if uploading > 0}
				<span class="flex items-center gap-1 px-1 text-xs text-gray-500 dark:text-gray-400">
					<LoaderCircle class="h-3.5 w-3.5 animate-spin" /> Uploading…
				</span>
			{/if}
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

	{#if uploadError}
		<p class="border-b border-red-200 bg-red-50 px-4 py-2 text-xs text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
			{uploadError}
		</p>
	{/if}

	<div class="grid" class:grid-cols-2={mode === 'split'}>
		{#if mode !== 'preview'}
			<div
				class="relative"
				role="presentation"
				ondragover={(e) => {
					if (allowImageUpload) {
						e.preventDefault();
						dragOver = true;
					}
				}}
				ondragleave={() => (dragOver = false)}
				ondrop={onDrop}
			>
				<textarea
					bind:this={textarea}
					bind:value
					{rows}
					{placeholder}
					spellcheck="false"
					onpaste={onPaste}
					class="h-full w-full resize-y border-0 bg-transparent p-4 font-mono text-sm text-gray-900 focus:outline-none focus:ring-0 dark:text-gray-100"
				></textarea>
				{#if dragOver}
					<div
						class="pointer-events-none absolute inset-2 flex items-center justify-center rounded-lg border-2 border-dashed border-blue-400 bg-blue-50/80 text-sm font-medium text-blue-700 dark:bg-blue-950/60 dark:text-blue-300"
					>
						Drop image to upload
					</div>
				{/if}
			</div>
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

	{#if allowImageUpload}
		<input
			bind:this={fileInput}
			type="file"
			accept="image/png,image/jpeg,image/gif,image/webp,image/svg+xml"
			multiple
			class="hidden"
			onchange={(e) => {
				handleFiles(e.currentTarget.files);
				e.currentTarget.value = '';
			}}
		/>
	{/if}
</div>
