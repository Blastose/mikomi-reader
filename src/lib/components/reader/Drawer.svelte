<script lang="ts">
	import { createDialog, melt } from '@melt-ui/svelte';
	import { fade, fly } from 'svelte/transition';
	import { IconList, IconX } from '@tabler/icons-svelte';
	import Menu from './Menu.svelte';
	import type { NavPoint } from '$lib/components/reader/toc/tocParser';
	import type { Writable } from 'svelte/store';
	import type { Bookmark } from './utils';

	export let tocData: NavPoint[];
	export let currentPage: number;
	export let drawerOpen: Writable<boolean>;
	export let bookmarks: Bookmark[];
	export let onBookmarkItemClick: (page: number) => void;

	const {
		elements: { trigger, overlay, content, close, portalled }
	} = createDialog({ open: drawerOpen });
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
				duration: 300
			}}
		>
			<button
				use:melt={$close}
				aria-label="Close"
				class="absolute right-[10px] top-[10px] inline-flex h-6 w-6
            appearance-none items-center justify-center rounded-full text-gray-800
            hover:bg-gray-100 focus:shadow-gray-400 focus:outline-none focus:ring-2
            focus:ring-gray-400"
			>
				<IconX />
			</button>
			<Menu {tocData} {currentPage} {bookmarks} {onBookmarkItemClick} />
		</div>
	{/if}
</div>
