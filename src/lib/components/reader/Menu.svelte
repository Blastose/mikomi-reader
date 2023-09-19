<script lang="ts">
	import { createTabs, melt } from '@melt-ui/svelte';
	import { cubicInOut } from 'svelte/easing';
	import { crossfade } from 'svelte/transition';
	import Toc from './toc/Toc.svelte';
	import Bookmarks from './bookmarks/Bookmarks.svelte';
	import type { NavPoint } from '$lib/components/reader/toc/tocParser';
	import type { Bookmark } from './utils';
	import Highlights from './highlights/Highlights.svelte';

	export let tocData: NavPoint[];
	export let currentPage: number;
	export let bookmarks: Bookmark[];
	export let columnCount: number;
	export let onSidebarItemClickWithPage: (page: number) => void;
	export let onBookmarkItemDelete: (id: string) => void;

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

<div use:melt={$root} class="dialog-theme flex flex-col h-full">
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

	<div
		use:melt={$content('tab-1')}
		class="item-gutter grow px-6 py-4 custom-scroll overflow-y-auto"
	>
		<Toc {tocData} {currentPage} {columnCount} />
	</div>
	<div
		use:melt={$content('tab-2')}
		class="item-gutter grow pl-6 pr-2 py-4 custom-scroll overflow-y-auto"
	>
		<Bookmarks {bookmarks} {columnCount} {onSidebarItemClickWithPage} {onBookmarkItemDelete} />
	</div>
	<div
		use:melt={$content('tab-3')}
		class="item-gutter grow px-6 py-4 custom-scroll overflow-y-auto"
	>
		<Highlights {columnCount} {onSidebarItemClickWithPage} />
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
		height: 3rem;
		padding-inline: 0.5rem;
	}

	.item-gutter {
		scrollbar-gutter: stable;
	}
</style>
