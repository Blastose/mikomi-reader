<script lang="ts">
	import { createDialog, melt } from '@melt-ui/svelte';
	import { IconSearch, IconX } from '@tabler/icons-svelte';
	import { readerStateStore } from '$lib/components/reader/stores/readerStateStore';
	import { fly } from 'svelte/transition';
	import { searchBook, searchHighlightsStore, type SearchBookResult } from './search';
	import {
		alignRectsToReaderPage,
		filterCompletelyOverlappingRectangles
	} from '$lib/components/overlayer/utils';
	import type { Orientation } from '../utils';

	export let readerNode: HTMLDivElement;
	export let pageSize: number;
	export let currentPage: number;
	export let orientation: Orientation;
	let searchTerm: string;
	let searchResults: SearchBookResult[] = [];

	let searchState: 'blank' | 'searched' = 'blank';

	$: if ($open) {
		readerStateStore.set('searchOpen');
	} else {
		readerStateStore.set('reading');
		searchHighlightsStore.set([]);
	}

	const {
		elements: { trigger, content, title, close, portalled },
		states: { open }
	} = createDialog({
		forceVisible: true
	});

	function dragging(draggableNode: HTMLElement) {
		let isDragging = false;
		let offsetX: number;

		function onPointerDown(e: PointerEvent) {
			isDragging = true;
			offsetX = e.clientX - searchDialog.getBoundingClientRect().left;
			draggableNode.style.cursor = 'grabbing';

			window.addEventListener('pointermove', onPointerMove);
			window.addEventListener('pointerup', onPointerUp);
		}

		function onPointerMove(e: PointerEvent) {
			if (!isDragging) return;

			const newLeft = e.clientX - offsetX;
			searchDialog.style.left = `${newLeft}px`;
		}

		function onPointerUp(_e: PointerEvent) {
			isDragging = false;
			draggableNode.style.cursor = 'grab';

			let nodeLeft = parseInt(searchDialog.style.left);
			searchDialog.style.left = `${nodeLeft}px`;

			window.removeEventListener('pointermove', onPointerMove);
			window.removeEventListener('pointerup', onPointerUp);
		}

		draggableNode.addEventListener('pointerdown', onPointerDown);

		return {
			destroy() {
				draggableNode.removeEventListener('pointerdown', onPointerDown);
			}
		};
	}

	function onInputKeyDown(e: KeyboardEvent & { currentTarget: EventTarget & HTMLInputElement }) {
		if (e.key === 'Enter') {
			e.preventDefault();
			searchResults = searchBook(readerNode, searchTerm);
			searchState = 'searched';

			const searchHighlights: { rects: DOMRect[]; range: Range }[] = [];
			for (const res of searchResults) {
				const readerNodeRect = readerNode.getBoundingClientRect();
				const clientRects = res.range.getClientRects();
				const rects = alignRectsToReaderPage(
					Array.from(clientRects),
					orientation,
					readerNodeRect,
					pageSize,
					currentPage
				);

				const filteredRects: DOMRect[] = filterCompletelyOverlappingRectangles(rects);
				searchHighlights.push({ rects: filteredRects, range: res.range });
			}
			searchHighlightsStore.set(searchHighlights);
		}
	}

	let searchDialog: HTMLDivElement;
</script>

<div use:melt={$portalled}>
	{#if $open}
		<div
			id="search-"
			bind:this={searchDialog}
			class="fixed z-50 top-12 p-6 w-[66vw] sm:w-[50vw] max-w-xl h-[calc(90vh_-_3rem)] right-6 rounded-xl shadow-2xl bg-white"
			use:melt={$content}
			transition:fly={{
				duration: 200,
				y: -10,
				opacity: 0
			}}
		>
			<div class="flex flex-col gap-2 h-full">
				<div class="flex flex-col gap-2">
					<h2
						use:dragging
						use:melt={$title}
						class="select-none cursor-grab m-0 text-lg font-medium"
					>
						Search
					</h2>
					<input
						bind:value={searchTerm}
						on:keydown={onInputKeyDown}
						class="p-2"
						type="text"
						placeholder="Search in this book"
					/>
					{#if searchResults.length > 0 && searchState === 'searched'}
						<p class="text-gray-500">{searchResults.length} results in book</p>
					{:else if searchResults.length === 0 && searchState === 'searched'}
						<p class="text-gray-500">0 results in book</p>
					{/if}
				</div>

				{#if searchResults.length > 0}
					<div class="flex flex-col gap-2 grow overflow-y-auto">
						<div class="flex flex-col gap-2">
							{#each searchResults as searchResult, index}
								<div>
									<p>{@html searchResult.highlightedText}</p>
								</div>
								{#if index !== searchResults.length - 1}
									<hr />
								{/if}
							{/each}
						</div>
					</div>
				{/if}
			</div>
			<button
				use:melt={$close}
				aria-label="close"
				class="absolute right-4 top-4 inline-flex h-6 w-6
                items-center justify-center rounded-full p-1 text-gray-800
                hover:bg-gray-100 focus:shadow-gray-400"
			>
				<IconX />
			</button>
		</div>
	{/if}
</div>

<button use:melt={$trigger} aria-label="Search book">
	<IconSearch />
</button>
