<script lang="ts">
	import { Sun, Moon, Monitor } from '@lucide/svelte';
	import { Dropdown, DropdownItem } from '$lib/components/ui';
	import { theme, type Theme } from '$lib/theme.svelte';

	const options: { value: Theme; label: string; icon: typeof Sun }[] = [
		{ value: 'light', label: 'Light', icon: Sun },
		{ value: 'dark', label: 'Dark', icon: Moon },
		{ value: 'system', label: 'System', icon: Monitor }
	];

	const TriggerIcon = $derived(theme.resolved === 'dark' ? Moon : Sun);
</script>

<Dropdown label="Change theme" showChevron={false}>
	{#snippet trigger()}
		<TriggerIcon class="h-4 w-4" />
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
