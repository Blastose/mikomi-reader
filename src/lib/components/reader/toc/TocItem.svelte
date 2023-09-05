<script lang="ts">
	import type { NavPoint } from './tocParser';

	export let toc: NavPoint;
	export let currentPage: number;
</script>

<div
	class="flex items-start justify-between {toc.page && currentPage > toc.page
		? 'text-gray-300'
		: ''}"
>
	<a href={toc.content}>{toc.label}</a>
	{#if toc.page}
		<span
			class="text-sm min-w-[64px] text-end {toc.page && currentPage > toc.page
				? 'text-gray-300'
				: 'text-gray-500'}">{toc.page}</span
		>
	{/if}
</div>
