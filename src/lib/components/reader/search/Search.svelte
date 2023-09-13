<script lang="ts">
	import { createDialog, melt } from '@melt-ui/svelte';
	import { IconSearch, IconX } from '@tabler/icons-svelte';
	import { readerStateStore } from '$lib/components/reader/stores/readerStateStore';
	import { fly } from 'svelte/transition';
	import { searchBook, type SearchBookResult } from './search';

	export let readerNode: HTMLDivElement;
	let searchTerm: string;
	let searchResults: SearchBookResult[] = [];

	let searchState: 'blank' | 'searched' = 'blank';

	$: if ($open) {
		readerStateStore.set('searchOpen');
	} else {
		readerStateStore.set('reading');
	}

	const {
		elements: { trigger, content, title, close, portalled },
		states: { open }
	} = createDialog({
		forceVisible: true
	});

	function onInputKeyDown(e: KeyboardEvent & { currentTarget: EventTarget & HTMLInputElement }) {
		if (e.key === 'Enter') {
			e.preventDefault();
			searchResults = searchBook(readerNode, searchTerm);
			searchState = 'searched';
		}
	}
</script>

<div use:melt={$portalled}>
	{#if $open}
		<div
			class="fixed z-50 top-12 p-6 w-[66vw] sm:w-[50vw] max-w-xl h-[calc(90vh_-_3rem)] right-6 rounded-xl shadow-2xl bg-white"
			use:melt={$content}
			transition:fly={{
				duration: 200,
				y: -10,
				opacity: 0
			}}
		>
			<div class="flex flex-col gap-2 h-full">
				<div class="flex flex-col gap-2">
					<h2 use:melt={$title} class="m-0 text-lg font-medium">Search</h2>
					<input
						bind:value={searchTerm}
						on:keydown={onInputKeyDown}
						class="p-2"
						type="text"
						placeholder="Search in this book"
					/>
					{#if searchResults.length > 0 && searchState === 'searched'}
						<p class="text-gray-500">{searchResults.length} results in book</p>
					{:else if searchResults.length === 0 && searchState === 'searched'}
						<p class="text-gray-500">0 results in book</p>
					{/if}
				</div>

				{#if searchResults.length > 0}
					<div class="flex flex-col gap-2 grow overflow-y-auto">
						<div class="flex flex-col gap-2">
							{#each searchResults as searchResult, index}
								<div>
									<p>{@html searchResult.highlightedText}</p>
								</div>
								{#if index !== searchResults.length - 1}
									<hr />
								{/if}
							{/each}
						</div>
					</div>
				{/if}
			</div>
			<button
				use:melt={$close}
				aria-label="close"
				class="absolute right-4 top-4 inline-flex h-6 w-6
                items-center justify-center rounded-full p-1 text-gray-800
                hover:bg-gray-100 focus:shadow-gray-400"
			>
				<IconX />
			</button>
		</div>
	{/if}
</div>

<button use:melt={$trigger} aria-label="Search book">
	<IconSearch />
</button>
