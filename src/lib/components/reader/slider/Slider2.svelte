<script lang="ts">
	import { readerThemeStore } from '$lib/components/reader/stores/readerSettingsStore';
	import { readerSettingsStore } from '$lib/components/reader/stores/readerSettingsStore';
	import { fade } from 'svelte/transition';

	export let max: number;
	export let currentPage: number;
	export let onChange: (page: number) => void;

	$: orientation = $readerSettingsStore.writingMode;
	$: left = ((currentPage - 1) / (max - 1)) * 100;

	$: thumbLeft = orientation === 'horizontal' ? left : 100 - left;
	$: progressTrackLeft = orientation === 'horizontal' ? 0 : 100 - left;
	$: progressTrackRight = orientation === 'horizontal' ? 100 - left : 0;

	let track: HTMLSpanElement;
	let showTooltip = false;
	let hoveredPage = currentPage;
	let tooltipLeft: number;
	let mousePressed = false;
	let thumb: HTMLSpanElement;
	$: cursor = mousePressed ? 'grabbing' : 'grab';

	let pageSections: { start: number; end: number; page: number; inversePage: number }[] = [];
	let numSections = max - 1;
	let sectionWidth = 1 / numSections;
	for (let i = 0; i < numSections + 1; i++) {
		const start = i === 0 ? -Infinity : i * sectionWidth - sectionWidth / 2;
		const end = i === numSections ? Infinity : i === 0 ? 0 + sectionWidth : start + sectionWidth;
		pageSections.push({
			start,
			end,
			page: i + 1,
			inversePage: numSections + 1 - i
		});
	}

	function getPageFromSection(percentage: number) {
		for (const a of pageSections) {
			if (percentage >= a.start && percentage <= a.end) {
				if (orientation === 'horizontal') {
					return a.page;
				} else {
					return a.inversePage;
				}
			}
		}
		return -1;
	}

	function pointerDown(e: PointerEvent) {
		if (e.button !== 0) return;
		const target = e.target as HTMLElement;
		if (!track.contains(target)) return;

		e.preventDefault();
		mousePressed = true;
		thumb.focus();
		const rect = track.getBoundingClientRect();
		const relPosX = e.clientX - rect.left;
		const percentage = relPosX / track.offsetWidth;
		currentPage = getPageFromSection(percentage);
		onChange(currentPage);
	}

	function pointerUp() {
		mousePressed = false;
	}

	function pointerMove(e: PointerEvent) {
		if (!mousePressed) return;

		const rect = track.getBoundingClientRect();
		const relPosX = e.clientX - rect.left;
		thumb.focus();
		const percentage = relPosX / track.offsetWidth;
		currentPage = getPageFromSection(percentage);
		onChange(currentPage);
	}
</script>

<svelte:document
	on:pointerdown={pointerDown}
	on:pointerup={pointerUp}
	on:pointermove={pointerMove}
	on:pointerleave={pointerUp}
/>

<div class="relative">
	{#if showTooltip}
		<span
			transition:fade
			style:left="{tooltipLeft}%"
			class="tooltip select-none pointer-events-none absolute shadow-md w-12 bottom-10 text-center translate-x-[-50%] bg-gray-200 p-2 rounded-md"
		>
			{hoveredPage}
		</span>
	{/if}
	<span
		bind:this={track}
		on:pointerleave={() => {
			showTooltip = false;
		}}
		on:pointermove={(e) => {
			const rect = track.getBoundingClientRect();
			showTooltip = true;
			const percentage = (e.clientX - rect.left) / track.offsetWidth;
			tooltipLeft = percentage * 100;
			hoveredPage = getPageFromSection(percentage);
		}}
		style:--cursor={cursor}
		class="{mousePressed ? 'hover:cursor-[var(--cursor)]' : ''} 
		relative flex h-[40px] w-full items-center select-none"
	>
		<span class="block h-[4px] w-full bg-black/40">
			<span
				style:position="absolute"
				style:right="{progressTrackRight}%"
				style:left="{progressTrackLeft}%"
				class="h-[4px] primary-bg-color"
			/>
		</span>
		<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
		<span
			tabindex="0"
			bind:this={thumb}
			style:--primary-color-outline={`${$readerThemeStore.primaryColor}66`}
			style:position="absolute"
			style:translate="-50%"
			style:left="{thumbLeft}%"
			class="hover:cursor-[var(--cursor)] block h-4 w-4 rounded-full primary-bg-color focus:outline-none focus:ring-4 focus:ring-[var(--primary-color-outline)]"
		/>
	</span>
</div>

<style>
	.primary-bg-color {
		background-color: var(--primary-color);
	}

	.tooltip::after {
		content: '';
		position: absolute;
		top: 100%;
		left: 50%;

		margin-left: -10px;
		border-width: 10px;
		border-style: solid;
		border-color: rgb(229 231 235) transparent transparent transparent;
	}
</style>
