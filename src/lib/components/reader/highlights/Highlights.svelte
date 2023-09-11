<script lang="ts">
	import { highlightsStore } from '$lib/components/reader/stores/highlightsStore';
	import { flip } from 'svelte/animate';
	import HighlightItem from './HighlightItem.svelte';

	export let onSidebarItemClickWithPage: (page: number) => void;
</script>

<div class="flex flex-col gap-4">
	{#each $highlightsStore as highlight, index (highlight.id)}
		<div class="flex flex-col gap-4" animate:flip={{ duration: 300 }}>
			<HighlightItem {highlight} {onSidebarItemClickWithPage} />
			{#if index !== $highlightsStore.length - 1}
				<hr />
			{/if}
		</div>
	{/each}
	{#if $highlightsStore.length === 0}
		<p class="text-gray-500">No highlights</p>
	{/if}
</div>
