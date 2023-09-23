<script lang="ts">
	import { removeHighlight } from '$lib/bindings';
	import { addHighlightToDBAndStore } from '$lib/components/overlayer/utils';
	import { highlightsStore, type Highlight } from '$lib/components/reader/stores/highlightsStore';
	import { addToast } from '$lib/components/toast/ToastContainer.svelte';
	import { relativeTime } from '$lib/util/util';
	import { IconTrash } from '@tabler/icons-svelte';
	import { page } from '$app/stores';

	export let highlight: Highlight;
	export let columnCount: number;
	export let onSidebarItemClickWithPage: (page: number) => void;

	$: bookId = $page.params.id;

	async function onTrashClick() {
		highlightsStore.update((highlights) => {
			const foundIndex = highlights.findIndex((hi) => hi.id === highlight.id);
			if (foundIndex === -1) return highlights;
			highlights.splice(foundIndex, 1);
			return highlights;
		});
		await removeHighlight(highlight.id);

		const onUndo = () => {
			addHighlightToDBAndStore(highlight, bookId);
		};

		addToast({
			data: { title: 'Highlight deleted', color: '', description: '', onUndo: onUndo }
		});
	}
</script>

<div class="flex flex-col gap-2">
	<div class="flex justify-between">
		<p class="text-sm flex flex-col">
			<span>
				Page {columnCount === 1 ? `${highlight.page}` : `${(highlight.page ?? 1) * 2 - 1}`} - {relativeTime(
					new Date(),
					highlight.dateAdded
				)}
			</span>
			<span class="line-clamp-2">
				{highlight.chapter}
			</span>
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
		<span class="text-sm text-neutral-400">
			{highlight.note}
		</span>
	</button>
</div>
