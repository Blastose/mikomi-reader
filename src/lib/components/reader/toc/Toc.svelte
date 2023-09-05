<script lang="ts">
	import type { NavPoint } from '$lib/components/reader/toc/tocParser';
	import TocItem from '$lib/components/reader/toc/TocItem.svelte';

	export let tocData: NavPoint[];
	export let currentPage: number;
	export let isRoot: boolean;

	let showStartNav = false;

	if (isRoot) {
		if (tocData.length > 0) {
			if (tocData[0].page !== 1) {
				showStartNav = true;
			}
		}
	}
</script>

{#if tocData.length > 0}
	<div class="flex flex-col gap-2">
		{#if showStartNav}
			{@const startToc = {
				page: 1,
				content: 'epub://text-epub-start',
				label: 'Start',
				children: []
			}}
			<TocItem toc={startToc} {currentPage} />
		{/if}
		{#each tocData as toc}
			<TocItem {toc} {currentPage} />
			{#if toc.children.length > 0}
				<div class="ml-4">
					<svelte:self tocData={toc.children} {currentPage} isRoot={false} />
				</div>
			{/if}
		{/each}
	</div>
{/if}
