<script lang="ts">
	import { tick } from 'svelte';
	import Highlight from './Highlight.svelte';
	import { createDialog, melt } from '@melt-ui/svelte';
	import { IconSearch, IconCopy } from '@tabler/icons-svelte';
	import { highlightsStore } from '$lib/components/reader/stores/highlightsStore';
	import { get } from 'svelte/store';
	import { readerStateStore } from '../reader/stores/readerStateStore';
	import { fly } from 'svelte/transition';
	import {
		getPageFromScroll,
		getScrollAlignedToPageFloor,
		getSelector,
		type Orientation
	} from '$lib/components/reader/utils';
	import { addHighlight } from '$lib/bindings';
	import { page } from '$app/stores';
	import { filterCompletelyOverlappingRectangles } from './utils';

	export let currentPage: number;
	export let pageSize: number;
	export let readerNode: HTMLDivElement;
	export let orientation: Orientation;

	$: book_id = $page.params.id;

	$: if ($open) {
		readerStateStore.set('noteOpen');
	} else {
		readerStateStore.set('reading');
	}

	const {
		elements: { content, portalled },
		states: { open }
	} = createDialog({
		forceVisible: true
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
			if (left + overlayOptions.offsetWidth > window.innerWidth) {
				left = left - overlayOptions.offsetWidth;
				if (left < 0) {
					overlayOptions.style.left = `${window.innerWidth - overlayOptions.offsetWidth}px`;
				} else {
					overlayOptions.style.left = `${left}px`;
				}
			} else {
				overlayOptions.style.left = `${left}px`;
			}
			if (top + overlayOptions.offsetHeight > window.innerHeight) {
				top = top - overlayOptions.offsetHeight;
				if (top < 0) {
					overlayOptions.style.top = `${window.innerHeight - overlayOptions.offsetHeight}px`;
				} else {
					overlayOptions.style.top = `${top}px`;
				}
			} else {
				overlayOptions.style.top = `${top}px`;
			}

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
		for (const r of clientRects) {
			r.x += pageSize * (currentPage - 1) - readerNodeRect.x;
			r.y += -readerNodeRect.y;
		}
		const rects = Array.from(clientRects);

		const filteredRects: DOMRect[] = filterCompletelyOverlappingRectangles(rects);

		const newHighlightId = crypto.randomUUID();
		const dateAdded = Math.floor(Date.now() / 1000);

		const scroll = getScrollAlignedToPageFloor(
			orientation === 'horizontal' ? filteredRects[0].x : filteredRects[0].y,
			pageSize
		);
		highlightsStore.update((highlights) => {
			highlights.push({
				id: newHighlightId,
				dateAdded: dateAdded,
				page: getPageFromScroll(scroll, pageSize),
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
			class="fixed left-[50%] top-[50%] z-50 rounded-xl p-2 shadow-lg bg-gray-100"
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
					<button aria-label="Search text"><IconSearch /></button>
				</div>
				<!-- svelte-ignore a11y-no-static-element-interactions -->
				<!-- svelte-ignore a11y-click-events-have-key-events -->
				<div on:click={onHighlightButtonClick} class="flex gap-1">
					<button data-color="#ff000020" class="h-6 w-6 rounded-full bg-red-500" />
					<button data-color="#ffff0020" class="h-6 w-6 rounded-full bg-yellow-500" />
					<button data-color="#0000ff20" class="h-6 w-6 rounded-full bg-blue-400" />
					<button data-color="#00ff0020" class="h-6 w-6 rounded-full bg-green-500" />
				</div>
			</div>
		</div>
	{/if}
</div>

<svg
	class="fixed ml-12 z-10 pointer-events-none"
	style="left: -{(currentPage - 1) *
		pageSize}px; height: {readerNode?.scrollHeight}px; width: {readerNode?.scrollWidth}px"
>
	{#each $highlightsStore as highlight (highlight.id)}
		<Highlight {highlight} />
	{/each}
</svg>
