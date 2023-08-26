<script lang="ts">
	import type { NavPoint } from './tocParser';

	export let toc: NavPoint;
	export let currentPage: number;
</script>

<div class="flex flex-col {toc.page && currentPage > toc.page ? 'text-gray-300' : ''}">
	<a href={toc.content} title={toc.content}>{toc.label}</a>
	{#if toc.page}
		<span class="text-sm {toc.page && currentPage > toc.page ? 'text-gray-300' : 'text-gray-500'}"
			>p{toc.page}</span
		>
	{/if}
</div>
