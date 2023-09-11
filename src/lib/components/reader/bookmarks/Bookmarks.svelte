<script lang="ts">
	import type { Bookmark } from '$lib/components/reader/utils';
	import BookmarkItem from './BookmarkItem.svelte';
	import { flip } from 'svelte/animate';

	export let bookmarks: Bookmark[];
	export let columnCount: number;
	export let onSidebarItemClickWithPage: (page: number) => void;
	export let onBookmarkItemDelete: (id: string) => void;
</script>

<div class="flex flex-col gap-2">
	{#each bookmarks as bookmark, index (bookmark.id)}
		<div class="flex flex-col gap-2" animate:flip={{ duration: 300 }}>
			<BookmarkItem {bookmark} {columnCount} {onSidebarItemClickWithPage} {onBookmarkItemDelete} />
			{#if index !== bookmarks.length - 1}
				<hr />
			{/if}
		</div>
	{/each}
	{#if bookmarks.length === 0}
		<p class="text-gray-500">No bookmarks</p>
	{/if}
</div>
