<script lang="ts">
	import { createDialog, melt } from '@melt-ui/svelte';
	import { fade, fly } from 'svelte/transition';
	import { IconX, IconFilter, IconFilterCheck } from '@tabler/icons-svelte';
	import CheckboxGroup from './CheckboxGroup.svelte';
	import { afterNavigate } from '$app/navigation';
	import { page } from '$app/stores';
	import type { Collection, Language } from '$lib/bindings';
	import MultiSelect from './MultiSelect.svelte';

	export let handleSubmit: () => void;
	export let databaseLanguages: Language[];
	export let languageValues: string[];
	export let readingStatusValues: string[];
	export let collectionsValues: string[];
	export let databaseCollections: Collection[];

	let clearReadingStatuses: () => {};
	let clearLanguages: () => {};
	let clearCollections: () => {};

	function resetAllFilters() {
		clearReadingStatuses();
		clearLanguages();
		clearCollections();
	}

	const readingStatuses = ['Reading', 'Plan to read', 'Finished'] as const;

	const {
		elements: { overlay, content, title, close, portalled, trigger },
		states: { open }
	} = createDialog({
		forceVisible: true,
		preventScroll: false
	});

	afterNavigate(() => {
		// This is needed because without it, the modal will close
		// at the same time as the view-transition plays, but it will
		// look laggy; this timeout delays it enough so that it modal close
		// is smooth
		setTimeout(() => {
			open.set(false);
		}, 100);
	});
</script>

<button
	use:melt={$trigger}
	class="flex gap-1 items-center text-bold px-2 py-1 rounded-md duration-300
{$page.url.search
		? 'bg-neutral-600 text-white dark:bg-white dark:text-black'
		: 'hover:bg-gray-200 dark:hover:bg-neutral-500'}"
>
	{#if $page.url.search}
		<IconFilterCheck />
	{:else}
		<IconFilter />
	{/if}
	Filter
</button>

{#each readingStatusValues as readingStatusValue}
	<input name="status" type="hidden" value={readingStatusValue} />
{/each}
{#each languageValues as languageValue}
	<input name="lang" type="hidden" value={languageValue} />
{/each}
{#each collectionsValues as collectionsValue}
	<input name="collection" type="hidden" value={collectionsValue} />
{/each}

<div use:melt={$portalled}>
	{#if $open}
		<div
			transition:fade={{ duration: 150 }}
			use:melt={$overlay}
			class="book-filter-overlay fixed inset-0 z-50 bg-black/50"
		/>
		<div
			class="book-filter dialog-theme fixed left-[50%] top-[50%] z-50 min-h-[50vh] max-h-[85vh] w-[85vw] max-w-6xl
            translate-x-[-50%] translate-y-[-50%] rounded-xl bg-white
            overflow-y-scroll custom-scroll
            p-6 shadow-lg"
			use:melt={$content}
			transition:fly={{
				duration: 150,
				y: -10,
				opacity: 0
			}}
		>
			<div class="flex flex-col gap-4">
				<h2 use:melt={$title} class="m-0 text-2xl font-bold">Filter</h2>

				<div class="flex flex-col gap-4">
					<div class="flex items-center flex-wrap gap-2">
						<CheckboxGroup
							items={readingStatuses.map((v) => {
								return {
									value: v,
									display: v
								};
							})}
							groupName="Reading status"
							name="status"
							bind:group={readingStatusValues}
							bind:resetCheckboxGroup={clearReadingStatuses}
						/>
					</div>

					<div class="flex items-center flex-wrap gap-4">
						<MultiSelect
							allSelectedText="All languages"
							selectName="Language"
							selectOptions={databaseLanguages.map((l) => l.name)}
							bind:selected={languageValues}
							bind:resetSelected={clearLanguages}
						/>

						<MultiSelect
							allSelectedText="Any collection"
							selectName="Collection"
							selectOptions={databaseCollections.map((c) => c.name)}
							bind:selected={collectionsValues}
							bind:resetSelected={clearCollections}
						/>
					</div>
				</div>

				<div class="flex flex-col-reverse sm:flex-row gap-2 sm:gap-4 items-center sm:justify-end">
					<button
						on:click={resetAllFilters}
						type="button"
						class="w-full sm:w-fit hover:bg-neutral-700 duration-300 rounded-md px-4 py-2"
					>
						Reset filter
					</button>
					<button
						type="button"
						on:click={handleSubmit}
						class="w-full sm:w-fit bg-neutral-600 hover:bg-neutral-700 rounded-md px-4 py-2"
					>
						Apply filter
					</button>
				</div>
			</div>

			<button
				use:melt={$close}
				aria-label="Close"
				class="absolute right-[10px] top-[10px] inline-flex p-1
            appearance-none items-center justify-center rounded-full text-neutral-200
            hover:bg-neutral-700 focus:shadow-neutral-400 focus:outline-none focus:ring-2
            focus:ring-neutral-400"
			>
				<IconX />
			</button>
		</div>
	{/if}
</div>

<style>
	.book-filter {
		view-transition-name: book-filter;
	}

	.book-filter-overlay {
		view-transition-name: book-filter-overlay;
	}
</style>
