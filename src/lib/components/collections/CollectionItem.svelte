<script lang="ts">
	import {
		updateCollectionName,
		type Collection,
		removeCollection,
		type BookWithCover
	} from '$lib/bindings';
	import {
		IconChevronDown,
		IconChevronUp,
		IconDotsVertical,
		IconPencil,
		IconTrash
	} from '@tabler/icons-svelte';
	import BookImageCard from '$lib/components/book/BookImageCard.svelte';
	import BookSwiper from '$lib/components/book/BookSwiper.svelte';
	import { createDropdownMenu, melt } from '@melt-ui/svelte';
	import { fly } from 'svelte/transition';
	import InputModal from '$lib/components/modal/InputModal.svelte';
	import { writable } from 'svelte/store';
	import { addToast } from '../toast/ToastContainer.svelte';
	import { invalidateAll } from '$app/navigation';
	import ConfirmModal from '../modal/ConfirmModal.svelte';
	import { mainStateStore } from '$lib/stores/mainStateStore';

	export let collectionWithBooks: {
		collection: Collection;
		books: BookWithCover[];
	};
	export let moveUp: () => void;
	export let moveDown: () => void;
	export let reorderCollectionsByCurrentPositions: () => Promise<void>;

	const {
		elements: { trigger, menu, item },
		states: { open }
	} = createDropdownMenu({
		preventScroll: false,
		forceVisible: true,
		positioning: { placement: 'bottom-end' }
	});

	const confirmModalOpen = writable(false);
	const editModalOpen = writable(false);
	let editModalInput: string = collectionWithBooks.collection.name;

	async function handleEditModalSave() {
		try {
			await updateCollectionName(collectionWithBooks.collection.id, editModalInput);
			addToast({ data: { title: 'Renamed collection successfully', color: '', description: '' } });
			invalidateAll();
		} catch {
			addToast({ data: { title: 'Cannot rename collection', color: '', description: '' } });
		}
	}
</script>

<div
	class="collection-item-container flex flex-col gap-4 bg-[#e1e3e6] dark:bg-[#39393a] p-4 rounded-md"
>
	<div class="grid">
		<div class="flex overflow-hidden text-ellipsis whitespace-nowrap">
			{#if $mainStateStore === 'reorderCollections'}
				<p
					class="text-xl font-bold w-full overflow-hidden text-ellipsis whitespace-nowrap target-title"
				>
					{collectionWithBooks.collection.name}
				</p>
			{:else}
				<a
					href="/collection/{collectionWithBooks.collection.id}"
					class="text-xl font-bold w-full overflow-hidden text-ellipsis whitespace-nowrap target-title"
				>
					{collectionWithBooks.collection.name}
				</a>
			{/if}

			{#if $mainStateStore !== 'reorderCollections'}
				<button
					use:melt={$trigger}
					aria-label="Open collection options for {collectionWithBooks.collection.name}"
				>
					<IconDotsVertical />
				</button>
			{:else}
				<div class="flex gap-2">
					<button
						class="up-button rounded-full focus:bg-gray-300 focus:dark:bg-neutral-500 flex items-center justify-center h-8 w-8"
						on:click={moveUp}
					>
						<IconChevronUp />
					</button>
					<button
						class="down-button rounded-full focus:bg-gray-300 focus:dark:bg-neutral-500 flex items-center justify-center h-8 w-8"
						on:click={moveDown}
					>
						<IconChevronDown />
					</button>
				</div>
			{/if}
		</div>
		<span class="text-sm sm:text-base text-gray-500 dark:text-neutral-300"
			>{collectionWithBooks.books.length} books</span
		>
	</div>

	{#if $mainStateStore !== 'reorderCollections'}
		{#if collectionWithBooks.books.length > 0}
			<BookSwiper let:scroll>
				{#each collectionWithBooks.books as book}
					<div class="item">
						<BookImageCard {book} disablePointerEvents={scroll} hideSubText={true} />
					</div>
				{/each}
			</BookSwiper>
		{/if}
	{/if}
</div>

<!-- TODO both InputModal and ConfirmModal add a <div> data-portal to the Dom -->
<!-- This happens for each collection item -->
<InputModal
	modalTitle="Edit collection name"
	bind:inputValue={editModalInput}
	openStore={editModalOpen}
	onSave={handleEditModalSave}
	placeholder="New collection name"
	confirmText="Update"
	cancelText="Cancel"
/>
<ConfirmModal
	modalTitle="Delete collection"
	subText={`Are you sure you want to permanently delete "${collectionWithBooks.collection.name}"`}
	openStore={confirmModalOpen}
	onConfirm={async () => {
		try {
			removeCollection(collectionWithBooks.collection.id);
			addToast({
				data: { title: 'Deleted collection successfully', color: '', description: '' }
			});
			await invalidateAll();
			await reorderCollectionsByCurrentPositions();
		} catch {
			addToast({ data: { title: 'Unable to delete collection', color: '', description: '' } });
		}
	}}
	cancelText="Cancel"
	confirmText="Delete"
/>

{#if $open}
	<div
		class="text-white bg-neutral-700 shadow-md rounded-md flex flex-col z-50"
		use:melt={$menu}
		transition:fly={{ duration: 150, y: -10 }}
	>
		<button
			class="text-left pr-6 pl-4 py-2 flex gap-4 hover:bg-neutral-600 duration-150 rounded-md"
			use:melt={$item}
			on:click={() => {
				editModalOpen.set(true);
			}}
		>
			<IconPencil />
			<span>Edit name</span>
		</button>
		<button
			class="text-left pr-6 pl-4 py-2 flex gap-4 hover:bg-neutral-600 duration-150 rounded-md"
			use:melt={$item}
			on:click={() => {
				confirmModalOpen.set(true);
			}}
		>
			<IconTrash />
			<span>Delete</span>
		</button>
	</div>
{/if}

<style>
	.item {
		display: flex;
		justify-content: flex-end;
		flex: 0 0 25%;
	}

	@media (min-width: 640px) {
		.item {
			flex: 0 0 16%;
		}
	}
	@media (min-width: 768px) {
		.item {
			flex: 0 0 12%;
		}
	}
	@media (min-width: 1280px) {
		.item {
			flex: 0 0 8%;
		}
	}
	@media (min-width: 1536px) {
		.item {
			flex: 0 0 5%;
		}
	}
</style>
