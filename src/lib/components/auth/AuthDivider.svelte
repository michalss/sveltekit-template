<script lang="ts">
	import { page } from '$app/state';
	import * as m from '$lib/paraglide/messages';

	// Only show the "or continue with email" divider when at least one social
	// provider is configured (otherwise there is nothing to separate from).
	const providers = $derived(
		page.data.socialProviders ?? { google: false, microsoft: false }
	);
	const hasSocial = $derived(providers.google || providers.microsoft);
</script>

{#if hasSocial}
	<div class="flex items-center gap-3">
		<div class="h-px flex-1 bg-gray-200 dark:bg-gray-700"></div>
		<span class="text-xs uppercase tracking-wide text-gray-400">{m.or_continue_with_email()}</span>
		<div class="h-px flex-1 bg-gray-200 dark:bg-gray-700"></div>
	</div>
{/if}
