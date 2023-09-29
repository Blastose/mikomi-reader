<script lang="ts">
	import { readerThemeStore } from '$lib/components/reader/stores/readerSettingsStore';
	import { readerSettingsStore } from '$lib/components/reader/stores/readerSettingsStore';
	import { fade } from 'svelte/transition';
	import { getTocChapterFromPage } from '$lib/components/reader/utils';
	import { tick } from 'svelte';
	import { flatTocStore } from '../stores/tocStore';

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
	let hoveredChapter = '';
	let tooltip: HTMLSpanElement;
	let tooltipLeft: number;
	let tooltipTriangleLeft: number;
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
		history.pushState(currentPage, '');
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
		<div transition:fade>
			<span
				style:left="{tooltipTriangleLeft}px"
				class="tooltip-triangle translate-x-[-50%] select-none pointer-events-none absolute bottom-8"
			/>
			<span
				bind:this={tooltip}
				style:left="{tooltipLeft}px"
				class="dialog-theme text-sm whitespace-nowrap select-none pointer-events-none absolute shadow-md bottom-10 text-center py-2 px-4 rounded-md"
			>
				{hoveredChapter} - page {hoveredPage}
			</span>
		</div>
	{/if}
	<span
		bind:this={track}
		on:pointerleave={() => {
			showTooltip = false;
		}}
		on:pointermove={async (e) => {
			const rectTrack = track.getBoundingClientRect();
			showTooltip = true;
			await tick();
			const percentage = (e.clientX - rectTrack.left) / track.offsetWidth;
			tooltipTriangleLeft = percentage * track.offsetWidth;
			console.log(percentage);
			tooltipLeft = e.clientX - rectTrack.left - tooltip.offsetWidth / 2;
			await tick();
			const rectTooltip = tooltip.getBoundingClientRect();
			if (rectTooltip.x < 0) {
				tooltipLeft = -rectTrack.left;
			} else if (rectTooltip.x + rectTooltip.width > window.innerWidth) {
				tooltipLeft = window.innerWidth - rectTooltip.width - rectTrack.left;
			}

			hoveredPage = getPageFromSection(percentage);
			hoveredChapter = getTocChapterFromPage(hoveredPage, $flatTocStore, $flatTocStore[0].label);
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

	.tooltip-triangle {
		width: 0;
		height: 0;
		border-left: 20px solid transparent;
		border-right: 20px solid transparent;
		border-top: 20px solid rgb(32, 32, 34);
	}
</style>
