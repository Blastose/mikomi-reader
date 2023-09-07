<script lang="ts">
	import type { Bookmark } from '$lib/components/reader/utils';
	import { relativeTime } from '$lib/util/util';
	import { IconDotsVertical } from '@tabler/icons-svelte';

	export let bookmarks: Bookmark[];
	export let onBookmarkItemClick: (page: number) => void;
</script>

<div class="flex flex-col gap-2">
	{#each bookmarks as bookmark}
		<div class="flex">
			<button
				class="flex flex-col grow"
				on:click={() => {
					onBookmarkItemClick(bookmark.page ?? 1);
				}}
			>
				<span>Page {bookmark.page}</span>
				<span class="text-sm text-gray-500">{relativeTime(new Date(), bookmark.dateAdded)}</span>
			</button>
			<button class="text-gray-500" aria-label="Open bookmark overflow menu">
				<IconDotsVertical />
			</button>
		</div>
	{/each}
	{#if bookmarks.length === 0}
		<p class="text-gray-500">No bookmarks</p>
	{/if}
</div>
