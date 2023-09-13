<script lang="ts">
	import Reader from '$lib/components/reader/Reader.svelte';
	import type { Orientation } from '$lib/components/reader/utils.js';
	import { onDestroy, onMount, tick } from 'svelte';
	import { loadEpub } from '$lib/components/reader/loadEpub.js';
	import {
		calculateBookmarkPageNumbers,
		calculateTocPageNumbers,
		clearEpubStyles,
		getFirstVisibleElementInParentElement,
		getNodeBySelector,
		getPageFromScroll,
		getScrollAlignedToPageFloor,
		getSelector,
		goToPage
	} from '$lib/components/reader/utils.js';
	import { IconBookmark, IconBookmarkFilled, IconLetterCase } from '@tabler/icons-svelte';
	import Drawer from '$lib/components/reader/Drawer.svelte';
	import type { NavPoint } from '$lib/components/reader/toc/tocParser';
	import { writable } from 'svelte/store';
	import type { Bookmark } from '$lib/components/reader/utils.js';
	import { addBookmark, removeBookmark } from '$lib/bindings.js';
	import type { Bookmark as BookmarkDB, Highlight as HighlightDB } from '$lib/bindings.js';
	import { readerStateStore } from '$lib/components/reader/stores/readerStateStore';
	import { highlightsStore } from '$lib/components/reader/stores/highlightsStore.js';
	import type { Highlight } from '$lib/components/reader/stores/highlightsStore.js';
	import {
		alignRectsToReaderPage,
		filterCompletelyOverlappingRectangles
	} from '$lib/components/overlayer/utils.js';
	import Search from '$lib/components/reader/search/Search.svelte';
	import { searchHighlightsStore } from '$lib/components/reader/search/search.js';

	export let data;

	let html: string;
	let loading = true;
	let columnCount: number;
	let fontSize: number;
	let writingMode: Orientation;

	let readerNode: HTMLDivElement;
	let readerHeight: number;
	let readerWidth: number;
	let columnGap = 24;
	let currentPage: number;
	let totalPages: number;
	let pageSize: number;

	let blobUrls: string[] = [];

	let tocData: NavPoint[] = [];
	let drawerOpen = writable(false);

	let bookmarks: Bookmark[] = [];

	// Todo: Watch out for performance issues when quickly changing currentPage
	$: currentPageBookmarks = currentPageInBookmarks(currentPage);

	function initializeHighlightDataFromDB(highlights: HighlightDB[]): Highlight[] {
		return highlights.flatMap((highlight) => {
			const startContainer = getNodeBySelector(highlight.start_container);
			const endContainer = getNodeBySelector(highlight.end_container);
			if (!startContainer || !endContainer) {
				return [];
			}
			const startOffset = highlight.start_offset;
			const endOffset = highlight.end_offset;
			const range = new Range();
			range.setStart(startContainer, startOffset);
			range.setEnd(endContainer, endOffset);

			const clientRects = range.getClientRects();
			const readerNodeRect = readerNode.getBoundingClientRect();
			const rects = alignRectsToReaderPage(
				Array.from(clientRects),
				writingMode,
				readerNodeRect,
				pageSize,
				currentPage
			);
			const filteredRects: DOMRect[] = filterCompletelyOverlappingRectangles(rects);

			const scroll = getScrollAlignedToPageFloor(
				writingMode === 'horizontal' ? filteredRects[0].x : filteredRects[0].y,
				pageSize
			);
			return {
				id: highlight.id,
				note: highlight.note,
				dateAdded: highlight.date_added,
				displayText: range.toString(),
				page: getPageFromScroll(scroll, pageSize),
				range,
				rects: filteredRects,
				color: highlight.color
			};
		});
	}

	function updateHighlightRectsAndPages() {
		highlightsStore.update((highlights) => {
			for (const highlight of highlights) {
				const clientRects = highlight.range.getClientRects();
				const readerNodeRect = readerNode.getBoundingClientRect();
				const rects = alignRectsToReaderPage(
					Array.from(clientRects),
					writingMode,
					readerNodeRect,
					pageSize,
					currentPage
				);
				const filteredRects: DOMRect[] = filterCompletelyOverlappingRectangles(rects);
				highlight.rects = filteredRects;
				const scroll = getScrollAlignedToPageFloor(
					writingMode === 'horizontal' ? filteredRects[0].x : filteredRects[0].y,
					pageSize
				);
				highlight.page = getPageFromScroll(scroll, pageSize);
			}

			return highlights;
		});

		searchHighlightsStore.update((searchHighlights) => {
			for (const searchHighlight of searchHighlights) {
				const clientRects = searchHighlight.range.getClientRects();
				const readerNodeRect = readerNode.getBoundingClientRect();
				const rects = alignRectsToReaderPage(
					Array.from(clientRects),
					writingMode,
					readerNodeRect,
					pageSize,
					currentPage
				);
				const filteredRects: DOMRect[] = filterCompletelyOverlappingRectangles(rects);
				searchHighlight.rects = filteredRects;
			}

			return searchHighlights;
		});
	}

	function currentPageInBookmarks(page: number) {
		const pageBookmarks = [];
		for (const bookmark of bookmarks) {
			if (page === bookmark.page) {
				pageBookmarks.push(bookmark);
			}
		}
		return pageBookmarks;
	}

	function initializeBookmarkDataFromDB(bookmarks: BookmarkDB[]): Bookmark[] {
		return bookmarks.flatMap((bookmark) => {
			const element = readerNode.querySelector<HTMLElement>(bookmark.css_selector);
			if (!element) return [];

			return {
				id: bookmark.id,
				element,
				cssSelector: bookmark.css_selector,
				displayText: bookmark.display_text,
				dateAdded: bookmark.date_added
			};
		});
	}

	async function onBookmarkClick() {
		if (currentPageBookmarks.length === 0) {
			await bookmarkPage();
		} else {
			const removedBookmark = currentPageBookmarks.pop();
			if (removedBookmark) {
				const foundIndex = bookmarks.findIndex((b) => b.id === removedBookmark.id);
				if (foundIndex === -1) return;
				bookmarks.splice(foundIndex, 1);
				bookmarks = bookmarks;
				await removeBookmark(removedBookmark.id);
			}
		}
		currentPageBookmarks = currentPageBookmarks;
	}

	function onKeyDown(e: KeyboardEvent) {
		if ($readerStateStore !== 'reading') return;
		if (e.key === 'b') {
			onBookmarkClick();
		}
	}

	let bookmarkInProgress = false;
	async function bookmarkPage() {
		bookmarkInProgress = true;
		let bookmarkPage = currentPage;
		const foundElement = getFirstVisibleElementInParentElement(readerNode, writingMode);
		if (!foundElement) return;

		const selector = getSelector(foundElement);

		const bookmarkData = {
			id: crypto.randomUUID(),
			cssSelector: selector,
			dateAdded: Math.floor(Date.now() / 1000),
			displayText: 'Bookmark'
		};

		await addBookmark({
			book_id: data.book.id,
			css_selector: selector,
			date_added: bookmarkData.dateAdded,
			display_text: bookmarkData.displayText,
			id: bookmarkData.id
		});

		const inMemoryBookmark = {
			id: bookmarkData.id,
			cssSelector: selector,
			displayText: bookmarkData.displayText,
			element: foundElement,
			page: bookmarkPage,
			dateAdded: bookmarkData.dateAdded
		};
		bookmarks.push(inMemoryBookmark);
		bookmarks.sort((a, b) => (a.page ?? 0) - (b.page ?? 0));
		bookmarks = bookmarks;
		currentPageBookmarks.push(inMemoryBookmark);
		currentPageBookmarks = currentPageBookmarks;
		bookmarkInProgress = false;
	}

	function onSidebarItemClickWithPage(page: number) {
		goToPage(readerNode, page, pageSize);
		currentPage = page;
		drawerOpen.set(false);
	}

	function onBookmarkItemDelete(id: string) {
		const foundIndexCurrentPageBookmarks = currentPageBookmarks.findIndex((b) => b.id === id);
		if (foundIndexCurrentPageBookmarks !== -1) {
			currentPageBookmarks.splice(foundIndexCurrentPageBookmarks, 1);
			currentPageBookmarks = currentPageBookmarks;
		}

		const foundIndex = bookmarks.findIndex((b) => b.id === id);
		bookmarks.splice(foundIndex, 1);
		bookmarks = bookmarks;

		removeBookmark(id);
	}

	async function onPageResize() {
		await tick();
		updateHighlightRectsAndPages();
		calculateTocPageNumbers(readerNode, writingMode, pageSize, tocData);
		tocData = tocData;
		calculateBookmarkPageNumbers(bookmarks, writingMode, pageSize);
		bookmarks = bookmarks;
		currentPageBookmarks = currentPageInBookmarks(currentPage);
	}

	onMount(async () => {
		clearEpubStyles();
		const epubData = await loadEpub(data.book.path);
		html = epubData.newHtml;
		blobUrls = epubData.blobUrls;
		tocData = epubData.tocNavs;

		loading = false;
		await tick();
		bookmarks = initializeBookmarkDataFromDB(data.book.bookmarks);
		highlightsStore.set(initializeHighlightDataFromDB(data.book.highlights));
		calculateBookmarkPageNumbers(bookmarks, writingMode, pageSize);
		bookmarks.sort((a, b) => (a.page ?? 0) - (b.page ?? 0));
		bookmarks = bookmarks;
		calculateTocPageNumbers(readerNode, writingMode, pageSize, tocData);
		if (tocData.length > 0) {
			if (tocData[0].page !== 1) {
				tocData = [
					{ content: 'epub://text-epub-start', label: 'Start', page: 1, children: [] },
					...tocData
				];
			}
		}
		tocData = tocData;
		currentPageBookmarks = currentPageInBookmarks(currentPage);
	});

	onDestroy(() => {
		for (const url of blobUrls) {
			URL.revokeObjectURL(url);
		}
		clearEpubStyles();
	});
