<script lang="ts">
	import Reader from '$lib/components/reader/Reader.svelte';
	import { onDestroy, onMount, tick } from 'svelte';
	import { loadEpub } from '$lib/components/reader/loadEpub.js';
	import {
		calculateBookmarkChapterPositions,
		calculateBookmarkPageNumbers,
		calculateTocPageNumbers,
		clearEpubStyles,
		getFirstVisibleElementInParentElement,
		getNodeBySelector,
		getPageFromElement,
		getPageFromScroll,
		getScrollAlignedToPageFloor,
		getSelector,
		getTocChapterFromPage,
		goToPage
	} from '$lib/components/reader/utils.js';
	import { IconBookmark, IconBookmarkFilled } from '@tabler/icons-svelte';
	import Drawer from '$lib/components/reader/sidebar/Drawer.svelte';
	import { writable } from 'svelte/store';
	import type { Bookmark, Orientation } from '$lib/components/reader/utils.js';
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
	import Settings from '$lib/components/reader/settings/Settings.svelte';
	import {
		addBookSettingsFromSettingsAndTheme,
		readerSettingsStore
	} from '$lib/components/reader/stores/readerSettingsStore.js';
	import { readerThemeStore } from '$lib/components/reader/stores/readerSettingsStore.js';
	import { page } from '$app/stores';
	import { appWindow } from '@tauri-apps/api/window';
	import { tocStore, flatTocStore } from '$lib/components/reader/stores/tocStore.js';

	appWindow.onCloseRequested(async () => {
		if (!readerNode) return;
		const el = getFirstVisibleElementInParentElement(readerNode, $readerSettingsStore.writingMode);
		let selector: string | null = null;
		if (el) {
			selector = getSelector(el);
		}

		await addBookSettingsFromSettingsAndTheme(
			$page.params.id,
			window.innerHeight ?? 860,
			window.innerWidth ?? 512,
			$readerSettingsStore,
			$readerThemeStore,
			currentPage !== totalPages
				? parseInt((((currentPage - 1) / totalPages) * 100).toFixed(0))
				: 100,
			selector ?? undefined
		);
	});

	export let data;

	let html: string;
	let loading = true;

	let readerNode: HTMLDivElement;
	let overlayContainer: HTMLDivElement;
	let readerHeight: number;
	let readerWidth: number;
	let columnGap = 24;
	let currentPage: number = 1;
	let totalPages: number;
	let pageSize: number;
	let currentScroll: number;

	let onColumnCountChange: (newColumnCount: 1 | 2) => Promise<void>;
	let onWritingModeChange: (newWritingMode: Orientation) => Promise<void>;

	let blobUrls: string[] = [];

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
				$readerSettingsStore.writingMode,
				readerNodeRect,
				pageSize,
				currentPage
			);
			const filteredRects: DOMRect[] = filterCompletelyOverlappingRectangles(rects);

			const scroll = getScrollAlignedToPageFloor(
				$readerSettingsStore.writingMode === 'horizontal' ? filteredRects[0].x : filteredRects[0].y,
				pageSize
			);
			const page = getPageFromScroll(scroll, pageSize);
			return {
				id: highlight.id,
				note: highlight.note,
				dateAdded: highlight.date_added,
				displayText: range.toString(),
				page,
				chapter: getTocChapterFromPage(page, $flatTocStore, $flatTocStore[0].label),
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
					$readerSettingsStore.writingMode,
					readerNodeRect,
					pageSize,
					currentPage
				);
				const filteredRects: DOMRect[] = filterCompletelyOverlappingRectangles(rects);
				highlight.rects = filteredRects;
				const scroll = getScrollAlignedToPageFloor(
					$readerSettingsStore.writingMode === 'horizontal'
						? filteredRects[0].x
						: filteredRects[0].y,
					pageSize
				);
				highlight.page = getPageFromScroll(scroll, pageSize);
			}

			return highlights;
		});

		searchHighlightsStore.update((searchHighlights) => {
			for (const searchHighlight of searchHighlights.highlights) {
				const clientRects = searchHighlight.range.getClientRects();
				const readerNodeRect = readerNode.getBoundingClientRect();
				const rects = alignRectsToReaderPage(
					Array.from(clientRects),
					$readerSettingsStore.writingMode,
					readerNodeRect,
					pageSize,
					currentPage
				);
				const filteredRects: DOMRect[] = filterCompletelyOverlappingRectangles(rects);
				const scroll = getScrollAlignedToPageFloor(
					$readerSettingsStore.writingMode === 'horizontal'
						? filteredRects[0].x
						: filteredRects[0].y,
					pageSize
				);
				searchHighlight.page = getPageFromScroll(scroll, pageSize);
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
		const foundElement = getFirstVisibleElementInParentElement(
			readerNode,
			$readerSettingsStore.writingMode
		);
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

		const inMemoryBookmark: Bookmark = {
			id: bookmarkData.id,
			cssSelector: selector,
			displayText: bookmarkData.displayText,
			element: foundElement,
			page: bookmarkPage,
			dateAdded: bookmarkData.dateAdded,
			chapter: getTocChapterFromPage(bookmarkPage, $flatTocStore, $flatTocStore[0].label)
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
		currentScroll =
			$readerSettingsStore.writingMode === 'horizontal'
				? readerNode.scrollLeft
				: readerNode.scrollTop;
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
		calculateTocPageNumbers(readerNode, $readerSettingsStore.writingMode, pageSize, $flatTocStore);
		$tocStore = $tocStore;
		calculateBookmarkPageNumbers(bookmarks, $readerSettingsStore.writingMode, pageSize);
		calculateBookmarkChapterPositions(bookmarks, $flatTocStore);
		updateHighlightRectsAndPages();
		bookmarks = bookmarks;
		currentPageBookmarks = currentPageInBookmarks(currentPage);

		overlayContainer.scrollLeft = readerNode.scrollLeft;
		overlayContainer.scrollTop = readerNode.scrollTop;

		await addBookSettingsFromSettingsAndTheme(
			$page.params.id,
			window.innerHeight ?? 860,
			window.innerWidth ?? 512,
			$readerSettingsStore,
			$readerThemeStore
		);
	}

	function updateCurrentPage(newPage?: number) {
		if (newPage) {
			currentPage = newPage;
		} else {
			if ($readerSettingsStore.writingMode === 'horizontal') {
				currentPage = getPageFromScroll(readerNode?.scrollLeft, pageSize);
			} else {
				currentPage = getPageFromScroll(readerNode?.scrollTop, pageSize);
			}
		}
	}

	function updateTotalPages() {
		if ($readerSettingsStore.writingMode === 'horizontal') {
			totalPages = getPageFromScroll(readerNode?.scrollWidth, pageSize) - 1;
		} else {
			totalPages = getPageFromScroll(readerNode?.scrollHeight, pageSize) - 1;
		}
	}

	function delay(ms: number) {
		return new Promise((res) => setTimeout(res, ms));
	}

	onMount(async () => {
		clearEpubStyles();
		let t1 = performance.now();
		const epubData = await loadEpub(data.book.path);
		let t2 = performance.now();
		console.log(`${(t2 - t1) / 1000} seconds`);
		html = epubData.newHtml;
		blobUrls = epubData.blobUrls;
		$tocStore = epubData.tocNavs;

		loading = false;
		t1 = performance.now();
		await tick();

		// jump to the last element from settings
		if (data.book.settings?.last_element) {
			const selector = getNodeBySelector(data.book.settings.last_element);
			if (selector) {
				const page = getPageFromElement(
					selector as HTMLElement,
					$readerSettingsStore.writingMode,
					pageSize
				);
				goToPage(readerNode, page, pageSize);
				currentScroll =
					$readerSettingsStore.writingMode === 'horizontal'
						? readerNode.scrollLeft
						: readerNode.scrollTop;
			}
		}

		// Needs a delay for the total page sizes to be correct;
		// Not 100% sure why; probably because of images loading
		await delay(100);
		updateCurrentPage();
		updateTotalPages();

		calculateTocPageNumbers(readerNode, $readerSettingsStore.writingMode, pageSize, $flatTocStore);
		if ($tocStore.length > 0) {
			if ($tocStore[0].page !== 1) {
				$tocStore = [
					{ content: 'epub://text-epub-start', label: 'Start', page: 1, children: [] },
					...$tocStore
				];
			}
		}
		$tocStore = $tocStore;

		bookmarks = initializeBookmarkDataFromDB(data.book.bookmarks);
		calculateBookmarkPageNumbers(bookmarks, $readerSettingsStore.writingMode, pageSize);
		bookmarks.sort((a, b) => (a.page ?? 0) - (b.page ?? 0));
		bookmarks = bookmarks;
		calculateBookmarkChapterPositions(bookmarks, $flatTocStore);
		currentPageBookmarks = currentPageInBookmarks(currentPage);

		// TODO make highlight.chapter from offesetLeft/offesetHeight instead of page number
		highlightsStore.set(initializeHighlightDataFromDB(data.book.highlights));

		t2 = performance.now();
		console.log(`${(t2 - t1) / 1000} seconds`);
	});

	onDestroy(() => {
		for (const url of blobUrls) {
			URL.revokeObjectURL(url);
		}
		clearEpubStyles();
	});

	$: {
		document.body.style.setProperty('--background-color', $readerThemeStore.backgroundColor);
		document.body.style.setProperty('--color', $readerThemeStore.color);
		document.body.style.setProperty('--link-color', $readerThemeStore.linkColor);
		document.body.style.setProperty('--mix-blend-mode', $readerThemeStore.imageMixBlendMode);
		document.body.style.setProperty('--primary-color', $readerThemeStore.primaryColor);
	}
</script>

<svelte:document on:keydown={onKeyDown} />

<div class="px-12 py-8 mx-auto duration-150 flex flex-col">
	{#if loading}
		<p>Loading...</p>
	{:else}
		<div class="relative mt-4">
			<div class="absolute -top-8 w-full gap-6 left-0 grid grid-cols-[1fr_auto_1fr] items-center">
				<div class="flex gap-1 items-center">
					<Drawer
						{currentPage}
						tocData={$tocStore}
						{drawerOpen}
						{bookmarks}
						columnCount={$readerSettingsStore.columnCount}
						{onSidebarItemClickWithPage}
						{onBookmarkItemDelete}
					/>
				</div>
				<div>
					<p class="line-clamp-1">
						{data.book.title}
					</p>
				</div>
				<div class="flex gap-1 items-center justify-end">
					<Settings
						on:pageresize={onPageResize}
						bind:fontSize={$readerSettingsStore.fontSize}
						bind:lineHeight={$readerSettingsStore.lineHeight}
						bind:textAlign={$readerSettingsStore.textAlign}
						bind:columnCount={$readerSettingsStore.columnCount}
						bind:fontFamily={$readerSettingsStore.fontFamily}
						bind:writingMode={$readerSettingsStore.writingMode}
						bind:margins={$readerSettingsStore.margins}
						{onColumnCountChange}
						{onWritingModeChange}
						{updateCurrentPage}
						{updateTotalPages}
					/>
					<Search
						{readerNode}
						{currentPage}
						orientation={$readerSettingsStore.writingMode}
						{pageSize}
						columnCount={$readerSettingsStore.columnCount}
						{onSidebarItemClickWithPage}
					/>
					<button
						class="relative"
						disabled={bookmarkInProgress}
						on:click={onBookmarkClick}
						aria-label="Bookmark page"
					>
						{#if currentPageBookmarks.length > 0}
							<IconBookmarkFilled class="primary-color-fill" />
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
				bind:overlayContainer
				bind:columnCount={$readerSettingsStore.columnCount}
				bind:fontSize={$readerSettingsStore.fontSize}
				bind:writingMode={$readerSettingsStore.writingMode}
				bind:readerNode
				bind:readerHeight
				bind:readerWidth
				bind:columnGap
				bind:currentPage
				bind:currentScroll
				bind:totalPages
				bind:pageSize
				bind:lineHeight={$readerSettingsStore.lineHeight}
				bind:textAlign={$readerSettingsStore.textAlign}
				bind:fontFamily={$readerSettingsStore.fontFamily}
				bind:margins={$readerSettingsStore.margins}
				bind:onColumnCountChange
				bind:onWritingModeChange
				{drawerOpen}
			/>
			{#if currentPage && totalPages}
				<div
					class="absolute bottom-0 w-full flex -z-50
				{$readerSettingsStore.columnCount === 1 ? 'justify-center' : 'justify-around'}"
				>
					{#if $readerSettingsStore.columnCount === 1 || $readerSettingsStore.writingMode === 'vertical'}
						<p class="">
							{currentPage} of {totalPages}
						</p>
					{:else if $readerSettingsStore.columnCount === 2 && $readerSettingsStore.writingMode === 'horizontal'}
						<p class="">
							{currentPage * 2 - 1} of {totalPages * 2}
						</p>
						<p class="">
							{currentPage * 2} of {totalPages * 2}
						</p>
					{/if}
				</div>
				<div class=" absolute bottom-0 w-full flex justify-end -z-50">
					<p>
						{currentPage !== totalPages
							? (((currentPage - 1) / totalPages) * 100).toFixed(0)
							: 100}%
					</p>
				</div>
			{/if}
		</div>
	{/if}
</div>

<style>
	:global(body) {
		overflow: hidden;
		background-color: var(--background-color);
		color: var(--color);
	}

	button > :global(svg.primary-color-fill) {
		color: var(--primary-color);
	}
</style>
