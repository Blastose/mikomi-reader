<script lang="ts">
	import { onMount, tick } from 'svelte';
	import {
		createSelectorFromEpubUri,
		getFirstVisibleElementInParentElement,
		getPageFromScroll,
		getScrollAlignedToPageFloor,
		smoothScrollTo
	} from './utils';
	import type { Orientation } from './utils';
	import debounce from 'just-debounce-it';
	import SideButtons from './SideButtons.svelte';
	import Ruler from './Ruler.svelte';
	import { createEventDispatcher } from 'svelte';
	import type { Writable } from 'svelte/store';

	export let html: string;
	export let drawerOpen: Writable<boolean>;

	// Settings
	export let columnCount: number = 1;
	export let fontSize: number = 16;
	export let writingMode: Orientation = 'horizontal';

	export let readerNode: HTMLDivElement;
	export let readerHeight: number;
	export let readerWidth: number;
	export let columnGap = 24;

	export let currentPage: number;
	export let totalPages: number;
	export let pageSize: number;
	$: pageSize = writingMode === 'horizontal' ? readerWidth + columnGap : readerHeight + columnGap;

	let showRuler = false;

	const dispatch = createEventDispatcher();

	function dispatchResize() {
		dispatch('pageresize');
	}

	function nextPage() {
		readerNode.scrollLeft += pageSize;
		readerNode.scrollTop += pageSize;
	}

	function prevPage() {
		readerNode.scrollLeft -= pageSize;
		readerNode.scrollTop -= pageSize;
	}

	function nextPageSmoothHorizontal() {
		const scrollLeft = readerNode.scrollLeft + pageSize;

		smoothScrollTo(scrollLeft, readerNode, pageSize);
	}

	function prevPageSmoothHorizontal() {
		const scrollLeft = readerNode.scrollLeft - pageSize;

		smoothScrollTo(scrollLeft, readerNode, pageSize);
	}

	function onKeyDown(e: KeyboardEvent) {
		if (e.key === 'ArrowRight') {
			e.preventDefault();
			nextPageSmoothHorizontal();
		} else if (e.key === 'ArrowLeft') {
			e.preventDefault();
			prevPageSmoothHorizontal();
		} else if (e.key === 'd') {
			e.preventDefault();
			nextPage();
		} else if (e.key === 'a') {
			e.preventDefault();
			prevPage();
		} else if (e.key === 't') {
			e.preventDefault();
			drawerOpen.set(true);
		}
		updateCurrentPage();
	}

	function onScroll(e: WheelEvent) {
		if ($drawerOpen) return;

		if (e.deltaY > 0) {
			nextPage();
		} else {
			prevPage();
		}
		updateCurrentPage();
	}

	function updateCurrentPage(newPage?: number) {
		if (newPage) {
			currentPage = newPage;
		} else {
			if (writingMode === 'horizontal') {
				currentPage = getPageFromScroll(readerNode?.scrollLeft, pageSize);
			} else {
				currentPage = getPageFromScroll(readerNode?.scrollTop, pageSize);
			}
		}
	}

	function updateTotalPages() {
		if (writingMode === 'horizontal') {
			totalPages = getPageFromScroll(readerNode?.scrollWidth, pageSize) - 1;
		} else {
			totalPages = getPageFromScroll(readerNode?.scrollHeight, pageSize) - 1;
		}
	}

	let fillerPageAtEnd = false;
	function checkTwoColumnViewRequiresFillerPageAtEnd() {
		if (columnCount !== 2) return false;
		const totalPagesWithTwoColumns = Math.round(2 * (readerNode.scrollWidth / pageSize));
		return totalPagesWithTwoColumns % 2 === 1;
	}

	async function jumpToLastVisibleElementAfterFunction(func: () => Promise<void>) {
		const lastVisibleElement = getFirstVisibleElementInParentElement(readerNode);
		console.log(lastVisibleElement);
		await func();
		await tick();
		if (lastVisibleElement) {
			readerNode.scrollLeft = getScrollAlignedToPageFloor(lastVisibleElement.offsetLeft, pageSize);
			readerNode.scrollTop = getScrollAlignedToPageFloor(lastVisibleElement.offsetTop, pageSize);
		}
	}

	async function onResize() {
		await tick();
		readerNode.scrollLeft = getScrollAlignedToPageFloor(readerNode.scrollLeft, pageSize);
		readerNode.scrollTop = getScrollAlignedToPageFloor(readerNode.scrollTop, pageSize);
		updateCurrentPage();
		updateTotalPages();
		dispatchResize();
	}

	const debouncedOnResize = debounce(onResize, 500);

	function onDocumentClick(e: MouseEvent) {
		const target = e.target as HTMLAnchorElement | null;
		const a = target?.closest('a');

		if (a?.tagName === 'A') {
			e.preventDefault();
			if (!a.href.startsWith('epub://')) return;
			onAnchorClick(a);
		}
	}

	function onAnchorClick(a: HTMLAnchorElement) {
		const selector = createSelectorFromEpubUri(a.href);
		const el = document.querySelector<HTMLElement>(selector);
		if (!el) return;

		const readerNodeRect = readerNode.getBoundingClientRect();
		const elRect = el.getBoundingClientRect();
		const scrollLeft = elRect.left - readerNodeRect.left + readerNode.scrollLeft;
		const scrollTop = elRect.top - readerNodeRect.top + readerNode.scrollTop;

		readerNode.scrollLeft = getScrollAlignedToPageFloor(scrollLeft, pageSize);
		readerNode.scrollTop = getScrollAlignedToPageFloor(scrollTop, pageSize);

		updateCurrentPage();
		history.pushState(currentPage, '');
		drawerOpen.set(false);
	}

	function updateScrollFromPageNumber(pageNumber: number) {
		readerNode.scrollLeft = (pageNumber - 1) * pageSize;
		readerNode.scrollTop = (pageNumber - 1) * pageSize;
	}

	function onPopstate(e: PopStateEvent) {
		e.preventDefault();
		if (e.state?.page) {
			currentPage = e.state.page;
			updateScrollFromPageNumber(currentPage);
		}
	}

	$: history.replaceState({ page: currentPage }, '');

	onMount(() => {
		updateCurrentPage();
		updateTotalPages();
	});
