<script lang="ts">
	import type { Bookmark } from '$lib/components/reader/utils';
	import { relativeTime } from '$lib/util/util';

	export let bookmarks: Bookmark[];
	export let onBookmarkItemClick: (page: number) => void;
</script>

<div class="flex flex-col gap-2">
	{#each bookmarks as bookmark}
		<button
			class="flex flex-col"
			on:click={() => {
				onBookmarkItemClick(bookmark.page ?? 1);
			}}
		>
			<span>Page {bookmark.page}</span>
			<span class="text-sm text-gray-500">{relativeTime(new Date(), bookmark.dateAdded)}</span>
		</button>
	{/each}
</div>
