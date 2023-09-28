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
</script>

<span class="relative flex h-[40px] w-full items-center">
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
		class="block h-4 w-4 rounded-full primary-bg-color focus:outline-none focus:ring-4 focus:ring-[var(--primary-color-outline)]"
	/>
</span>

<style>
	.primary-bg-color {
		background-color: var(--primary-color);
	}
</style>