</script>

<svelte:window
	on:popstate={onPopstate}
	on:wheel={onScroll}
	on:keydown={onKeyDown}
	on:resize={debouncedOnResize}
/>
<svelte:document on:click={onDocumentClick} />

{#if showRuler}
	<Ruler />
{/if}

<SideButtons
	nextPage={() => {
		nextPage();
		updateCurrentPage();
	}}
	prevPage={() => {
		prevPage();
		updateCurrentPage();
	}}
/>

<div
	style="--column-gap: {columnGap}px;
         --column-count: {columnCount}; 
         --max-height: {readerHeight * 0.95}px; 
         --max-width: {readerWidth * 0.95}px; 
         font-size: {fontSize}px !important;"
	class="text-epub
        {writingMode === 'horizontal' ? 'writing-horizontal-tb' : 'writing-vertical-rl'}"
	bind:this={readerNode}
	bind:clientHeight={readerHeight}
	bind:clientWidth={readerWidth}
>
	{@html html}
	{#if fillerPageAtEnd}
		<div id="filler-column" class="new-body">This page is left blank</div>
	{/if}
</div>
<div>
	<div>
		<input
			class="w-full"
			type="range"
			min="1"
			max={totalPages}
			bind:value={currentPage}
			on:input={(e) => {
				updateScrollFromPageNumber(Number(e.currentTarget.value));
			}}
		/>
	</div>
	<div>
		<button
			on:click={async () => {
				await jumpToLastVisibleElementAfterFunction(async () => {
					columnCount = columnCount === 1 ? 2 : 1;
					await tick();
					fillerPageAtEnd = checkTwoColumnViewRequiresFillerPageAtEnd();
				});
				await tick();
				updateCurrentPage();
				updateTotalPages();
				dispatchResize();
			}}>Col</button
		>
		<button
			on:click={async () => {
				await jumpToLastVisibleElementAfterFunction(async () => {
					writingMode = writingMode === 'horizontal' ? 'vertical' : 'horizontal';
					if (writingMode === 'vertical') {
						fillerPageAtEnd = false;
					}
				});
				await tick();
				updateCurrentPage();
				updateTotalPages();
				dispatchResize();
			}}>Dir</button
		>
		<button
			on:click={() => {
				console.log(checkTwoColumnViewRequiresFillerPageAtEnd());
				fillerPageAtEnd = checkTwoColumnViewRequiresFillerPageAtEnd();
			}}
		>
			Req 2
		</button>
		<button
			on:click={() => {
				showRuler = !showRuler;
			}}
		>
			Ruler
		</button>
	</div>
	<!-- <p>{currentPage}/{totalPages}</p>
	<p>{readerWidth}</p>
	<p>{pageSize}</p>
	<p>{readerNode?.scrollWidth}</p> -->
</div>

<style>
	.text-epub {
		font-family: 'ヒラギノ角ゴ Pro W3', 'Hiragino Kaku Gothic Pro', 'メイリオ', Meiryo,
			'ＭＳ Ｐゴシック', sans-serif;
		user-select: text;
		max-height: calc(100dvh - 128px);
		height: 100vh;
		width: 100vw;
		max-width: 100%;
		overflow-y: hidden;
		overflow-x: hidden;
		column-count: var(--column-count);
		column-fill: auto;
		column-gap: var(--column-gap);
	}

	:global(html) {
		scrollbar-gutter: auto !important;
	}

	.text-epub.writing-horizontal-tb :global(img),
	.text-epub.writing-horizontal-tb :global(image),
	.text-epub.writing-horizontal-tb :global(svg:has(image)) {
		max-height: var(--max-height) !important;
		max-width: 100%;
		height: auto;
		object-fit: contain;
	}

	.text-epub.writing-vertical-rl :global(img),
	.text-epub.writing-vertical-rl :global(image),
	.text-epub.writing-vertical-rl :global(svg:has(image)) {
		max-height: 100%;
		max-width: var(--max-width) !important;
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
