<script lang="ts">
	import { enhance } from '$app/forms';
	import { Card, Button, Alert } from '$lib/components/ui';
	import { ShieldCheck, Ban, Undo2 } from '@lucide/svelte';
	import type { PageData, ActionData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
</script>

<div class="flex flex-col gap-4">
	<header class="flex items-center justify-between">
		<h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Users</h1>
		<span class="text-sm text-gray-500 dark:text-gray-400">{data.total} total</span>
	</header>

	{#if form?.message}
		<Alert variant="error">{form.message}</Alert>
	{/if}

	<Card class="!p-0">
		<table class="w-full text-left text-sm">
			<thead
				class="border-b border-gray-200 text-xs uppercase tracking-wide text-gray-400 dark:border-gray-800"
			>
				<tr>
					<th class="px-4 py-3 font-medium">User</th>
					<th class="px-4 py-3 font-medium">Role</th>
					<th class="px-4 py-3 font-medium">Status</th>
					<th class="px-4 py-3 text-right font-medium">Actions</th>
				</tr>
			</thead>
			<tbody class="divide-y divide-gray-100 dark:divide-gray-800">
				{#each data.users as user (user.id)}
					{@const role = (user as { role?: string }).role ?? 'user'}
					{@const banned = (user as { banned?: boolean }).banned ?? false}
					<tr>
						<td class="px-4 py-3">
							<div class="font-medium text-gray-900 dark:text-gray-100">{user.name}</div>
							<div class="text-xs text-gray-500 dark:text-gray-400">{user.email}</div>
						</td>
						<td class="px-4 py-3">
							<span
								class={[
									'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs',
									role === 'admin'
										? 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300'
										: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'
								]}
							>
								{#if role === 'admin'}<ShieldCheck class="h-3 w-3" />{/if}
								{role}
							</span>
						</td>
						<td class="px-4 py-3">
							{#if banned}
								<span class="rounded-full bg-red-50 px-2 py-0.5 text-xs text-red-700 dark:bg-red-950/50 dark:text-red-300">
									banned
								</span>
							{:else}
								<span class="text-xs text-green-600 dark:text-green-400">active</span>
							{/if}
						</td>
						<td class="px-4 py-3">
							<div class="flex items-center justify-end gap-1.5">
								<form method="post" action="?/setRole" use:enhance>
									<input type="hidden" name="userId" value={user.id} />
									<input type="hidden" name="role" value={role === 'admin' ? 'user' : 'admin'} />
									<Button type="submit" size="sm" variant="outline">
										{role === 'admin' ? 'Make user' : 'Make admin'}
									</Button>
								</form>
								{#if banned}
									<form method="post" action="?/unban" use:enhance>
										<input type="hidden" name="userId" value={user.id} />
										<Button type="submit" size="sm" variant="ghost">
											<Undo2 class="h-3.5 w-3.5" /> Unban
										</Button>
									</form>
								{:else}
									<form method="post" action="?/ban" use:enhance>
										<input type="hidden" name="userId" value={user.id} />
										<Button type="submit" size="sm" variant="danger">
											<Ban class="h-3.5 w-3.5" /> Ban
										</Button>
									</form>
								{/if}
							</div>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</Card>
</div>
