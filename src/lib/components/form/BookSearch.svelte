<script lang="ts">
	import BookFilter from '$lib/components/form/BookFilter.svelte';
	import { IconSearch, IconX } from '@tabler/icons-svelte';
	import { fade } from 'svelte/transition';

	export let searchText: string | null;
	export let readingStatuses: string[];
	let formElement: HTMLFormElement;

	function handleSubmit() {
		formElement.requestSubmit();
	}
</script>

<form bind:this={formElement} method="get" class="top-search-bar flex gap-1 sm:gap-4">
	<div class="flex relative w-full">
		<input
			name="q"
			class="w-full rounded-sm border-none outline-none focus:ring-1
      px-12 py-2
      bg-gray-200 dark:bg-neutral-700
       ring-black dark:ring-white duration-300"
			type="text"
			placeholder="Search"
			autocomplete="off"
			value={searchText}
		/>
		<button tabindex="-1" class="absolute left-0 p-2" type="submit"><IconSearch /></button>
		{#if searchText}
			<button
				on:click={() => {
					searchText = '';
				}}
				transition:fade={{ duration: 150 }}
				class="absolute right-0 p-2"
				type="button"
			>
				<IconX />
			</button>
		{/if}
	</div>

	<BookFilter {handleSubmit} readingStatusValues={readingStatuses} />
</form>

<style>
	.top-search-bar {
		view-transition-name: top-search-bar;
	}
</style>