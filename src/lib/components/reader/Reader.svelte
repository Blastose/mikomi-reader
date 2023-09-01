<script lang="ts">
	import { smoothScrollTo } from './utils';
	import type { Orientation } from './utils';

	export let html: string;

	// Settings
	export let columnCount: number = 1;
	export let fontSize: number = 16;
	export let writingMode: Orientation = 'horizontal';

	export let readerNode: HTMLDivElement;
	export let readerHeight: number;
	export let readerWidth: number;
	export let columnGap = 24;

	let page: number;
	let totalPages: number;

	function nextPage() {
		readerNode.scrollLeft += readerWidth + columnGap;
		readerNode.scrollTop += readerHeight + columnGap;
	}

	function prevPage() {
		readerNode.scrollLeft -= readerWidth + columnGap;
		readerNode.scrollTop -= readerHeight + columnGap;
	}

	function nextPageSmoothHorizontal() {
		const scrollLeft = readerNode.scrollLeft + readerWidth + columnGap;

		smoothScrollTo(scrollLeft, readerNode, readerWidth + columnGap);
	}

	function prevPageSmoothHorizontal() {
		const scrollLeft = readerNode.scrollLeft - readerWidth + columnGap;

		smoothScrollTo(scrollLeft, readerNode, readerWidth + columnGap);
	}

	function onKeyDown(e: KeyboardEvent) {
		if (e.key === 'ArrowRight') {
			e.preventDefault();
			nextPageSmoothHorizontal();
		} else if (e.key === 'ArrowLeft') {
			e.preventDefault();
			prevPageSmoothHorizontal();
		}
	}

	function onScroll(e: WheelEvent) {
		e.preventDefault();
		if (e.deltaY > 0) {
			nextPage();
		} else {
			prevPage();
		}
	}
</script>

<svelte:window on:wheel={onScroll} on:keydown={onKeyDown} />

<div
	style="--column-gap: {columnGap}px;
         --column-count: {columnCount}; 
         --max-height: {readerHeight * 0.95}px; 
         --max-width: {readerWidth}px; 
         font-size: {fontSize}px !important;"
	class="text-epub
        {writingMode === 'horizontal' ? 'writing-horizontal-tb' : 'writing-vertical-rl'}"
	bind:this={readerNode}
	bind:clientHeight={readerHeight}
	bind:clientWidth={readerWidth}
>
	{@html html}
</div>

<style>
	.text-epub {
		font-family: 'ヒラギノ角ゴ Pro W3', 'Hiragino Kaku Gothic Pro', 'メイリオ', Meiryo,
			'ＭＳ Ｐゴシック', sans-serif;
		user-select: text;
		max-height: calc(100dvh - 200px);
		height: 100vh;
		width: 100vw;
		max-width: 100%;
		overflow-y: hidden;
		overflow-x: hidden;
		column-count: var(--column-count);
		column-fill: auto;
		column-gap: var(--column-gap);
	}

	.text-epub :global(img),
	.text-epub :global(image),
	.text-epub :global(svg:has(image)) {
		max-height: var(--max-height) !important;
		max-width: 100%;
		height: auto;
		object-fit: contain;
	}

	.text-epub :global(svg > image) {
		height: 100%;
		width: 100%;
	}

	.text-epub :global(img) {
		display: inline;
	}

	.text-epub.writing-vertical-rl {
		column-count: 1 !important;
	}

	.writing-horizontal-tb :global(div.new-body) {
		writing-mode: horizontal-tb !important;
		-epub-writing-mode: horizontal-tb !important;
		-webkit-writing-mode: horizontal-tb !important;
	}

	.writing-vertical-rl :global(div.new-body) {
		writing-mode: vertical-rl !important;
		-epub-writing-mode: vertical-rl !important;
		-webkit-writing-mode: vertical-rl !important;
	}

	.writing-horizontal-tb {
		writing-mode: horizontal-tb !important;
		-epub-writing-mode: horizontal-tb !important;
		-webkit-writing-mode: horizontal-tb !important;
	}

	.writing-vertical-rl {
		writing-mode: vertical-rl !important;
		-epub-writing-mode: vertical-rl !important;
		-webkit-writing-mode: vertical-rl !important;
	}

	.text-epub > :global(div.new-body) {
		break-before: column;
	}

	.text-epub :global([epub\:type='pagebreak']) {
		break-before: column;
		display: block;
	}

	.text-epub :global(rt) {
		user-select: none;
	}
</style>
