<script lang="ts">
	import { tick } from 'svelte';
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
	import { writable, type Writable } from 'svelte/store';
	import { readerStateStore } from './stores/readerStateStore';
	import Overlayer from '$lib/components/overlayer/Overlayer.svelte';
	import { searchModalOpenStore } from './search/search';
	import type { EnglishFont, LineHeight, TextAlign } from './settings/settings';
	import Slider from '$lib/components/reader/slider/Slider.svelte';
	import ImageDialog from '$lib/components/reader/image-dialog/ImageDialog.svelte';
	import { open } from '@tauri-apps/api/shell';

	export let html: string;
	export let drawerOpen: Writable<boolean>;

	// Settings
	export let columnCount: number = 1;
	export let fontSize: number = 16;
	export let writingMode: Orientation = 'horizontal';
	export let lineHeight: LineHeight;
	export let textAlign: TextAlign;
	export let fontFamily: EnglishFont;
	export let margins: number;

	export let readerNode: HTMLDivElement;
	export let overlayContainer: HTMLDivElement;
	export let readerHeight: number;
	export let readerWidth: number;
	export let columnGap = 24;
	// TODO If we want to let the reader change the column gap
	// when the reader is in 2 cols, we need to make a new variable
	$: columnGap = 24 + margins * 2;

	export const onColumnCountChange = async (newColumnCount: 1 | 2) => {
		await jumpToLastVisibleElementAfterFunction(async () => {
			columnCount = newColumnCount;
			await tick();
			fillerPageAtEnd = checkTwoColumnViewRequiresFillerPageAtEnd();
		});
		await tick();
		updateCurrentPage();
		updateTotalPages();
		dispatchResize();
	};
	export const onWritingModeChange = async (newWritingMode: Orientation) => {
		await jumpToLastVisibleElementAfterFunction(async () => {
			writingMode = newWritingMode;
			if (writingMode === 'vertical') {
				fillerPageAtEnd = false;
			}
		});
		await tick();
		updateCurrentPage();
		updateTotalPages();
		dispatchResize();
	};

	export let currentPage: number;
	export let totalPages: number;
	export let pageSize: number;

	$: pageSize =
		writingMode === 'horizontal'
			? readerWidth + columnGap - margins * 2
			: readerHeight + columnGap - margins * 2;

	$: if ($drawerOpen === false) {
		readerStateStore.set('reading');
	} else {
		readerStateStore.set('sidebarOpen');
	}

	export let currentScroll: number;
	$: currentScroll = writingMode === 'horizontal' ? readerNode?.scrollLeft : readerNode?.scrollTop;

	let showRuler = false;
	let showImage: string | null = null;

	const dispatch = createEventDispatcher();

	function dispatchResize() {
		dispatch('pageresize');
	}

	function setScrollBasedOnWritingMode(newScroll: number) {
		if (writingMode === 'horizontal') {
			readerNode.scrollLeft = newScroll;
			readerNode.scrollTop = 0;
		} else {
			readerNode.scrollLeft = 0;
			readerNode.scrollTop = newScroll;
		}
	}

	function nextPage() {
		setScrollBasedOnWritingMode(currentScroll + pageSize);
	}

	function prevPage() {
		setScrollBasedOnWritingMode(currentScroll - pageSize);
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
		if ($readerStateStore !== 'reading') return;

		if (e.key === 'ArrowRight') {
			e.preventDefault();
			nextPageSmoothHorizontal();
		} else if (e.key === 'ArrowLeft') {
			e.preventDefault();
			prevPageSmoothHorizontal();
		} else if (e.key === 'd') {
			e.preventDefault();
			if (writingMode === 'horizontal') {
				nextPage();
			} else {
				prevPage();
			}
		} else if (e.key === 'a') {
			e.preventDefault();
			if (writingMode === 'horizontal') {
				prevPage();
			} else {
				nextPage();
			}
		} else if (e.key === 't') {
			e.preventDefault();
			drawerOpen.set(true);
		} else if (e.key === 's' || (e.ctrlKey && e.key === 'f')) {
			e.preventDefault();
			searchModalOpenStore.set(true);
			readerStateStore.set('searchOpen');
		}
		updateCurrentPage();
	}

	function onScroll(e: WheelEvent) {
		if ($drawerOpen) return;
		if ($readerStateStore !== 'reading') return;

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
		const lastVisibleElement = getFirstVisibleElementInParentElement(readerNode, writingMode);
		console.log(lastVisibleElement);
		await func();
		await tick();
		if (lastVisibleElement) {
			const scrollToUse =
				writingMode === 'horizontal' ? lastVisibleElement.offsetLeft : lastVisibleElement.offsetTop;
			setScrollBasedOnWritingMode(getScrollAlignedToPageFloor(scrollToUse, pageSize));
		}
	}

	async function onResize() {
		await tick();
		setScrollBasedOnWritingMode(getScrollAlignedToPageFloor(currentScroll, pageSize));
		updateCurrentPage();
		updateTotalPages();
		dispatchResize();
	}

	const debouncedOnResize = debounce(onResize, 500);

	function onDocumentClick(e: MouseEvent) {
		const target = e.target as HTMLElement | null;
		const a = target?.closest('a');

		if (a?.tagName === 'A') {
			e.preventDefault();
			if (!a.href.startsWith('epub://') && a.href.startsWith('http')) {
				// Open link in user's browser
				open(a.href);
				return;
			}
			onAnchorClick(a);
		} else if (target?.tagName === 'IMG' || target?.tagName.toUpperCase() === 'IMAGE') {
			if (!e.altKey) return;
			e.preventDefault();
			const imgNode = target as HTMLImageElement;
			showImage = imgNode.src ?? imgNode.getAttribute('xlink:href');
			showImageStore.set(true);
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

		const scrollToUse = writingMode === 'horizontal' ? scrollLeft : scrollTop;
		setScrollBasedOnWritingMode(getScrollAlignedToPageFloor(scrollToUse, pageSize));

		updateCurrentPage();
		history.pushState(currentPage, '');
		drawerOpen.set(false);
	}

	function updateScrollFromPageNumber(pageNumber: number) {
		setScrollBasedOnWritingMode((pageNumber - 1) * pageSize);
	}

	function onPopstate(e: PopStateEvent) {
		e.preventDefault();
		if (e.state?.page) {
			currentPage = e.state.page;
			updateScrollFromPageNumber(currentPage);
		}
	}

	$: history.replaceState({ page: currentPage }, '');

	const showImageStore = writable(false);
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

<ImageDialog {showImageStore} src={showImage} />

<SideButtons
	orientation={writingMode}
	nextPage={() => {
		nextPage();
		updateCurrentPage();
	}}
	prevPage={() => {
		prevPage();
		updateCurrentPage();
	}}
/>

<Overlayer bind:overlayContainer {readerNode} {currentPage} {pageSize} orientation={writingMode} />

<div
	style="--column-gap: {columnGap}px;
         --column-count: {columnCount}; 
         --max-height: {readerHeight * 0.95}px; 
         --max-width: {readerWidth * 0.95}px; 
				 --text-align: {textAlign};
				 --font-family: {fontFamily};
				 --line-height: {lineHeight};
         font-size: {fontSize}px !important;
				 {writingMode === 'horizontal' ? `padding: 0 ${margins}px;` : `padding: ${margins}px 0;`}"
	class="text-epub
        {writingMode === 'horizontal' ? 'writing-horizontal-tb' : 'writing-vertical-rl'}"
	class:with-line-height={lineHeight !== 'normal'}
	class:with-text-align={textAlign !== 'initial'}
	bind:this={readerNode}
	bind:clientHeight={readerHeight}
	bind:clientWidth={readerWidth}
>
	{@html html}
	{#if fillerPageAtEnd}
		<div id="filler-column" class="new-body" />
	{/if}
</div>

<div>
	<div>
		{#if totalPages}
			{#key totalPages}
				<Slider
					max={totalPages}
					bind:currentPage
					onChange={(page) => {
						updateScrollFromPageNumber(page);
					}}
				/>
			{/key}
		{:else}
			<div class="w-full" />
		{/if}
	</div>
	<div>
		<button
			class="opacity-75"
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
		font-family: var(--font-family) !important;
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
		mix-blend-mode: var(--mix-blend-mode);
	}

	.text-epub.writing-vertical-rl :global(img),
	.text-epub.writing-vertical-rl :global(image),
	.text-epub.writing-vertical-rl :global(svg:has(image)) {
		max-height: 100%;
		max-width: var(--max-width) !important;
		height: auto;
		object-fit: contain;
		mix-blend-mode: var(--mix-blend-mode);
	}

	.text-epub :global(svg > image) {
		height: 100%;
		width: 100%;
	}

	.text-epub :global(img) {
		display: inline;
	}

	.text-epub :global(p) {
		font-family: var(--font-family) !important;
	}

	.text-epub.with-text-align :global(p) {
		text-align: var(--text-align) !important;
	}

	.text-epub.with-line-height :global(p) {
		line-height: var(--line-height) !important;
	}

	.text-epub :global(a) {
		color: var(--link-color) !important;
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
