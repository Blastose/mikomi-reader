<script lang="ts">
	import type { TocData } from '$lib/bindings';

	export let tocData: TocData[];
</script>

<div>
	{#each tocData as toc}
		<div>
			<a href={toc.content} title={toc.content}>{toc.label}</a>
		</div>
	{/each}
</div>
