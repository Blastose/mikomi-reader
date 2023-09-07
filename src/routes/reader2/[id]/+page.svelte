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
		getSelector,
		goToPage
	} from '$lib/components/reader/utils.js';
	import {
		IconBookmark,
		IconBookmarkFilled,
		IconSearch,
		IconLetterCase
	} from '@tabler/icons-svelte';
	import Drawer from '$lib/components/reader/Drawer.svelte';
	import type { NavPoint } from '$lib/components/reader/toc/tocParser';
	import { writable } from 'svelte/store';
	import type { Bookmark } from '$lib/components/reader/utils.js';
	import { addBookmark, removeBookmark } from '$lib/bindings.js';
	import type { Bookmark as BookmarkDB } from '$lib/bindings.js';

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

	function currentPageInBookmarks(page: number) {
		const pageBookmarks = [];
		for (const bookmark of bookmarks) {
			if (page === bookmark.page) {
				pageBookmarks.push(bookmark);
			}
		}
		return pageBookmarks;
	}

	function intializeBookmarkDataFromDB(bookmarks: BookmarkDB[]): Bookmark[] {
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
				const i = bookmarks.findIndex((b) => b.id === removedBookmark.id);
				bookmarks.splice(i, 1);
				bookmarks = bookmarks;
				await removeBookmark(removedBookmark.id);
			}
		}
		currentPageBookmarks = currentPageBookmarks;
	}

	async function bookmarkPage() {
		const foundElement = getFirstVisibleElementInParentElement(readerNode);
		if (!foundElement) return;

		console.log(foundElement);
		const selector = getSelector(foundElement);
		console.log(selector);

		const pageTextHint = foundElement.textContent?.trim().slice(0, 50);
		console.log(pageTextHint);

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
			page: currentPage,
			dateAdded: bookmarkData.dateAdded
		};
		bookmarks.push(inMemoryBookmark);
		bookmarks.sort((a, b) => (a.page ?? 0) - (b.page ?? 0));
		bookmarks = bookmarks;
		currentPageBookmarks.push(inMemoryBookmark);
		currentPageBookmarks = currentPageBookmarks;
	}

	function onBookmarkItemClick(page: number) {
		goToPage(readerNode, page, pageSize);
		currentPage = page;
		drawerOpen.set(false);
	}

	async function onPageResize() {
		await tick();
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
		bookmarks = intializeBookmarkDataFromDB(data.book.bookmarks);
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

<div class="px-12 py-8 mx-auto duration-150 flex flex-col">
	{#if loading}
		<p>Loading...</p>
	{:else}
		<div class="relative mt-4">
			<div
				class="absolute -top-8 w-full gap-6 left-0 text-gray-500 flex justify-between items-center"
			>
				<div class="flex gap-1 items-center">
					<Drawer {currentPage} {tocData} {drawerOpen} {bookmarks} {onBookmarkItemClick} />
				</div>
				<div>
					<p class="line-clamp-1">
						{data.book.title}
					</p>
				</div>
				<div class="flex gap-1 items-center">
					<IconLetterCase />
					<IconSearch />
					<button class="relative" on:click={onBookmarkClick} aria-label="Bookmark page">
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
