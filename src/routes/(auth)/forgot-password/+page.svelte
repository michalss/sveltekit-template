<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button, Input, Alert } from '$lib/components/ui';
	import Turnstile from '$lib/components/Turnstile.svelte';
	import * as m from '$lib/paraglide/messages';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
	let submitting = $state(false);
	let captchaToken = $state('');
</script>

<div class="flex flex-col gap-6">
	<header class="text-center">
		<h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">{m.forgot_title()}</h1>
		<p class="mt-1 text-sm text-gray-500 dark:text-gray-400">{m.forgot_subtitle()}</p>
	</header>

	{#if form?.sent}
		<Alert variant="success">{m.forgot_sent()}</Alert>
	{:else}
		{#if form?.message}
			<Alert variant="error">
				{form.message === 'error_captcha' ? m.error_captcha() : m.error_generic()}
			</Alert>
		{/if}

		<form
			method="post"
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
			<Turnstile bind:token={captchaToken} />
			<Button type="submit" loading={submitting}>{m.forgot_submit()}</Button>
		</form>
	{/if}

	<p class="text-center text-sm text-gray-500 dark:text-gray-400">
		<a href="/login" class="font-medium text-blue-600 hover:underline dark:text-blue-400">
			{m.action_sign_in()}
		</a>
	</p>
</div>
