<script lang="ts">
	import { createDialog, melt } from '@melt-ui/svelte';
	import {
		IconLetterCase,
		IconX,
		IconAlignJustified,
		IconAlignLeft,
		IconAlignCenter,
		IconColumns1,
		IconColumns2
	} from '@tabler/icons-svelte';
	import { fly } from 'svelte/transition';
	import type { EnglishFont, LineHeight, TextAlign } from './settings';
	import { englishFontArray } from './settings';
	import type { Orientation } from '../utils';
	import { createEventDispatcher } from 'svelte';

	export let fontSize: number;
	export let lineHeight: LineHeight;
	export let columnCount: number;
	export let textAlign: TextAlign;
	export let fontFamily: EnglishFont;
	export let writingMode: Orientation;
	export let margins: number;

	const dispatch = createEventDispatcher();

	function dispatchResize() {
		dispatch('pageresize');
	}

	const {
		elements: { trigger, content, title, close, portalled },
		states: { open }
	} = createDialog({
		forceVisible: true
	});

	// TODO refactor this (copied from Search.svelte)
	function dragging(draggableNode: HTMLElement) {
		let isDragging = false;
		let offsetX: number;

		function onPointerDown(e: PointerEvent) {
			isDragging = true;
			offsetX = e.clientX - dialog.getBoundingClientRect().left;
			draggableNode.style.cursor = 'grabbing';

			window.addEventListener('pointermove', onPointerMove);
			window.addEventListener('pointerup', onPointerUp);
		}

		function onPointerMove(e: PointerEvent) {
			if (!isDragging) return;

			const newLeft = e.clientX - offsetX;
			dialog.style.left = `${newLeft}px`;
		}

		function onPointerUp(_e: PointerEvent) {
			isDragging = false;
			draggableNode.style.cursor = 'grab';

			let nodeLeft = parseInt(dialog.style.left);
			dialog.style.left = `${nodeLeft}px`;

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

	let dialog: HTMLElement;

	// TODO dispatch resize event
</script>

<div use:melt={$portalled}>
	{#if $open}
		<div
			bind:this={dialog}
			class="fixed z-50 top-12 p-6 w-[66vw] sm:w-80 max-w-xl h-[calc(90vh_-_3rem)] right-6 rounded-xl shadow-2xl bg-white"
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
						Display options
					</h2>

					<div class="">
						<div>
							<h3>Font size - {fontSize}px</h3>
							<button
								on:click={() => {
									fontSize -= 4;
									dispatchResize();
								}}>-</button
							>
							<button
								on:click={() => {
									fontSize += 4;
									console.log(fontSize);
									dispatchResize();
								}}>+</button
							>
						</div>

						<div>
							<h3>Page margins - {margins}px</h3>
							<button
								on:click={() => {
									margins -= 4;
									dispatchResize();
								}}>-</button
							>
							<button
								on:click={() => {
									margins += 4;
									dispatchResize();
								}}>+</button
							>
						</div>

						<div>
							<h3>Line height - {lineHeight}</h3>
							<button
								on:click={() => {
									if (typeof lineHeight === 'number') {
										lineHeight -= 0.1;
									} else {
										lineHeight = 1.2;
									}
									dispatchResize();
								}}>-</button
							>
							<button
								on:click={() => {
									if (typeof lineHeight === 'number') {
										lineHeight += 0.1;
									} else {
										lineHeight = 1.2;
									}
									dispatchResize();
								}}>+</button
							>
						</div>

						<div>
							<h3>Page layout</h3>
						</div>

						<div>
							<h3 class="text-lg">Justify</h3>
							<div class="flex gap-4">
								<button
									on:click={() => {
										textAlign = 'initial';
										console.log('int');
										dispatchResize();
									}}
									class="flex flex-col items-center"
								>
									<IconAlignCenter />
									<span class="text-sm text-gray-500">Initial</span>
								</button>
								<button
									on:click={() => {
										textAlign = 'justify';
										console.log('justify');
										dispatchResize();
									}}
									class="flex flex-col items-center"
								>
									<IconAlignJustified />
									<span class="text-sm text-gray-500">Jusitfy</span>
								</button>
								<button
									on:click={() => {
										textAlign = 'left';
										dispatchResize();
										console.log('left');
									}}
									class="flex flex-col items-center"
								>
									<IconAlignLeft />
									<span class="text-sm text-gray-500">Left</span>
								</button>
							</div>
						</div>

						<div>
							<h3>Font</h3>
							<!-- TODO switch with melt select for custom styling? -->
							<select
								class="px-2"
								bind:value={fontFamily}
								on:change={() => {
									dispatchResize();
								}}
							>
								{#each englishFontArray as font}
									<option style="font-family: {font};" value={font} selected={fontFamily === font}
										>{font}</option
									>
								{/each}
							</select>
						</div>

						{#if writingMode === 'horizontal'}
							<div>
								<h3>Column</h3>
								<div class="flex gap-2">
									<button
										class="flex flex-col items-center"
										on:click={() => {
											columnCount = 1;
											dispatchResize();
										}}
										><IconColumns1 />
										<span class="text-sm text-gray-500">1 column</span></button
									>
									<button
										class="flex flex-col items-center"
										on:click={() => {
											columnCount = 2;
											dispatchResize();
										}}
										><IconColumns2 />
										<span class="text-sm text-gray-500">2 columns</span></button
									>
								</div>
							</div>
						{/if}

						<!-- TODO Check if book lang === jp  -->
						{#if true}
							<div>
								<h3>Writing mode</h3>
								<div class="flex gap-2">
									<button
										class="rounded-md px-2 py-1 {writingMode === 'horizontal'
											? 'bg-gray-500 text-white'
											: 'bg-gray-200'}"
										on:click={() => {
											writingMode = 'horizontal';
											dispatchResize();
										}}>Horizontal</button
									>
									<button
										class="rounded-md px-2 py-1 {writingMode === 'vertical'
											? 'bg-gray-500 text-white'
											: 'bg-gray-200'}"
										on:click={() => {
											writingMode = 'vertical';
											dispatchResize();
										}}>Vertical</button
									>
								</div>
							</div>
						{/if}
					</div>
				</div>
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
	<IconLetterCase />
</button>
