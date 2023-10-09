<script lang="ts">
	import { IconBook, IconFolders, IconPointerCheck, IconTrash, IconX } from '@tabler/icons-svelte';
	import { page } from '$app/stores';
	import { IconArrowLeft } from '@tabler/icons-svelte';
	import AddBookButton from './AddBookButton.svelte';
	import { mainStateStore } from '$lib/stores/mainStateStore';
	import {
		selectedBookMapStore,
		selectedBookIdsStore,
		databaseCollectionsStore
	} from '$lib/stores/mainStateStore';
	import { beforeNavigate } from '$app/navigation';
	import HeaderButton from './HeaderButton.svelte';
	import CollectionsModal from '$lib/components/collections/CollectionsModal.svelte';
	import { writable } from 'svelte/store';
	import ReadingStatusModal from '$lib/components/book/ReadingStatusModal.svelte';

	let currentHeaderText: string = 'Home';

	let scrollY: number;
	$: isOnBookRoute = $page.url.pathname.startsWith('/book/');

	let collectionsModalOpen = writable(false);
	let readingStatusModalOpen = writable(false);
	let clearSelectedCollections: () => {};
	let resetSelectedStatus: () => {};

	beforeNavigate(() => {
		mainStateStore.set('default');
		selectedBookMapStore.reset();
	});
</script>

<svelte:window bind:scrollY />

<CollectionsModal
	bookIds={$selectedBookIdsStore}
	openStore={collectionsModalOpen}
	collections={$databaseCollectionsStore}
	bookCollections={[]}
	bind:clearSelected={clearSelectedCollections}
/>
<ReadingStatusModal
	bookIds={$selectedBookIdsStore}
	currentStatus={'Reading'}
	openStore={readingStatusModalOpen}
	bind:resetSelectedStatus
/>

<div
	class="header sticky top-0 z-50 h-16
	{isOnBookRoute ? 'header-transition' : 'bg-white dark:bg-dark-500'} 
	{scrollY > 0 ? 'bg-white dark:bg-dark-500' : ''}"
>
	<div class="grid h-full">
		<div class="flex items-center justify-between h-full container-mi">
			{#if $mainStateStore === 'default'}
				<div class="text-4xl font-bold text-ellipsis overflow-hidden whitespace-nowrap">
					{#if isOnBookRoute}
						<button
							class="p-2 duration-300 rounded-full hover:bg-neutral-300"
							on:click={() => {
								history.back();
							}}
							aria-label="Go back"
						>
							<IconArrowLeft />
						</button>
					{:else if $page.url.pathname.startsWith('/books')}
						{'Library'}
					{:else if $page.url.pathname.startsWith('/settings')}
						{'Settings'}
					{:else if $page.url.pathname.startsWith('/collections')}
						{'Collections'}
					{:else}
						{currentHeaderText}
					{/if}
				</div>

				<div class="flex items-center gap-4">
					<AddBookButton />

					{#if $page.url.pathname.startsWith('/books')}
						<HeaderButton
							handleClick={() => {
								if (!$page.url.pathname.startsWith('/books')) {
									return;
								}
								mainStateStore.set('multiselect');
							}}
							subText={'Select books'}
						>
							<IconPointerCheck />
						</HeaderButton>
					{/if}
				</div>
			{:else if $mainStateStore === 'multiselect'}
				<div class="flex items-center sm:gap-4">
					<HeaderButton
						handleClick={() => {
							mainStateStore.set('default');
							selectedBookMapStore.reset();
						}}
						subText={'Clear'}
					>
						<IconX />
					</HeaderButton>
					<p>{$selectedBookMapStore.size} selected</p>
				</div>

				<div class="flex items-center gap-1 sm:gap-4">
					<HeaderButton
						handleClick={() => {
							resetSelectedStatus();
							readingStatusModalOpen.set(true);
						}}
						subText={'Edit reading status'}
					>
						<IconBook />
					</HeaderButton>

					<HeaderButton
						handleClick={() => {
							clearSelectedCollections();
							collectionsModalOpen.set(true);
						}}
						subText={'Edit collection'}
					>
						<IconFolders />
					</HeaderButton>

					<HeaderButton
						handleClick={() => {
							mainStateStore.set('default');
							selectedBookMapStore.reset();
						}}
						subText={'Remove books'}
					>
						<IconTrash />
					</HeaderButton>
				</div>
			{/if}
		</div>
	</div>
</div>

<style>
	.header {
		view-transition-name: header;
	}

	.header-transition {
		transition: background-color 500ms;
	}
</style>
