<script lang="ts">
	import { IconBook, IconFolders, IconPointerCheck, IconTrash, IconX } from '@tabler/icons-svelte';
	import { page } from '$app/stores';
	import { IconArrowLeft } from '@tabler/icons-svelte';
	import { mainStateStore } from '$lib/stores/mainStateStore';
	import {
		selectedBookMapStore,
		selectedBookIdsStore,
		databaseCollectionsStore
	} from '$lib/stores/mainStateStore';
	import { beforeNavigate, invalidateAll } from '$app/navigation';
	import HeaderButton from './HeaderButton.svelte';
	import CollectionsModal from '$lib/components/collections/CollectionsModal.svelte';
	import { writable } from 'svelte/store';
	import ReadingStatusModal from '$lib/components/book/ReadingStatusModal.svelte';
	import ConfirmModal from '$lib/components/modal/ConfirmModal.svelte';
	import { addToast } from '$lib/components/toast/ToastContainer.svelte';
	import { removeBook } from '$lib/bindings';
	import AddBooksModal from '../modal/AddBooksModal.svelte';

	let currentHeaderText: string = 'Home';

	let scrollY: number;
	$: isOnBookRoute = $page.url.pathname.startsWith('/book/');

	let collectionsModalOpen = writable(false);
	let readingStatusModalOpen = writable(false);
	let confirmDeleteModalOpen = writable(false);
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
<ConfirmModal
	modalTitle="Remove book"
	subText={`Are you sure you want to remove ${$selectedBookMapStore.size} books? This will also remove any saved bookmarks or highlights.`}
	openStore={confirmDeleteModalOpen}
	onConfirm={async () => {
		const promises = [];
		for (const bookId of $selectedBookIdsStore) {
			promises.push(removeBook(bookId));
		}
		await Promise.allSettled(promises);
		invalidateAll();
		addToast({
			data: { title: 'Removed books successfully', color: '', description: '' }
		});
	}}
	cancelText="Cancel"
	confirmText="Delete"
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
					<AddBooksModal />

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
				<div class="flex items-center gap-1 sm:gap-4">
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
							confirmDeleteModalOpen.set(true);
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
