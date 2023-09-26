<script lang="ts">
	import { createDialog, melt } from '@melt-ui/svelte';
	import { fade, fly } from 'svelte/transition';
	import { IconList, IconX } from '@tabler/icons-svelte';
	import Menu from './Menu.svelte';
	import type { NavPoint } from '$lib/components/reader/toc/tocParser';
	import type { Writable } from 'svelte/store';
	import type { Bookmark } from '$lib/components/reader/utils';
	import { quintOut } from 'svelte/easing';

	export let tocData: NavPoint[];
	export let currentPage: number;
	export let drawerOpen: Writable<boolean>;
	export let bookmarks: Bookmark[];
	export let columnCount: number;
	export let onSidebarItemClickWithPage: (page: number) => void;
	export let onBookmarkItemDelete: (id: string) => void;

	const {
		elements: { trigger, overlay, content, close, portalled }
	} = createDialog({ open: drawerOpen, preventScroll: false });
</script>

<button use:melt={$trigger} aria-label="Open reader sidebar">
	<IconList />
</button>

<div use:melt={$portalled}>
	{#if $drawerOpen}
		<div
			use:melt={$overlay}
			class="fixed inset-0 z-50 bg-black/50"
			transition:fade={{ duration: 150 }}
		/>
		<div
			use:melt={$content}
			class="fixed left-0 top-0 z-50 h-screen w-full max-w-[350px] bg-white
        shadow-lg focus:outline-none"
			transition:fly={{
				x: -350,
				duration: 500,
				opacity: 1,
				easing: quintOut
			}}
		>
			<button
				use:melt={$close}
				aria-label="Close"
				class="absolute right-[10px] top-[10px] inline-flex p-1
				appearance-none items-center justify-center rounded-full text-neutral-200
				hover:bg-neutral-700 focus:shadow-neutral-400 focus:outline-none focus:ring-2
				focus:ring-neutral-400"
			>
				<IconX />
			</button>
			<Menu
				{tocData}
				{currentPage}
				{bookmarks}
				{columnCount}
				{onSidebarItemClickWithPage}
				{onBookmarkItemDelete}
			/>
		</div>
	{/if}
</div>
