<script lang="ts">
	import { tick } from 'svelte';
	import Highlight from './Highlight.svelte';
	import { createDialog, melt } from '@melt-ui/svelte';
	import { IconSearch, IconCopy } from '@tabler/icons-svelte';
	import { highlightsStore } from '$lib/components/reader/stores/highlightsStore';
	import { get } from 'svelte/store';
	import { readerStateStore } from '../reader/stores/readerStateStore';
	import { fly } from 'svelte/transition';

	export let currentPage: number;
	export let pageSize: number;
	export let readerNode: HTMLDivElement;

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

	async function onMouseUp() {
		if (selectionState === 'selectedText') {
			const selection = window.getSelection();
			const range = selection?.getRangeAt(0);
			if (!range) return;
			const rangeRect = range.getBoundingClientRect();

			open.set(true);
			await tick();

			let left = rangeRect.left + rangeRect.width / 2;
			let top = rangeRect.top;
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
		const rects2 = range.getClientRects();
		for (const r of rects2) {
			r.x += pageSize * (currentPage - 1) - readerNodeRect.x;
			r.y += -readerNodeRect.y;
		}
		const rects = Array.from(rects2);

		// Filter out rects that are within another rectangle
		const filteredRects: DOMRect[] = [];
		// Keep skip over rects we have marked as overlapping
		// TODO Not the most efficient way, since we iterate over the array
		// multiple times
		const overlappingIndices: number[] = [];
		for (let i = 0; i < rects.length; i++) {
			let isOverlapping = false;
			for (let j = 0; j < rects.length; j++) {
				if (i === j) continue;
				if (overlappingIndices.includes(i)) continue;
				if (overlappingIndices.includes(j)) continue;
				const rect1 = rects[i];
				const rect2 = rects[j];

				if (
					rect1.x <= rect2.x &&
					rect1.y <= rect2.y &&
					rect1.x + rect1.width >= rect2.x + rect2.width &&
					rect1.y + rect1.height >= rect2.y + rect2.height
				) {
					isOverlapping = true;
					overlappingIndices.push(i);
					break;
				}
			}
			if (!isOverlapping) {
				filteredRects.push(rects[i]);
			}
		}
		console.log(filteredRects);

		highlightsStore.update((highlights) => {
			highlights.push({
				range,
				color,
				rects: filteredRects as unknown as DOMRectList //TODO change this
			});
			return highlights;
		});
		console.log(get(highlightsStore));

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
	{#each $highlightsStore as highlight}
		<Highlight rects={highlight.rects} color={highlight.color} />
	{/each}
</svg>
