<script lang="ts">
	import type { NavPoint } from './tocParser';

	export let tocData: NavPoint[];
</script>

<div>
	{#each tocData as toc}
		<div>
			<a href={toc.content} title={toc.content}>{toc.label}</a>
		</div>

		<div class="ml-4">
			<svelte:self tocData={toc.children} />
		</div>
	{/each}
</div>
