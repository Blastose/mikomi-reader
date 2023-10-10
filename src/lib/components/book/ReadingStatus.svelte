<script lang="ts">
	import { IconBook, IconCircleArrowRight, IconCheckbox } from '@tabler/icons-svelte';
	import { writable } from 'svelte/store';
	import ReadingStatusModal from './ReadingStatusModal.svelte';

	export let bookIds: string[];
	export let currentStatus: string;

	let openStore = writable(false);
</script>

<button
	on:click={() => {
		openStore.set(true);
	}}
	class="text-black flex items-center justify-center h-fit w-full gap-2 px-8 py-4 font-bold duration-300 rounded-md hover:bg-neutral-400 bg-neutral-300 dark:bg-neutral-600 dark:text-white dark:hover:bg-neutral-700 sm:w-fit"
>
	<span class="flex gap-2">
		{#if currentStatus === 'Reading'}
			<IconBook />
		{:else if currentStatus === 'Plan to read'}
			<IconCircleArrowRight />
		{:else if currentStatus === 'Finished'}
			<IconCheckbox />
		{/if}
		{currentStatus}
	</span>
</button>

<ReadingStatusModal {bookIds} {currentStatus} {openStore} />
