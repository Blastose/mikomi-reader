<script lang="ts">
	import { createDialog, melt, type CreateDialogProps } from '@melt-ui/svelte';
	import { tick } from 'svelte';
	import { IconTrash, IconCheck } from '@tabler/icons-svelte';
	import { readerStateStore } from '$lib/components/reader/stores/readerStateStore';
	import { fly } from 'svelte/transition';
	import { removeHighlight, updateHighlight } from '$lib/bindings';
	import { highlightsStore, type Highlight } from '$lib/components/reader/stores/highlightsStore';
	import { addHighlightToDBAndStore, colorButtons, setLeftTopOnScreen } from './utils';
	import { addToast } from '$lib/components/toast/ToastContainer.svelte';
	import { page } from '$app/stores';

	export let highlight: Highlight;

	$: color = highlight.color;
	$: activeColor = increaseHexAlpha(highlight.color);

	let noteText = highlight.note;
	let newColor = highlight.color;
	$: bookId = $page.params.id;

	function increaseHexAlpha(hex: string) {
		return `${hex.substring(0, hex.length - 2)}${50}`;
	}

	const handleOpen: CreateDialogProps['onOpenChange'] = ({ curr, next }) => {
		if (next === true) {
			readerStateStore.set('noteOpen');
			newColor = highlight.color;
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
		onOpenChange: handleOpen
	});

	function dragging(node: HTMLDivElement) {
		let isDragging = false;
		let offsetX: number;
		let offsetY: number;

		function onPointerDown(e: PointerEvent) {
			if (e.target && (e.target as HTMLElement).tagName === 'TEXTAREA') return;
			isDragging = true;
			const nodeRect = node.getBoundingClientRect();
			offsetX = e.clientX - nodeRect.left;
			offsetY = e.clientY - nodeRect.top;
			node.style.cursor = 'grabbing';

			window.addEventListener('pointermove', onPointerMove);
			window.addEventListener('pointerup', onPointerUp);
		}

		function onPointerMove(e: PointerEvent) {
			if (!isDragging) return;
			if (window.innerWidth <= 480) return;

			const newLeft = e.clientX - offsetX;
			const newTop = e.clientY - offsetY;
			node.style.left = `${newLeft}px`;
			node.style.top = `${newTop}px`;
		}

		function onPointerUp(_e: PointerEvent) {
			isDragging = false;
			node.style.cursor = 'grab';
			if (window.innerWidth <= 480) return;

			let nodeTop = parseInt(node.style.top);
			let nodeLeft = parseInt(node.style.left);

			if (nodeTop < 0) {
				nodeTop = 0;
			} else if (nodeTop > window.innerHeight - node.clientHeight) {
				nodeTop = window.innerHeight - node.clientHeight;
			}
			if (nodeLeft < 0) {
				nodeLeft = 0;
			} else if (nodeLeft + node.clientWidth > window.innerWidth) {
				nodeLeft = window.innerWidth - node.clientWidth;
			}
			node.style.left = `${nodeLeft}px`;
			node.style.top = `${nodeTop}px`;

			window.removeEventListener('pointermove', onPointerMove);
			window.removeEventListener('pointerup', onPointerUp);
		}

		node.addEventListener('pointerdown', onPointerDown);

		return {
			destroy() {
				node.removeEventListener('pointerdown', onPointerDown);
			}
		};
	}

	async function onClick(e: MouseEvent) {
		open.set(true);
		noteText = highlight.note;
		await tick();

		if (window.innerWidth <= 480) {
			overlayOptions.style.left = `50%`;
			overlayOptions.style.bottom = `0`;
			overlayOptions.style.transform = 'translate(-50%, -50%)';
		} else {
			let left = e.x;
			let top = e.y;
			setLeftTopOnScreen(overlayOptions, left, top);

			overlayOptions.style.transform = '';
		}
	}

	function onHighlightButtonClick(e: MouseEvent) {
		const target = e.target as HTMLElement;
		const buttonTarget = target.closest<HTMLButtonElement>('button[data-color]');
		if (!buttonTarget) return;

		newColor = buttonTarget.dataset.color ?? '#ff000020';
		updateHighlight(highlight.id, noteText, newColor);
		highlight.note = noteText;
		highlight.color = newColor;
		highlightsStore.update((hi) => hi);
	}

	let g: SVGElement;
	let overlayOptions: HTMLDivElement;

	async function onTrashClick() {
		readerStateStore.set('reading');
		open.set(false);
		highlightsStore.update((highlights) => {
			const foundIndex = highlights.findIndex((hi) => hi.id === highlight.id);
			if (foundIndex === -1) return highlights;
			highlights.splice(foundIndex, 1);
			return highlights;
		});
		await removeHighlight(highlight.id);

		const onUndo = () => {
			addHighlightToDBAndStore(highlight, bookId);
		};

		addToast({
			data: { title: 'Highlight deleted', color: '', description: '', onUndo: onUndo }
		});
	}

	async function onSaveClick() {
		readerStateStore.set('reading');
		open.set(false);
		await updateHighlight(highlight.id, noteText, newColor);
		highlight.note = noteText;
		highlight.color = newColor;
		highlightsStore.update((hi) => hi);
	}
</script>

<div use:melt={$portalled}>
	{#if $open}
		<div
			use:dragging
			bind:this={overlayOptions}
			class="dialog-theme fixed z-50 rounded-xl select-none p-2 shadow-lg max-w-[calc(100vw_-_20px)]"
			use:melt={$content}
			transition:fly={{
				duration: 200,
				y: -10,
				opacity: 0
			}}
		>
			<div class="flex flex-col gap-4 p-2">
				<textarea
					bind:value={noteText}
					class="bg-neutral-700 p-2 resize-none outline-none ring-neutral-200 focus:ring-1 rounded-sm"
					cols="30"
					rows="5"
					placeholder="Add note"
				/>

				<!-- svelte-ignore a11y-no-static-element-interactions -->
				<!-- svelte-ignore a11y-click-events-have-key-events -->
				<div on:click={onHighlightButtonClick} class="flex gap-1 justify-around">
					{#each colorButtons as colorButton}
						<button
							style={colorButton.color === newColor
								? `background-color: ${
										colorButton.displayColor
								  }; box-shadow: 0 0 0 3px ${increaseHexAlpha(colorButton.color)};`
								: `background-color: ${colorButton.displayColor};`}
							class="h-6 w-6 rounded-full"
							data-color={colorButton.color}
							aria-label="Change to {colorButton.name}"
						/>
					{/each}
				</div>

				<div class="flex justify-between">
					<button class="flex flex-col items-center" on:click={onTrashClick}>
						<IconTrash />
						<span class="text-sm text-neutral-400">Delete</span>
					</button>
					<button class="flex flex-col items-center" on:click={onSaveClick}>
						<IconCheck />
						<span class="text-sm text-neutral-400">Save</span>
					</button>
				</div>
			</div>
		</div>
	{/if}
</div>

<!-- svelte-ignore a11y-interactive-supports-focus -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<g
	bind:this={g}
	role="button"
	on:click={onClick}
	fill={$open ? activeColor : color}
	class="pointer-events-auto"
>
	{#each highlight.rects as rect}
		<rect class="" x={rect.left} y={rect.top} height={rect.height} width={rect.width} />
	{/each}
</g>
