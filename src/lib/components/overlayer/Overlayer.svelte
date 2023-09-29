<script lang="ts">
	import { tick } from 'svelte';
	import Highlight from './Highlight.svelte';
	import { createDialog, melt, type CreateDialogProps } from '@melt-ui/svelte';
	import { IconSearch, IconCopy } from '@tabler/icons-svelte';
	import { highlightsStore } from '$lib/components/reader/stores/highlightsStore';
	import { get } from 'svelte/store';
	import { readerStateStore } from '../reader/stores/readerStateStore';
	import { fly } from 'svelte/transition';
	import {
		getPageFromScroll,
		getScrollAlignedToPageFloor,
		getSelector,
		getTocChapterFromPage,
		type Orientation
	} from '$lib/components/reader/utils';
	import { addHighlight } from '$lib/bindings';
	import { page } from '$app/stores';
	import {
		alignRectsToReaderPage,
		filterCompletelyOverlappingRectangles,
		setLeftTopOnScreen
	} from './utils';
	import { colorButtons } from './utils';
	import {
		searchHighlightsStore,
		searchModalOpenStore,
		searchModalTermStore,
		searchStateStore
	} from '$lib/components/reader/search/search';
	import type { NavPoint } from '$lib/components/reader/toc/tocParser';
	import { flatTocStore } from '$lib/components/reader/stores/tocStore';

	export let currentPage: number;
	export let pageSize: number;
	export let readerNode: HTMLDivElement;
	export let orientation: Orientation;

	$: book_id = $page.params.id;

	const handleOpen: CreateDialogProps['onOpenChange'] = ({ curr, next }) => {
		if (next === true) {
			readerStateStore.set('noteOpen');
		} else {
			readerStateStore.set('reading');
		}
		return next;
	};

	const {
		elements: { content, portalled },
		states: { open }
	} = createDialog({
		forceVisible: true,
		onOpenChange: handleOpen,
		preventScroll: false
	});

	let selectionState: 'noneSelected' | 'selectedText' = 'noneSelected';
	function onSelect() {
		if (window.getSelection()?.toString()) {
			selectionState = 'selectedText';
		} else {
			selectionState = 'noneSelected';
		}
	}

	async function onMouseUp(e: MouseEvent) {
		if ($readerStateStore !== 'reading') return;

		if (selectionState === 'selectedText') {
			const selection = window.getSelection();
			const range = selection?.getRangeAt(0);
			if (!range) return;
			if (!/\S/.test(range.toString())) return;
			if (!readerNode.contains(range.startContainer) || !readerNode.contains(range.endContainer)) {
				return;
			}

			open.set(true);
			await tick();

			let left = e.x;
			let top = e.y;
			setLeftTopOnScreen(overlayOptions, left, top);
			selectionState = 'noneSelected';
		}
	}

	function onHighlightButtonClick(e: MouseEvent) {
		const target = e.target as HTMLElement;
		const buttonNode = target.closest('button');
		console.log(buttonNode);
		if (!buttonNode) return;

		const color = buttonNode.dataset.color as string;
		const range = window.getSelection()?.getRangeAt(0);
		console.log(range);
		if (!range) return;

		const readerNodeRect = readerNode.getBoundingClientRect();
		const clientRects = range.getClientRects();
		const rects = alignRectsToReaderPage(
			Array.from(clientRects),
			orientation,
			readerNodeRect,
			pageSize,
			currentPage
		);

		const filteredRects: DOMRect[] = filterCompletelyOverlappingRectangles(rects);

		const newHighlightId = crypto.randomUUID();
		const dateAdded = Math.floor(Date.now() / 1000);

		const scroll = getScrollAlignedToPageFloor(
			orientation === 'horizontal' ? filteredRects[0].x : filteredRects[0].y,
			pageSize
		);
		const page = getPageFromScroll(scroll, pageSize);
		highlightsStore.update((highlights) => {
			highlights.push({
				id: newHighlightId,
				dateAdded: dateAdded,
				page,
				chapter: getTocChapterFromPage(page, $flatTocStore, $flatTocStore[0].label),
				displayText: range.toString(),
				note: '',
				range,
				color,
				rects: filteredRects
			});
			return highlights;
		});
		console.log(get(highlightsStore));

		addHighlight({
			id: newHighlightId,
			book_id,
			color,
			date_added: dateAdded,
			start_container: getSelector(range.startContainer as Element | Text),
			start_offset: range.startOffset,
			end_container: getSelector(range.endContainer as Element | Text),
			end_offset: range.endOffset,
			note: ''
		});

		window.getSelection()?.empty();
		open.set(false);
	}

	function copyText() {
		const text = window.getSelection()?.toString() ?? '';
		navigator.clipboard.writeText(text);
		window.getSelection()?.empty();
		open.set(false);
	}

	let overlayOptions: HTMLDivElement;
	export let overlayContainer: HTMLDivElement;

	$: {
		if (overlayContainer) {
			overlayContainer.scrollLeft = (currentPage - 1) * pageSize;
			overlayContainer.scrollTop = (currentPage - 1) * pageSize;
		}
	}

	function searchText() {
		searchModalOpenStore.set(true);
		searchModalTermStore.set(window.getSelection()?.toString() ?? '');
		searchHighlightsStore.set({ highlights: [], showHighlights: false });
		searchStateStore.set('blank');
		window.getSelection()?.empty();
		open.set(false);
		readerStateStore.set('searchOpen');
	}
</script>

<svelte:document on:mouseup={onMouseUp} on:selectionchange={onSelect} />

<div use:melt={$portalled}>
	{#if $open}
		<!-- svelte-ignore a11y-no-static-element-interactions -->
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<div
			on:mousedown={(e) => {
				e.preventDefault();
			}}
			bind:this={overlayOptions}
			class="dialog-theme fixed left-[50%] top-[50%] z-50 rounded-xl p-2 shadow-lg"
			use:melt={$content}
			transition:fly={{
				duration: 150,
				y: -10,
				opacity: 0
			}}
		>
			<div class="flex flex-col gap-2">
				<div class="flex justify-around gap-1">
					<button on:click={copyText} aria-label="Copy text"><IconCopy /></button>
					<button on:click={searchText} aria-label="Search text"><IconSearch /></button>
				</div>
				<!-- svelte-ignore a11y-no-static-element-interactions -->
				<!-- svelte-ignore a11y-click-events-have-key-events -->
				<div on:click={onHighlightButtonClick} class="flex gap-1">
					{#each colorButtons as colorButton}
						<button
							style="background-color: {colorButton.displayColor};"
							class="h-6 w-6 rounded-full"
							data-color={colorButton.color}
							aria-label="Highlight text as {colorButton.color}"
						/>
					{/each}
				</div>
			</div>
		</div>
	{/if}
</div>

<div
	bind:this={overlayContainer}
	class="fixed z-10 overflow-hidden pointer-events-none"
	style=" 
		height: {readerNode?.clientHeight}px; 
		width: {readerNode?.clientWidth}px;"
>
	<svg
		class="pointer-events-none"
		style=" 
			height: {readerNode?.scrollHeight}px; 
			width: {readerNode?.scrollWidth}px;"
	>
		{#each $highlightsStore as highlight (highlight.id)}
			<Highlight {highlight} />
		{/each}

		{#if $searchHighlightsStore.showHighlights}
			{#each $searchHighlightsStore.highlights as searchHighlight}
				<g role="button" fill="#0072ff33">
					{#each searchHighlight.rects as rect}
						<rect x={rect.left} y={rect.top} height={rect.height} width={rect.width} />
					{/each}
				</g>
			{/each}
		{/if}
	</svg>
</div>
