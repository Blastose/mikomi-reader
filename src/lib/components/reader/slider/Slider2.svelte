<script lang="ts">
	import { readerThemeStore } from '$lib/components/reader/stores/readerSettingsStore';
	import { readerSettingsStore } from '$lib/components/reader/stores/readerSettingsStore';

	export let min: number;
	export let max: number;
	export let currentPage: number;

	let valuePlaceholder = currentPage;

	$: orientation = $readerSettingsStore.writingMode;
	$: left = ((currentPage - 1) / (max - 1)) * 100;

	$: thumbLeft = orientation === 'horizontal' ? left : 100 - left;
	$: progressTrackLeft = orientation === 'horizontal' ? 0 : 100 - left;
	$: progressTrackRight = orientation === 'horizontal' ? 100 - left : 0;

	function a(node: HTMLSpanElement) {}

	let track: HTMLSpanElement;

	let showTooltip = true;
	let hoveredPage = currentPage;
	$: tooltipLeft = 2;

	let arrayA: { start: number; end: number; page: number }[] = [];

	let numSections = max - 1;
	let sectionWidth = 1 / numSections;
	for (let i = 0; i < numSections + 1; i++) {
		const start = i * sectionWidth - sectionWidth / 2;
		arrayA.push({
			start: start,
			end: start + sectionWidth,
			page: i + 1
		});
	}
	console.log(arrayA);

	function getPageFromSection(percentage: number) {
		for (const a of arrayA) {
			if (percentage >= a.start && percentage <= a.end) {
				return a.page;
			}
		}
		return -1;
	}
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<!-- svelte-ignore a11y-mouse-events-have-key-events -->
<span
	bind:this={track}
	on:mouseout={(e) => {
		showTooltip = false;
	}}
	on:mousemove={(e) => {
		showTooltip = true;
		console.log(e.offsetX);
		console.log(track.offsetWidth);
		const percentage = e.offsetX / track.offsetWidth;
		console.log(percentage);
		console.log(Math.round(percentage * max));
		tooltipLeft = percentage * 100;
		hoveredPage = getPageFromSection(percentage);
		currentPage = hoveredPage;
	}}
	class="relative flex h-[40px] w-full items-center"
>
	{#if showTooltip}
		<span
			style:left="{tooltipLeft}%"
			class="absolute shadow-md translate-x-[-50%] bottom-10 bg-gray-200 p-2 rounded-md"
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
</style>
