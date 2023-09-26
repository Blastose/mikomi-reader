<script lang="ts">
	import type { SearchHighlight } from './search';

	export let searchResult: SearchHighlight['highlights'][0];
	export let columnCount: number;
	export let onSidebarItemClickWithPage: (page: number) => void;

	function onClick() {
		if (searchResult.page > 0) {
			onSidebarItemClickWithPage(searchResult.page);
		}
	}
</script>

<button on:click={onClick} class="flex flex-col gap-1 text-left">
	<span class="text-neutral-400 text-sm"
		>Page {columnCount === 1 ? `${searchResult.page}` : `${(searchResult.page ?? 1) * 2 - 1}`}</span
	>
	<span>{@html searchResult.highlightedText}</span>
</button>
