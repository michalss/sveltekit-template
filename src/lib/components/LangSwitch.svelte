<script lang="ts">
	import { Languages } from '@lucide/svelte';
	import { Dropdown, DropdownItem } from '$lib/components/ui';
	import { getLocale, locales, setLocale } from '$lib/paraglide/runtime';

	const current = getLocale();

	const labels: Record<string, string> = {
		en: 'English',
		cs: 'Čeština'
	};
</script>

<Dropdown label="Change language">
	{#snippet trigger()}
		<Languages class="h-4 w-4" />
		<span class="uppercase">{current}</span>
	{/snippet}

	{#snippet children(close)}
		{#each locales as locale (locale)}
			<DropdownItem
				selected={locale === current}
				onclick={() => {
					close();
					setLocale(locale);
				}}
			>
				<span class="w-6 text-xs font-semibold uppercase text-gray-400">{locale}</span>
				{labels[locale] ?? locale}
			</DropdownItem>
		{/each}
	{/snippet}
</Dropdown>
