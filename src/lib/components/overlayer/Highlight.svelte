<script lang="ts">
	import { createDialog, melt } from '@melt-ui/svelte';
	import { tick } from 'svelte';
	import { IconTrash, IconCheck } from '@tabler/icons-svelte';
	import { readerStateStore } from '$lib/components/reader/stores/readerStateStore';
	import { fly } from 'svelte/transition';
	import { removeHighlight, updateHighlight } from '$lib/bindings';
	import { highlightsStore, type Highlight } from '$lib/components/reader/stores/highlightsStore';

	export let highlight: Highlight;

	$: color = highlight.color;
	$: activeColor = increaseHexAlpha(highlight.color);

	let noteText = highlight.note;
	let newColor = highlight.color;

	const colorButtons = [
		{
			name: 'red',
			color: '#ff000020',
			colorClass: 'bg-red-500'
		},
		{
			name: 'yellow',
			color: '#ffff0020',
			colorClass: 'bg-yellow-300'
		},
		{
			name: 'blue',
			color: '#0000ff20',
			colorClass: 'bg-blue-500'
		},
		{
			name: 'green',
			color: '#00ff0020',
			colorClass: 'bg-green-500'
		}
	] as const;

	function increaseHexAlpha(hex: string) {
		return `${hex.substring(0, hex.length - 2)}${50}`;
	}

	$: if ($open) {
		readerStateStore.set('noteOpen');
		newColor = highlight.color;
	} else {
		readerStateStore.set('reading');
	}

	const {
		elements: { content, portalled },
		states: { open }
	} = createDialog({
		forceVisible: true
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
		await tick();

		if (window.innerWidth <= 480) {
			overlayOptions.style.left = `50%`;
			overlayOptions.style.bottom = `0`;
			overlayOptions.style.transform = 'translate(-50%, -50%)';
		} else {
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

			overlayOptions.style.transform = '';
		}
	}

	function onHighlightButtonClick(e: MouseEvent) {
		const target = e.target as HTMLElement;
		const buttonTarget = target.closest<HTMLButtonElement>('button[data-color]');
		if (!buttonTarget) return;

		newColor = buttonTarget.dataset.color ?? '#ff000020';
	}

	let g: SVGElement;
	let overlayOptions: HTMLDivElement;

	async function onTrashClick() {
		readerStateStore.set('reading');
		open.set(false);
		await removeHighlight(highlight.id);
		highlightsStore.update((highlights) => {
			const foundIndex = highlights.findIndex((hi) => hi.id === highlight.id);
			if (foundIndex === -1) return highlights;
			highlights.splice(foundIndex, 1);
			return highlights;
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
			class="fixed z-50 rounded-xl select-none p-2 shadow-lg bg-gray-100 max-w-[calc(100vw_-_20px)]"
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
					class="p-2 resize-none"
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
								? `box-shadow: 0 0 0 3px ${increaseHexAlpha(colorButton.color)};`
								: ''}
							class="h-6 w-6 rounded-full {colorButton.colorClass}"
							data-color={colorButton.color}
							aria-label="Change to {colorButton.color}"
						/>
					{/each}
				</div>

				<div class="flex justify-between">
					<button class="flex flex-col items-center" on:click={onTrashClick}>
						<IconTrash />
						<span class="text-sm text-gray-500">Delete</span>
					</button>
					<button class="flex flex-col items-center" on:click={onSaveClick}>
						<IconCheck />
						<span class="text-sm text-gray-500">Save</span>
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
