<script lang="ts">
	import { Sparkles, ShieldCheck, Languages, Database } from '@lucide/svelte';
	import Header from '$lib/components/Header.svelte';
	import { Card } from '$lib/components/ui';
	import * as m from '$lib/paraglide/messages';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const features = [
		{ icon: ShieldCheck, title: 'Auth', text: 'Better Auth — email, magic link, Google & Microsoft OAuth.' },
		{ icon: Sparkles, title: 'AI', text: 'OpenAI, Gemini & DeepSeek behind one provider interface.' },
		{ icon: Languages, title: 'i18n', text: 'Paraglide with English & Czech out of the box.' },
		{ icon: Database, title: 'Database', text: 'Drizzle ORM on MariaDB/MySQL, schema migrations ready.' }
	];
</script>

<div class="min-h-screen bg-gray-50 dark:bg-gray-950">
	<Header user={data.user} />

	<main class="mx-auto max-w-5xl px-4 py-16">
		<section class="text-center">
			<span
				class="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-sm text-blue-700 dark:bg-blue-950/50 dark:text-blue-300"
			>
				<Sparkles class="h-4 w-4" /> SvelteKit Template
			</span>
			<h1 class="mt-4 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl dark:text-gray-100">
				{m.app_name()}
			</h1>
			<p class="mx-auto mt-4 max-w-xl text-lg text-gray-500 dark:text-gray-400">
				Auth, AI, i18n, Drizzle, Turnstile & Cloudflare-ready — preconfigured and ready to ship.
			</p>
			<div class="mt-8 flex items-center justify-center gap-3">
				{#if data.user}
					<a
						href="/dashboard"
						class="rounded-md bg-blue-600 px-5 py-2.5 font-medium text-white hover:bg-blue-700"
					>
						{m.nav_dashboard()}
					</a>
				{:else}
					<a
						href="/signup"
						class="rounded-md bg-blue-600 px-5 py-2.5 font-medium text-white hover:bg-blue-700"
					>
						{m.action_sign_up()}
					</a>
					<a
						href="/login"
						class="rounded-md border border-gray-300 bg-white px-5 py-2.5 font-medium text-gray-900 hover:bg-gray-50"
					>
						{m.action_sign_in()}
					</a>
				{/if}
			</div>
		</section>

		<section class="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
			{#each features as feature (feature.title)}
				{@const Icon = feature.icon}
				<Card>
					<Icon class="h-6 w-6 text-blue-600 dark:text-blue-400" />
					<h3 class="mt-3 font-semibold text-gray-900 dark:text-gray-100">{feature.title}</h3>
					<p class="mt-1 text-sm text-gray-500 dark:text-gray-400">{feature.text}</p>
				</Card>
			{/each}
		</section>
	</main>
</div>
