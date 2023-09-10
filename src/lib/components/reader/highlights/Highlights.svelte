<script lang="ts">
	import { highlightsStore } from '$lib/components/reader/stores/highlightsStore';
</script>

<div>
	{#each $highlightsStore as highlight}
		<div>
			p.{highlight.page}|-{highlight.displayText}
		</div>
	{/each}
</div>
