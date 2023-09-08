<script lang="ts">
	import Highlight from './Highlight.svelte';

	function portal(node: SVGElement) {
		document.body.prepend(node);
	}

	function onDocumentClick(e: MouseEvent) {
		// const target = e.target as HTMLElement;
		// const g = target?.closest('g');
		// console.log(target);
		// console.log(g);
		// if (g?.tagName === 'G') {
		// 	e.preventDefault();
		// 	console.log(g);
		// }
	}

	export let domRects: Array<DOMRectList>;
</script>

<svelte:document on:click={onDocumentClick} />

<svg
	use:portal
	id="highlight-overlayer"
	class="fixed top-0 z-10 pointer-events-none w-screen h-screen"
>
	{#each domRects as domRect}
		<Highlight rects={domRect} />
	{/each}
</svg>
