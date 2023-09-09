<script lang="ts">
	import { tick } from 'svelte';
	import Highlight from './Highlight.svelte';
	import { createDialog, melt } from '@melt-ui/svelte';
	import { IconSearch, IconCopy } from '@tabler/icons-svelte';
	import { highlightsStore } from '$lib/components/reader/stores/highlightsStore';
	import { get } from 'svelte/store';
	import { getSelector } from '../reader/utils';

	export let domRects: Array<DOMRectList>;
	export let currentPage: number;
	export let pageSize: number;
	export let readerNode: HTMLDivElement;

	const {
		elements: { trigger, overlay, content, title, description, close, portalled },
		states: { open }
	} = createDialog({
		forceVisible: true
	});

	let selectionState: 'noneSelected' | 'selectedText' = 'noneSelected';
	function onSelect(e: Event) {
		console.log(document.getSelection()?.toString());
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
			overlayOptions.style.left = `${rangeRect.left + rangeRect.width / 2}px`;
			overlayOptions.style.top = `${rangeRect.top}px`;

			selectionState = 'noneSelected';
		}
	}

	function onHighlightButtonClick(e: MouseEvent) {
		console.log('lasdjlsajdkdljs');
		const target = e.target as HTMLElement;
		const buttonNode = target.closest('button');
		console.log(buttonNode);
		if (!buttonNode) return;

		const color = buttonNode.dataset.color as string;
		const range = window.getSelection()?.getRangeAt(0);
		console.log(range);
		if (!range) return;

		const readerNodeRect = readerNode.getBoundingClientRect();
		const rects = range.getClientRects();
		for (const r of rects) {
			r.x += pageSize * (currentPage - 1) - readerNodeRect.x;
			r.y += -readerNodeRect.y;
		}

		highlightsStore.update((highlights) => {
			highlights.push({
				range,
				color,
				rects
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

{#if $open}
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<div
		on:mousedown={(e) => {
			e.preventDefault();
		}}
		class=""
		use:melt={$portalled}
	>
		<div
			bind:this={overlayOptions}
			class="fixed left-[50%] top-[50%] z-50
		 rounded-xl
		p-2 shadow-lg bg-gray-100"
			use:melt={$content}
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
	</div>
{/if}

<svg
	class="fixed ml-12 z-10 pointer-events-none"
	style="left: -{(currentPage - 1) *
		pageSize}px; height: {readerNode?.scrollHeight}px; width: {readerNode?.scrollWidth}px"
>
	{#each $highlightsStore as highlight}
		<Highlight rects={highlight.rects} color={highlight.color} />
	{/each}
	<!-- {#each domRects as domRect}
		<Highlight rects={domRect} />
	{/each} -->
</svg>
