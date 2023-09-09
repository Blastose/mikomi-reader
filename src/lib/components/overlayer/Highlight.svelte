<script lang="ts">
	export let rects: DOMRectList;
	export let color = '#cbe7fa80';

	async function onClick(e: MouseEvent) {
		g.style.pointerEvents = 'auto';
		if (window.getSelection()?.toString()) return;
		console.log(e.target);

		console.log('click now do something');
	}

	function onSelectStart() {
		// g.style.pointerEvents = 'none';
	}

	function onc() {
		console.log('aldjas;ldjksa;d');
	}

	let g: SVGElement;
</script>

<svelte:document on:click={onClick} on:selectstart={onSelectStart} />

<!-- svelte-ignore a11y-interactive-supports-focus -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<g bind:this={g} on:click={onc} role="button" fill={color} class="pointer-events-auto">
	{#each rects as rect}
		<rect class="" x={rect.left} y={rect.top} height={rect.height} width={rect.width} />
	{/each}
</g>
