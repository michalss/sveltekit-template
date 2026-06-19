<script lang="ts">
	import { Card } from '$lib/components/ui';
	import * as m from '$lib/paraglide/messages';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<div class="flex flex-col gap-6">
	<header>
		<h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">
			{m.dashboard_welcome({ name: data.user.name })}
		</h1>
		<p class="mt-1 text-gray-500 dark:text-gray-400">{m.dashboard_subtitle()}</p>
	</header>

	<Card>
		<dl class="grid grid-cols-1 gap-4 sm:grid-cols-2">
			<div>
				<dt class="text-xs uppercase tracking-wide text-gray-400">{m.field_name()}</dt>
				<dd class="text-gray-900 dark:text-gray-100">{data.user.name}</dd>
			</div>
			<div>
				<dt class="text-xs uppercase tracking-wide text-gray-400">{m.field_email()}</dt>
				<dd class="text-gray-900 dark:text-gray-100">{data.user.email}</dd>
			</div>
		</dl>
	</Card>
</div>
