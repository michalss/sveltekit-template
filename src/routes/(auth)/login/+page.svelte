<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button, Input, Alert } from '$lib/components/ui';
	import SocialButtons from '$lib/components/auth/SocialButtons.svelte';
	import Turnstile from '$lib/components/Turnstile.svelte';
	import * as m from '$lib/paraglide/messages';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();

	let mode = $state<'password' | 'magic'>('password');
	let submitting = $state(false);
	let captchaToken = $state('');
</script>

<div class="flex flex-col gap-6">
	<header class="text-center">
		<h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">{m.login_title()}</h1>
		<p class="mt-1 text-sm text-gray-500 dark:text-gray-400">{m.login_subtitle()}</p>
	</header>

	<SocialButtons />

	<div class="flex items-center gap-3">
		<div class="h-px flex-1 bg-gray-200 dark:bg-gray-700"></div>
		<span class="text-xs uppercase tracking-wide text-gray-400">{m.or_continue_with_email()}</span>
		<div class="h-px flex-1 bg-gray-200 dark:bg-gray-700"></div>
	</div>

	{#if form?.magicSent}
		<Alert variant="success">{m.magic_link_sent()}</Alert>
	{:else}
		{#if form?.message}
			<Alert variant="error">
				{form.message === 'error_captcha' ? m.error_captcha() : m.error_generic()}
			</Alert>
		{/if}

		<form
			method="post"
			action={mode === 'password' ? '?/password' : '?/magic'}
			use:enhance={() => {
				submitting = true;
				return async ({ update }) => {
					await update();
					submitting = false;
				};
			}}
			class="flex flex-col gap-4"
		>
			<Input
				label={m.field_email()}
				name="email"
				type="email"
				autocomplete="email"
				required
				value={form?.email ?? ''}
			/>

			{#if mode === 'password'}
				<Input
					label={m.field_password()}
					name="password"
					type="password"
					autocomplete="current-password"
					required
				/>
			{/if}

			<Turnstile bind:token={captchaToken} />

			<Button type="submit" loading={submitting}>
				{mode === 'password' ? m.action_sign_in() : m.action_send_magic_link()}
			</Button>
		</form>

		<div class="flex items-center justify-between">
			<button
				type="button"
				class="text-sm text-blue-600 hover:underline dark:text-blue-400"
				onclick={() => (mode = mode === 'password' ? 'magic' : 'password')}
			>
				{mode === 'password' ? m.use_magic_link() : m.use_password()}
			</button>
			<a
				href="/forgot-password"
				class="text-sm text-gray-500 hover:underline dark:text-gray-400"
			>
				{m.forgot_password()}
			</a>
		</div>
	{/if}

	<p class="text-center text-sm text-gray-500 dark:text-gray-400">
		{m.no_account()}
		<a href="/signup" class="font-medium text-blue-600 hover:underline dark:text-blue-400">
			{m.action_sign_up()}
		</a>
	</p>
</div>
