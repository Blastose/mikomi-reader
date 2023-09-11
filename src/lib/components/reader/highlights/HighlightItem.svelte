<script lang="ts">
	import { removeHighlight } from '$lib/bindings';
	import { highlightsStore, type Highlight } from '$lib/components/reader/stores/highlightsStore';
	import { relativeTime } from '$lib/util/util';
	import { IconTrash } from '@tabler/icons-svelte';

	export let highlight: Highlight;
	export let columnCount: number;
	export let onSidebarItemClickWithPage: (page: number) => void;

	async function onTrashClick() {
		await removeHighlight(highlight.id);
		highlightsStore.update((highlights) => {
			const foundIndex = highlights.findIndex((hi) => hi.id === highlight.id);
			if (foundIndex === -1) return highlights;
			highlights.splice(foundIndex, 1);
			return highlights;
		});
	}
</script>

<div class="flex flex-col gap-2">
	<div class="flex justify-between text-gray-500">
		<p class="text-sm">
			Page {columnCount === 1 ? `${highlight.page}` : `${(highlight.page ?? 1) * 2 - 1}`} - {relativeTime(
				new Date(),
				highlight.dateAdded
			)}
		</p>
		<button on:click={onTrashClick} aria-label="Delete highlight">
			<IconTrash stroke={1} />
		</button>
	</div>

	<button
		on:click={() => {
			onSidebarItemClickWithPage(highlight.page);
		}}
		class="flex flex-col gap-1 rounded-sm text-left"
	>
		<span class="p-1 line-clamp-6" style="background-color: {highlight.color};">
			{highlight.displayText}
		</span>
		<span class="text-sm text-gray-500">
			{highlight.note}
		</span>
	</button>
</div>
