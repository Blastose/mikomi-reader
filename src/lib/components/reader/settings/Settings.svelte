<script lang="ts">
	import { createDialog, melt, type CreateDialogProps } from '@melt-ui/svelte';
	import { IconLetterCase, IconX } from '@tabler/icons-svelte';
	import { fly } from 'svelte/transition';
	import type { EnglishFont, LineHeight, TextAlign } from './settings';
	import type { Orientation } from '../utils';
	import { createEventDispatcher, tick } from 'svelte';
	import DisplaySettings from './DisplaySettings.svelte';
	import SettingsButtonsItem from './SettingsButtonsItem.svelte';
	import FontSettings from './FontSettings.svelte';
	import { readerStateStore } from '../stores/readerStateStore';

	export let fontSize: number;
	export let lineHeight: LineHeight;
	export let columnCount: 1 | 2;
	export let textAlign: TextAlign;
	export let fontFamily: EnglishFont;
	export let writingMode: Orientation;
	export let margins: number;
	export let onColumnCountChange: (newColumnCount: 1 | 2) => Promise<void>;
	export let onWritingModeChange: (newWritingMode: Orientation) => Promise<void>;
	export let updateCurrentPage: () => void;
	export let updateTotalPages: () => void;

	const dispatch = createEventDispatcher();

	function dispatchResize() {
		dispatch('pageresize');
	}

	const handleOpen: CreateDialogProps['onOpenChange'] = ({ curr, next }) => {
		if (next === true) {
			readerStateStore.set('settingsOpen');
		} else {
			readerStateStore.set('reading');
		}
		return next;
	};

	const {
		elements: { trigger, content, title, close, portalled },
		states: { open }
	} = createDialog({
		forceVisible: true,
		onOpenChange: handleOpen
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

	async function dispatchWrapper(f: () => void | (() => Promise<void>)) {
		await f();
		await tick();
		updateCurrentPage();
		updateTotalPages();
		dispatchResize();
	}
</script>

<div use:melt={$portalled}>
	{#if $open}
		<div
			bind:this={dialog}
			class="fixed z-50 top-12 p-6 w-[66vw] sm:w-80 max-w-xl max-h-[calc(90vh_-_3rem)] right-6 rounded-xl shadow-2xl bg-white"
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

					<div class="flex flex-col gap-2">
						<DisplaySettings bind:fontSize bind:lineHeight bind:margins {dispatchWrapper} />
						<SettingsButtonsItem
							bind:textAlign
							bind:columnCount
							bind:writingMode
							{dispatchWrapper}
							{onColumnCountChange}
							{onWritingModeChange}
						/>
						<FontSettings bind:fontFamily {dispatchWrapper} />
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
