<script lang="ts">
	import { createSlider, melt, type CreateSliderProps } from '@melt-ui/svelte';
	import { writable } from 'svelte/store';
	import { readerThemeStore } from '$lib/components/reader/stores/readerSettingsStore';
	import Slider2 from './Slider2.svelte';

	export let min: number;
	export let max: number;
	export let currentPage: number;
	export let onValueChange: CreateSliderProps['onValueChange'];

	const currentPageStore = writable([currentPage]);
	$: currentPageStore.set([currentPage]);

	const {
		elements: { root, range, thumb }
	} = createSlider({
		defaultValue: [currentPage],
		min,
		max,
		step: 1,
		onValueChange,
		value: currentPageStore
	});
</script>

<Slider2 {min} {max} {currentPage} />

<span use:melt={$root} class="relative flex h-[40px] w-full items-center">
	<span class="block h-[4px] w-full bg-black/40">
		<span use:melt={$range} class="h-[4px] primary-bg-color" />
	</span>
	<span
		style:--primary-color-outline={`${$readerThemeStore.primaryColor}66`}
		use:melt={$thumb()}
		on:m-keydown={(e) => {
			e.preventDefault();
		}}
		class="block h-4 w-4 rounded-full primary-bg-color focus:outline-none focus:ring-4 focus:ring-[var(--primary-color-outline)]"
	/>
</span>

<style>
	.primary-bg-color {
		background-color: var(--primary-color);
	}
</style>
