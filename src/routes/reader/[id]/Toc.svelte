<script lang="ts">
	import type { NavPoint } from './tocParser';

	export let tocData: NavPoint[];
</script>

{#if tocData.length > 0}
	<div class="flex flex-col gap-2">
		{#each tocData as toc}
			<div class="flex flex-col">
				<a href={toc.content} title={toc.content}>{toc.label}</a>
				{#if toc.page}
					<span class="text-sm text-gray-500">p{toc.page}</span>
				{/if}
			</div>

			{#if toc.children.length > 0}
				<div class="ml-4">
					<svelte:self tocData={toc.children} />
				</div>
			{/if}
		{/each}
	</div>
{/if}
