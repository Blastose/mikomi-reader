<script lang="ts">
	import type { NavPoint } from '$lib/components/reader/toc/tocParser';
	import TocItem from '$lib/components/reader/toc/TocItem.svelte';

	export let tocData: NavPoint[];
	export let currentPage: number;
</script>

{#if tocData.length > 0}
	<div class="flex flex-col gap-2">
		{#each tocData as toc}
			<TocItem {toc} {currentPage} />
			{#if toc.children.length > 0}
				<div class="ml-4">
					<svelte:self tocData={toc.children} {currentPage} />
				</div>
			{/if}
		{/each}
	</div>
{/if}
