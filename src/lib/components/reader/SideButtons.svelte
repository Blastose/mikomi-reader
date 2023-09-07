<script lang="ts">
	import { IconChevronLeft, IconChevronRight } from '@tabler/icons-svelte';

	export let prevPage: () => void;
	export let nextPage: () => void;
</script>

<div class="fixed w-full left-0 h-full flex justify-between text-gray-500 pointer-events-none">
	<button
		on:click={() => {
			prevPage();
		}}
		class="w-8 flex items-center justify-center pointer-events-auto"
		aria-label="Previous page"
	>
		<IconChevronLeft />
	</button>
	<button
		on:click={() => {
			nextPage();
		}}
		class="w-8 flex items-center justify-center pointer-events-auto"
		aria-label="Next page"
	>
		<IconChevronRight />
	</button>
</div>
