<script lang="ts">
	import { highlightsStore } from '$lib/components/reader/stores/highlightsStore';
</script>

<div>
	{#each $highlightsStore as highlight}
		<div>
			{highlight.color}|{highlight.id}
		</div>
	{/each}
</div>
