<script lang="ts">
	import { readerThemeStore } from '$lib/components/reader/stores/readerSettingsStore';
	import { readerSettingsStore } from '$lib/components/reader/stores/readerSettingsStore';

	export let min: number;
	export let max: number;
	export let currentPage: number;
	export let onChange: (page: number) => void;

	$: orientation = $readerSettingsStore.writingMode;
	$: left = ((currentPage - 1) / (max - 1)) * 100;

	$: thumbLeft = orientation === 'horizontal' ? left : 100 - left;
	$: progressTrackLeft = orientation === 'horizontal' ? 0 : 100 - left;
	$: progressTrackRight = orientation === 'horizontal' ? 100 - left : 0;

	function a(node: HTMLSpanElement) {}

	let track: HTMLSpanElement;

	let showTooltip = true;
	let hoveredPage = currentPage;
	let tooltipLeft: number;

	let arrayA: { start: number; end: number; page: number; inversePage: number }[] = [];
	let numSections = max - 1;
	let sectionWidth = 1 / numSections;
	for (let i = 0; i < numSections + 1; i++) {
		const start = i * sectionWidth - sectionWidth / 2;
		arrayA.push({
			start: start,
			end: start + sectionWidth,
			page: i + 1,
			inversePage: numSections + 1 - i
		});
	}
	console.log(arrayA);

	function getPageFromSection(percentage: number) {
		for (const a of arrayA) {
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

	let mousePressed = false;
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<!-- svelte-ignore a11y-mouse-events-have-key-events -->
<span
	bind:this={track}
	on:mouseout={(e) => {
		showTooltip = false;
	}}
	on:mousedown={(e) => {
		mousePressed = true;
		const percentage = e.offsetX / track.offsetWidth;
		tooltipLeft = percentage * 100;

		hoveredPage = getPageFromSection(percentage);

		currentPage = hoveredPage;
		onChange(currentPage);
	}}
	on:mouseup={() => {
		mousePressed = false;
	}}
	on:mousemove={(e) => {
		showTooltip = true;
		const percentage = e.offsetX / track.offsetWidth;
		tooltipLeft = percentage * 100;

		hoveredPage = getPageFromSection(percentage);

		if (!mousePressed) return;
		currentPage = hoveredPage;
		onChange(currentPage);
	}}
	class="relative flex h-[40px] w-full items-center"
>
	{#if showTooltip}
		<span
			style:left="{tooltipLeft}%"
			class="tooltip absolute shadow-md w-12 text-center translate-x-[-50%] bottom-10 bg-gray-200 p-2 rounded-md"
		>
			{hoveredPage}
		</span>
	{/if}
	<span class="block h-[4px] w-full bg-black/40">
		<span
			style:position="absolute"
			style:right="{progressTrackRight}%"
			style:left="{progressTrackLeft}%"
			class="h-[4px] primary-bg-color"
		/>
	</span>
	<span
		style:--primary-color-outline={`${$readerThemeStore.primaryColor}66`}
		style:position="absolute"
		style:translate="-50%"
		style:left="{thumbLeft}%"
		class="pointer-events-none block h-4 w-4 rounded-full primary-bg-color focus:outline-none focus:ring-4 focus:ring-[var(--primary-color-outline)]"
	/>
</span>

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
