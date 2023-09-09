<script lang="ts">
	import { IconChevronLeft, IconChevronRight } from '@tabler/icons-svelte';
	import type { Orientation } from './utils';

	export let prevPage: () => void;
	export let nextPage: () => void;
	export let orientation: Orientation;
</script>

<div class="fixed z-20 w-full left-0 h-full flex justify-between text-gray-500 pointer-events-none">
	<button
		on:click={() => {
			if (orientation === 'horizontal') {
				prevPage();
			} else {
				nextPage();
			}
		}}
		class="bg-white w-8 flex items-center justify-center pointer-events-auto"
		aria-label={orientation === 'horizontal' ? 'Previous page' : 'Next page'}
	>
		<IconChevronLeft />
	</button>
	<button
		on:click={() => {
			if (orientation === 'horizontal') {
				nextPage();
			} else {
				prevPage();
			}
		}}
		class="bg-white w-8 flex items-center justify-center pointer-events-auto"
		aria-label={orientation === 'horizontal' ? 'Next page' : 'Previous page'}
	>
		<IconChevronRight />
	</button>
</div>
