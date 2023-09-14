<script lang="ts">
	import type { SearchHighlight } from './search';

	export let searchResult: SearchHighlight['highlights'][0];
	export let onSidebarItemClickWithPage: (page: number) => void;

	function onClick() {
		if (searchResult.page > 0) {
			onSidebarItemClickWithPage(searchResult.page);
		}
	}
</script>

<button on:click={onClick} class="flex flex-col gap-1 text-left">
	<span class="text-gray-500 text-sm">Page {searchResult.page > 0 ? searchResult.page : 0}</span>
	<span>{@html searchResult.highlightedText}</span>
</button>
