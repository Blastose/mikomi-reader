<script lang="ts">
	import { createSlider, melt, type CreateSliderProps } from '@melt-ui/svelte';
	import { writable } from 'svelte/store';

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

<span use:melt={$root} class="relative flex h-[40px] w-full items-center">
	<span class="block h-[3px] w-full bg-black/40">
		<span use:melt={$range} class="h-[4px] bg-pink-500" />
	</span>
	<span
		use:melt={$thumb()}
		on:m-keydown={(e) => {
			e.preventDefault();
		}}
		class="block h-4 w-4 rounded-full bg-pink-500 focus:outline-none focus:ring-4 focus:ring-pink-500/40"
	/>
</span>
