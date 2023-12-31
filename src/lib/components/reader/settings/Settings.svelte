<script lang="ts">
	import { createDialog, melt, type CreateDialogProps } from '@melt-ui/svelte';
	import { IconLetterCase, IconX } from '@tabler/icons-svelte';
	import { fly } from 'svelte/transition';
	import type { EnglishFont, LineHeight, TextAlign } from './settings';
	import type { Orientation } from '../utils';
	import { createEventDispatcher, tick } from 'svelte';
	import { readerStateStore } from '../stores/readerStateStore';
	import Menu from './Menu.svelte';
	import { addBookSettingsFromSettingsAndTheme } from '$lib/components/reader/stores/readerSettingsStore';
	import { page } from '$app/stores';
	import {
		readerSettingsStore,
		readerThemeStore
	} from '$lib/components/reader/stores/readerSettingsStore';

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

	$: if (!$open) {
		(async () => {
			await addBookSettingsFromSettingsAndTheme(
				$page.params.id,
				window.innerHeight,
				window.innerWidth,
				$readerSettingsStore,
				$readerThemeStore
			);
			localStorage.setItem('last-reader-theme', JSON.stringify($readerThemeStore));
		})();
	}

	const {
		elements: { trigger, content, title, close, portalled },
		states: { open }
	} = createDialog({
		forceVisible: true,
		onOpenChange: handleOpen,
		preventScroll: false
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
			class="dialog-theme overflow-hidden fixed z-50 flex flex-col top-12 w-[66vw] sm:w-80 max-w-xl h-[calc(90vh_-_3rem)] max-h-[calc(90vh_-_3rem)] right-6 rounded-xl shadow-2xl"
			use:melt={$content}
			transition:fly={{
				duration: 200,
				y: -10,
				opacity: 0
			}}
		>
			<Menu
				bind:columnCount
				bind:fontFamily
				bind:fontSize
				bind:lineHeight
				bind:margins
				bind:textAlign
				bind:writingMode
				{onWritingModeChange}
				{onColumnCountChange}
				{dispatchWrapper}
			>
				<h2
					use:dragging
					use:melt={$title}
					class="pt-6 px-6 select-none cursor-grab m-0 text-lg font-medium"
				>
					Display options
				</h2>
			</Menu>
			<button
				use:melt={$close}
				aria-label="Close"
				class="absolute right-[10px] top-[10px] inline-flex p-1
            appearance-none items-center justify-center rounded-full text-neutral-200
            hover:bg-neutral-700 focus:shadow-neutral-400 focus:outline-none focus:ring-2
            focus:ring-neutral-400"
			>
				<IconX />
			</button>
		</div>
	{/if}
</div>

<button use:melt={$trigger} aria-label="Search book">
	<IconLetterCase />
</button>
