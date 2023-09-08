<script lang="ts">
	export let rects: DOMRectList;
	export let color = '#cbe7fa50';

	function onClick(e: Event) {
		console.log(e.target);

		g.style.pointerEvents = 'none';

		document.addEventListener(
			'mouseup',
			() => {
				g.style.pointerEvents = 'auto';
			},
			{ once: true }
		);
	}

	function onDocumentPointerDown(e: MouseEvent) {
		console.log(e);
		g.style.pointerEvents = 'none';
	}

	function onDocumentPointerUp(e: MouseEvent) {
		g.style.pointerEvents = 'auto';
	}

	let g: SVGElement;
</script>

<g
	bind:this={g}
	on:click={onClick}
	on:keydown={onClick}
	role="button"
	tabindex="-1"
	fill={color}
	class="pointer-events-auto select-none"
>
	{#each rects as rect}
		<rect class="" x={rect.left} y={rect.top} height={rect.height} width={rect.width} />
	{/each}
</g>
