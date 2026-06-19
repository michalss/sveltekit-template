<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import { Card } from '$lib/components/ui';
	import { MarkdownEditor, MarkdownRenderer } from '$lib/components/markdown';
	import { CheckCircle2, Circle, Terminal } from '@lucide/svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	/** Setup steps shown as an interactive checklist (state is local only). */
	const steps = $state([
		{
			title: 'Install dependencies',
			cmd: 'npm install',
			done: false,
			detail: 'Installs SvelteKit, Better Auth, Drizzle, AI SDKs and the rest.'
		},
		{
			title: 'Create your environment file',
			cmd: 'cp .env.example .env',
			done: false,
			detail: 'Then fill in the required values listed below.'
		},
		{
			title: 'Generate a Better Auth secret',
			cmd: 'npx @better-auth/cli secret',
			done: false,
			detail: 'Paste the result into BETTER_AUTH_SECRET in .env.'
		},
		{
			title: 'Push the database schema',
			cmd: 'npm run db:push',
			done: false,
			detail: 'Creates the user/session/account/verification tables in MariaDB.'
		},
		{
			title: 'Start the dev server',
			cmd: 'npm run dev',
			done: false,
			detail: 'Open http://localhost:5173 — you are ready to build.'
		}
	]);

	const completed = $derived(steps.filter((s) => s.done).length);

	const envVars = [
		{ key: 'DATABASE_URL', required: true, note: 'MariaDB/MySQL connection string' },
		{ key: 'BETTER_AUTH_SECRET', required: true, note: '32+ random chars' },
		{ key: 'ORIGIN', required: true, note: 'App URL, https:// in production' },
		{ key: 'GOOGLE_CLIENT_ID / _SECRET', required: false, note: 'Google OAuth' },
		{ key: 'MICROSOFT_CLIENT_ID / _SECRET', required: false, note: 'Microsoft OAuth' },
		{ key: 'OPENAI_API_KEY', required: false, note: 'OpenAI models' },
		{ key: 'GEMINI_API_KEY', required: false, note: 'Google Gemini' },
		{ key: 'DEEPSEEK_API_KEY', required: false, note: 'DeepSeek models' },
		{ key: 'PUBLIC_TURNSTILE_SITE_KEY / TURNSTILE_SECRET_KEY', required: false, note: 'Captcha' }
	];

	const features = `## What's included

- **Auth** — Better Auth: email + password, magic link, Google & Microsoft OAuth
- **AI** — OpenAI, Gemini & DeepSeek behind one provider interface (streaming)
- **i18n** — Paraglide with English & Czech
- **Database** — Drizzle ORM on MariaDB/MySQL
- **Captcha** — Cloudflare Turnstile (fails closed in production)
- **Security** — CSP & security headers, rate limiting, hardened cookies
- **UI** — Tailwind v4, dark mode, reusable component kit, Lucide icons

> Optional integrations degrade gracefully — the app runs with an empty \`.env\`.`;

	let editorValue = $state(
		`# Markdown editor demo

This editor is a **reusable component** (\`MarkdownEditor\`) built with Svelte 5 runes.

- Type on the left, see the **live preview** on the right
- Use the toolbar for *formatting*
- Switch between Write / Split / Preview

\`\`\`ts
import { MarkdownEditor } from '$lib/components/markdown';
\`\`\`

> Output is sanitized with DOMPurify before rendering.`
	);
</script>

<svelte:head>
	<title>Setup — SvelteKit Template</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 dark:bg-gray-950">
	<Header user={data.user} />

	<main class="mx-auto max-w-4xl px-4 py-12">
		<header class="mb-10">
			<h1 class="text-3xl font-bold text-gray-900 dark:text-gray-100">Getting started</h1>
			<p class="mt-2 text-gray-500 dark:text-gray-400">
				Everything you need to fill in and run to get this template working.
			</p>
		</header>

		<!-- Setup checklist -->
		<section class="mb-10">
			<div class="mb-3 flex items-center justify-between">
				<h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">Setup checklist</h2>
				<span class="text-sm text-gray-500 dark:text-gray-400">{completed}/{steps.length} done</span>
			</div>

			<div class="flex flex-col gap-3">
				{#each steps as step, i (step.title)}
					<Card class="!p-4">
						<div class="flex items-start gap-3">
							<button
								type="button"
								class="mt-0.5 shrink-0 text-gray-300 transition hover:text-green-500 dark:text-gray-600"
								aria-label={step.done ? 'Mark as not done' : 'Mark as done'}
								onclick={() => (steps[i].done = !steps[i].done)}
							>
								{#if step.done}
									<CheckCircle2 class="h-6 w-6 text-green-500" />
								{:else}
									<Circle class="h-6 w-6" />
								{/if}
							</button>
							<div class="min-w-0 flex-1">
								<h3
									class={[
										'font-medium',
										step.done
											? 'text-gray-400 line-through dark:text-gray-600'
											: 'text-gray-900 dark:text-gray-100'
									]}
								>
									{i + 1}. {step.title}
								</h3>
								<p class="mt-0.5 text-sm text-gray-500 dark:text-gray-400">{step.detail}</p>
								<div
									class="mt-2 flex items-center gap-2 rounded-md bg-gray-900 px-3 py-2 font-mono text-sm text-gray-100 dark:bg-black"
								>
									<Terminal class="h-4 w-4 shrink-0 text-gray-500" />
									<code class="overflow-x-auto">{step.cmd}</code>
								</div>
							</div>
						</div>
					</Card>
				{/each}
			</div>
		</section>

		<!-- Environment variables -->
		<section class="mb-10">
			<h2 class="mb-3 text-lg font-semibold text-gray-900 dark:text-gray-100">
				Environment variables
			</h2>
			<Card class="!p-0">
				<table class="w-full text-left text-sm">
					<thead
						class="border-b border-gray-200 text-xs uppercase tracking-wide text-gray-400 dark:border-gray-800"
					>
						<tr>
							<th class="px-4 py-3 font-medium">Variable</th>
							<th class="px-4 py-3 font-medium">Required</th>
							<th class="px-4 py-3 font-medium">Notes</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-gray-100 dark:divide-gray-800">
						{#each envVars as v (v.key)}
							<tr>
								<td class="px-4 py-2.5 font-mono text-gray-900 dark:text-gray-100">{v.key}</td>
								<td class="px-4 py-2.5">
									{#if v.required}
										<span class="rounded-full bg-red-50 px-2 py-0.5 text-xs text-red-700 dark:bg-red-950/50 dark:text-red-300">
											required
										</span>
									{:else}
										<span class="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500 dark:bg-gray-800 dark:text-gray-400">
											optional
										</span>
									{/if}
								</td>
								<td class="px-4 py-2.5 text-gray-500 dark:text-gray-400">{v.note}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</Card>
		</section>

		<!-- Feature overview rendered from Markdown -->
		<section class="mb-10">
			<h2 class="mb-3 text-lg font-semibold text-gray-900 dark:text-gray-100">Overview</h2>
			<Card>
				<MarkdownRenderer source={features} />
			</Card>
		</section>

		<!-- Reusable Markdown editor demo -->
		<section>
			<h2 class="mb-3 text-lg font-semibold text-gray-900 dark:text-gray-100">
				Markdown editor component
			</h2>
			<MarkdownEditor bind:value={editorValue} rows={14} />
		</section>
	</main>
</div>