</script>

<svelte:document on:keydown={onKeyDown} />

<div class="px-12 py-8 mx-auto duration-150 flex flex-col">
	{#if loading}
		<p>Loading...</p>
	{:else}
		<div class="relative mt-4">
			<div
				class="absolute -top-8 w-full gap-6 left-0 text-gray-500 flex justify-between items-center"
			>
				<div class="flex gap-1 items-center">
					<Drawer
						{currentPage}
						{tocData}
						{drawerOpen}
						{bookmarks}
						{columnCount}
						{onSidebarItemClickWithPage}
						{onBookmarkItemDelete}
					/>
				</div>
				<div>
					<p class="line-clamp-1">
						{data.book.title}
					</p>
				</div>
				<div class="flex gap-1 items-center">
					<IconLetterCase />
					<Search {readerNode} {currentPage} orientation={writingMode} {pageSize} />
					<button
						class="relative"
						disabled={bookmarkInProgress}
						on:click={onBookmarkClick}
						aria-label="Bookmark page"
					>
						{#if currentPageBookmarks.length > 0}
							<IconBookmarkFilled class="text-pink-500" />
							{#if currentPageBookmarks.length > 1}
								<span class="absolute top-2 left-5 text-sm text-black"
									>{currentPageBookmarks.length}</span
								>
							{/if}
						{:else}
							<IconBookmark />
						{/if}
					</button>
				</div>
			</div>
			<Reader
				on:pageresize={onPageResize}
				bind:html
				bind:columnCount
				bind:fontSize
				bind:writingMode
				bind:readerNode
				bind:readerHeight
				bind:readerWidth
				bind:columnGap
				bind:currentPage
				bind:totalPages
				bind:pageSize
				{drawerOpen}
			/>
			<div
				class="absolute bottom-0 w-full flex -z-50
				{columnCount === 1 ? 'justify-center' : 'justify-around'}"
			>
				{#if columnCount === 1}
					<p class="text-gray-500">
						{currentPage} of {totalPages}
					</p>
				{:else}
					<p class="text-gray-500">
						{currentPage * 2 - 1} of {totalPages * 2}
					</p>
					<p class="text-gray-500">
						{currentPage * 2} of {totalPages * 2}
					</p>
				{/if}
			</div>
			<div class="text-gray-500 absolute bottom-0 w-full flex justify-end -z-50">
				<p>
					{currentPage !== totalPages ? (((currentPage - 1) / totalPages) * 100).toFixed(0) : 100}%
				</p>
			</div>
		</div>
	{/if}
</div>
