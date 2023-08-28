<script lang="ts">
	import { createTabs, melt } from '@melt-ui/svelte';
	import { cubicInOut } from 'svelte/easing';
	import { crossfade } from 'svelte/transition';

	const {
		elements: { root, list, content, trigger },
		states: { value }
	} = createTabs({
		defaultValue: 'tab-1'
	});

	const triggers = [
		{ id: 'tab-1', title: 'Table of contents' },
		{ id: 'tab-2', title: 'Bookmarks' },
		{ id: 'tab-3', title: 'Notes' }
	];

	const [send, receive] = crossfade({
		duration: 250,
		easing: cubicInOut
	});
</script>

<div use:melt={$root}>
	<div
		use:melt={$list}
		class="flex shrink-0 overflow-x-auto
    data-[orientation=vertical]:flex-col data-[orientation=vertical]:border-r"
		aria-label="Manage your account"
	>
		{#each triggers as triggerItem}
			<button use:melt={$trigger(triggerItem.id)} class="trigger relative hover:cursor-pointer">
				{triggerItem.title}
				{#if $value === triggerItem.id}
					<div
						in:send={{ key: 'trigger' }}
						out:receive={{ key: 'trigger' }}
						class="absolute bottom-1 left-1/2 h-1 w-6 -translate-x-1/2 rounded-full bg-slate-400"
					/>
				{/if}
			</button>
		{/each}
	</div>
	<div use:melt={$content('tab-1')} class="grow bg-white p-5">
		<p class="mb-5 leading-normal text-neutral-900">
			Make changes to your account here. Click save when you're done.
		</p>
		<fieldset class="mb-4 flex w-full flex-col justify-start">
			<label class="mb-2.5 block text-sm leading-none text-neutral-900" for="name"> Name </label>
			<input id="name" value="Thomas G. Lopes" />
		</fieldset>

		<div class="mt-5 flex justify-end">
			<button class="save">Save changes</button>
		</div>
	</div>
	<div use:melt={$content('tab-2')} class="grow bg-white p-5">
		<p class="mb-5 leading-normal text-neutral-900">
			Change your password here. Click save when you're done.
		</p>
		<fieldset class="mb-4 flex w-full flex-col justify-start">
			<label class="mb-2.5 block text-sm leading-none text-neutral-900" for="new">
				New password
			</label>
			<input id="new" type="password" />
		</fieldset>
		<div class="mt-5 flex justify-end">
			<button class="save">Save changes</button>
		</div>
	</div>
	<div use:melt={$content('tab-3')} class="grow bg-white p-5">
		<p class="mb-5 leading-normal text-neutral-900">
			Change your settings here. Click save when you're done.
		</p>

		<fieldset class="mb-4 flex w-full flex-col justify-start">
			<label class="mb-2.5 block text-sm leading-none text-neutral-900" for="new">
				New email
			</label>
			<input id="new" type="password" />
		</fieldset>
		<div class="mt-5 flex justify-end">
			<button class="save">Save changes</button>
		</div>
	</div>
</div>

<style>
	.trigger {
		display: flex;
		align-items: center;
		justify-content: center;

		border-radius: 0;

		font-weight: 500;
		line-height: 1;

		flex: 1;
		height: theme(spacing.12);
		padding-inline: theme(spacing.2);

		/* &:focus {
			position: relative;
		}

		&:focus-visible {
			@apply z-10 ring-2;
		}

		&[data-state='active'] {
			@apply focus:relative;
			background-color: white;
			color: orange;
		} */
	}
</style>
