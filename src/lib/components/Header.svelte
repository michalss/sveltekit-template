<script lang="ts">
	import { goto } from '$app/navigation';
	import { signOut } from '$lib/auth-client';
	import { Button } from '$lib/components/ui';
	import LangSwitch from './LangSwitch.svelte';
	import ThemeToggle from './ThemeToggle.svelte';
	import * as m from '$lib/paraglide/messages';
	import type { User } from 'better-auth';

	let { user }: { user?: User } = $props();

	let signingOut = $state(false);

	async function logout() {
		signingOut = true;
		await signOut();
		await goto('/login', { invalidateAll: true });
		signingOut = false;
	}
</script>

<header class="border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
	<div class="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
		<a href="/" class="font-semibold text-gray-900 dark:text-gray-100">{m.app_name()}</a>

		<nav class="flex items-center gap-2">
			<ThemeToggle />
			<LangSwitch />
			{#if user}
				<a
					href="/dashboard"
					class="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
				>
					{m.nav_dashboard()}
				</a>
				<Button size="sm" variant="ghost" loading={signingOut} onclick={logout}>
					{m.nav_logout()}
				</Button>
			{:else}
				<a
					href="/login"
					class="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
				>
					{m.nav_login()}
				</a>
			{/if}
		</nav>
	</div>
</header>
