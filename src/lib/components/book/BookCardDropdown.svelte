<script lang="ts">
	import { IconBook, IconDotsVertical, IconFolders, IconTrash } from '@tabler/icons-svelte';
	import { createDropdownMenu, melt } from '@melt-ui/svelte';
	import { fly } from 'svelte/transition';
	import {
		removeBook,
		type BookWithAuthorsAndCoverAndSettingsAndCollections,
		type Collection
	} from '$lib/bindings';
	import { writable } from 'svelte/store';
	import ConfirmModal from '$lib/components/modal/ConfirmModal.svelte';
	import { addToast } from '$lib/components/toast/ToastContainer.svelte';
	import { invalidateAll } from '$app/navigation';
	import { readBook } from './utils';
	import CollectionsModal from '$lib/components/collections/CollectionsModal.svelte';
	import { mainStateStore } from '$lib/stores/mainStateStore';

	export let book: BookWithAuthorsAndCoverAndSettingsAndCollections;
	export let collections: Collection[];

	const confirmModalOpen = writable(false);
	const collectionsModalOpen = writable(false);

	const {
		elements: { trigger, menu, item },
		states: { open }
	} = createDropdownMenu({
		preventScroll: false,
		forceVisible: true,
		positioning: { placement: 'bottom-end' }
	});
</script>

<button
	class="h-fit w-fit py-1 text-gray-500"
	class:hidden={$mainStateStore !== 'default'}
	on:click={(e) => {
		e.stopPropagation();
	}}
	use:melt={$trigger}
	aria-label="Open options for book {book.title}"
>
	<IconDotsVertical />
</button>

<CollectionsModal
	bookId={book.id}
	openStore={collectionsModalOpen}
	{collections}
	bookCollections={book.collections}
/>
<ConfirmModal
	modalTitle="Remove book"
	subText={`Are you sure you want to remove "${book.title}"? This will also remove any saved bookmarks or highlights.`}
	openStore={confirmModalOpen}
	onConfirm={async () => {
		try {
			removeBook(book.id);
			addToast({
				data: { title: 'Removed book successfully', color: '', description: '' }
			});
			invalidateAll();
		} catch {
			addToast({ data: { title: 'Unable to remove book', color: '', description: '' } });
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
				readBook(book, book.settings);
			}}
		>
			<IconBook />
			<span>Read</span>
		</button>
		<button
			class="text-left pr-6 pl-4 py-2 flex gap-4 hover:bg-neutral-600 duration-150 rounded-md"
			use:melt={$item}
			on:click={() => {
				collectionsModalOpen.set(true);
			}}
		>
			<IconFolders />
			<span>Add to collection</span>
		</button>
		<button
			class="text-left pr-6 pl-4 py-2 flex gap-4 hover:bg-neutral-600 duration-150 rounded-md"
			use:melt={$item}
			on:click={() => {
				confirmModalOpen.set(true);
			}}
		>
			<IconTrash />
			<span>Remove from library</span>
		</button>
	</div>
{/if}
