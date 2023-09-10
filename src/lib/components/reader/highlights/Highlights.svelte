<script lang="ts">
	import { highlightsStore } from '$lib/components/reader/stores/highlightsStore';
</script>

<div>
	{#each $highlightsStore as highlight}
		<div>
			p.{highlight.page}|note:{highlight.note}|-{highlight.displayText}
		</div>
	{/each}
</div>
