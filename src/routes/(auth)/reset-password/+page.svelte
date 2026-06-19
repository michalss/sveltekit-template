<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button, Input, Alert } from '$lib/components/ui';
	import * as m from '$lib/paraglide/messages';
	import type { PageData, ActionData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	let submitting = $state(false);

	function errorText(code: string): string {
		switch (code) {
			case 'error_password_short':
				return m.error_password_short();
			case 'error_password_match':
				return m.error_password_match();
			case 'error_reset_token':
				return m.error_reset_token();
			default:
				return m.error_generic();
		}
	}
</script>

<div class="flex flex-col gap-6">
	<header class="text-center">
		<h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">{m.reset_title()}</h1>
		<p class="mt-1 text-sm text-gray-500 dark:text-gray-400">{m.reset_subtitle()}</p>
	</header>

	{#if !data.token}
		<Alert variant="error">{m.error_reset_token()}</Alert>
	{:else}
		{#if form?.message}
			<Alert variant="error">{errorText(form.message)}</Alert>
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
			<input type="hidden" name="token" value={data.token} />
			<Input
				label={m.field_password()}
				name="password"
				type="password"
				autocomplete="new-password"
				required
				minlength={8}
			/>
			<Input
				label={m.field_password_confirm()}
				name="confirm"
				type="password"
				autocomplete="new-password"
				required
				minlength={8}
			/>
			<Button type="submit" loading={submitting}>{m.reset_submit()}</Button>
		</form>
	{/if}
</div>
