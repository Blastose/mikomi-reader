<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { reorderBooksInCollection, updateCollectionName } from '$lib/bindings.js';
	import BookItem from '$lib/components/collections/BookItem.svelte';
	import InputModal from '$lib/components/modal/InputModal.svelte';
	import { addToast } from '$lib/components/toast/ToastContainer.svelte';
	import { createDropdownMenu, melt } from '@melt-ui/svelte';
	import { IconDotsVertical, IconPencil } from '@tabler/icons-svelte';
	import { tick } from 'svelte';
	import { flip } from 'svelte/animate';
	import { quintOut } from 'svelte/easing';
	import { writable } from 'svelte/store';
	import { fly } from 'svelte/transition';

	export let data;
	let booksContainer: HTMLDivElement;
	async function moveDown(index: number, direction: 'up' | 'down') {
		if (index < 0) return;
		if (index + 1 === data.books.length) return;

		[data.books[index], data.books[index + 1]] = [data.books[index + 1], data.books[index]];

		const reorderedBooks = data.books.map((c, index) => {
			return {
				book_id: c.id,
				collection_id: data.collection.id,
				sort_order: index
			};
		});

		reorderBooksInCollection(reorderedBooks);

		await tick();
		const items = booksContainer.querySelectorAll('div.book-item-container');
		const indexFromDirection = direction === 'up' ? index : index + 1;
		const button = items[indexFromDirection].querySelector<HTMLButtonElement>(
			`button.${direction === 'up' ? 'up-button' : 'down-button'}`
		);
		if (button) {
			button.focus();
		}
	}

	const {
		elements: { trigger, menu, item },
		states: { open }
	} = createDropdownMenu({
		preventScroll: false,
		forceVisible: true,
		positioning: { placement: 'bottom-end' }
	});

	const editModalOpen = writable(false);
	let editModalInput: string = data.collection.name;

	async function handleEditModalSave() {
		try {
			await updateCollectionName(data.collection.id, editModalInput);
			addToast({ data: { title: 'Renamed collection successfully', color: '', description: '' } });
			invalidateAll();
		} catch {
			addToast({ data: { title: 'Cannot rename collection', color: '', description: '' } });
		}
	}
</script>

<InputModal
	modalTitle="Edit collection name"
	bind:inputValue={editModalInput}
	openStore={editModalOpen}
	onSave={handleEditModalSave}
	placeholder="New collection name"
	confirmText="Update"
	cancelText="Cancel"
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
	</div>
{/if}

<div class="container-mi py-6 flex flex-col gap-4">
	<div class="flex justify-between items-center">
		<h2 class="text-2xl font-bold">{data.collection.name}</h2>
		<button use:melt={$trigger} aria-label="Open collection options for {data.collection.name}">
			<IconDotsVertical />
		</button>
	</div>

	<div class="flex flex-col gap-4" bind:this={booksContainer}>
		{#each data.books as book, index (book.id)}
			<div animate:flip={{ duration: 450, easing: quintOut }}>
				<BookItem
					{book}
					moveUp={() => {
						moveDown(index - 1, 'up');
					}}
					moveDown={() => {
						moveDown(index, 'down');
					}}
				/>
			</div>
		{/each}
	</div>
</div>
