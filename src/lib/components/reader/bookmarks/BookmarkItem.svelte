<script lang="ts">
	import type { Bookmark } from '$lib/components/reader/utils';
	import { relativeTime } from '$lib/util/util';
	import { IconDotsVertical, IconPencil, IconTrash } from '@tabler/icons-svelte';

	import { createDropdownMenu, melt } from '@melt-ui/svelte';
	import { fly } from 'svelte/transition';
	const {
		elements: { trigger, menu, item },
		states: { open }
	} = createDropdownMenu({
		preventScroll: false,
		forceVisible: true,
		positioning: { placement: 'bottom-end' }
	});

	export let bookmark: Bookmark;
	export let columnCount: number;
	export let onSidebarItemClickWithPage: (page: number) => void;
	export let onBookmarkItemDelete: (id: string) => void;
</script>

<div class="flex">
	<button
		class="flex flex-col grow"
		on:click={() => {
			onSidebarItemClickWithPage(bookmark.page ?? 1);
		}}
	>
		<span>Page {columnCount === 1 ? `${bookmark.page}` : `${(bookmark.page ?? 1) * 2 - 1}`}</span>
		<span class="text-sm text-neutral-400">{relativeTime(new Date(), bookmark.dateAdded)}</span>
	</button>
	<button
		class="h-min w-min p-1 text-neutral-400 duration-300 rounded-full hover:bg-neutral-700"
		use:melt={$trigger}
		aria-label="Open bookmark overflow menu"
	>
		<IconDotsVertical />
	</button>
</div>

{#if $open}
	<div
		class="bg-neutral-700 shadow-md rounded-md flex flex-col"
		use:melt={$menu}
		transition:fly={{ duration: 150, y: -10 }}
	>
		<button
			disabled
			class="cursor-not-allowed text-left pr-6 pl-4 py-2 flex gap-4 hover:bg-neutral-600 duration-150 rounded-md"
			use:melt={$item}
		>
			<IconPencil />
			<span>Edit</span>
		</button>
		<button
			class="text-left pr-6 pl-4 py-2 flex gap-4 hover:bg-neutral-600 duration-150 rounded-md"
			use:melt={$item}
			on:click={() => {
				onBookmarkItemDelete(bookmark.id);
			}}
		>
			<IconTrash />
			<span>Delete</span>
		</button>
	</div>
{/if}
