<script lang="ts">
	import { createTabs, melt } from '@melt-ui/svelte';
	import { cubicInOut } from 'svelte/easing';
	import { crossfade } from 'svelte/transition';
	import Toc from './toc/Toc.svelte';
	import type { NavPoint } from '$lib/components/reader/toc/tocParser';

	export let tocData: NavPoint[];
	export let currentPage: number;

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

<div use:melt={$root} class="flex flex-col max-h-full">
	<div
		use:melt={$list}
		class="flex shrink-0 overflow-x-auto pt-8 px-6
    data-[orientation=vertical]:flex-col data-[orientation=vertical]:border-r"
		aria-label="Navigate book contents"
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

	<div use:melt={$content('tab-1')} class="grow px-6 py-4 overflow-y-auto">
		<Toc {tocData} {currentPage} isRoot={false} />
	</div>
	<div use:melt={$content('tab-2')} class="grow px-6 py-4 overflow-y-auto">Tab2</div>
	<div use:melt={$content('tab-3')} class="grow px-6 py-4 overflow-y-auto">Tab3</div>
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
		height: 3rem;
		padding-inline: 0.5rem;
	}
</style>
