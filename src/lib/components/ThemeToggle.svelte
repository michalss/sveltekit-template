<script lang="ts">
	import { Sun, Moon, Monitor } from '@lucide/svelte';
	import { Dropdown, DropdownItem } from '$lib/components/ui';
	import { theme, type Theme } from '$lib/theme.svelte';

	const options = [
		{ value: 'light', label: 'Light', icon: Sun },
		{ value: 'dark', label: 'Dark', icon: Moon },
		{ value: 'system', label: 'System', icon: Monitor }
	] satisfies { value: Theme; label: string; icon: typeof Sun }[];

	// Show the actually-applied theme (sun/moon) once mounted.
	const TriggerIcon = $derived(theme.resolved === 'dark' ? Moon : Sun);
</script>

<Dropdown label="Change theme" showChevron={false}>
	{#snippet trigger()}
		{#if theme.mounted}
			<TriggerIcon class="h-5 w-5" />
		{:else}
			<!-- Reserve space before hydration to avoid an icon flash on refresh. -->
			<span class="h-5 w-5"></span>
		{/if}
	{/snippet}

	{#snippet children(close)}
		{#each options as option (option.value)}
			{@const Icon = option.icon}
			<DropdownItem
				selected={theme.preference === option.value}
				onclick={() => {
					theme.set(option.value);
					close();
				}}
			>
				<Icon class="h-4 w-4" />
				{option.label}
			</DropdownItem>
		{/each}
	{/snippet}
</Dropdown>
