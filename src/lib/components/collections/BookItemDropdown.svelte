<script lang="ts">
	import { IconDotsVertical, IconTrash } from '@tabler/icons-svelte';
	import { createDropdownMenu, melt } from '@melt-ui/svelte';
	import { fly } from 'svelte/transition';
	import { type BookWithCover, removeBookFromCollection, type Collection } from '$lib/bindings';
	import { writable } from 'svelte/store';
	import ConfirmModal from '$lib/components/modal/ConfirmModal.svelte';
	import { addToast } from '$lib/components/toast/ToastContainer.svelte';
	import { invalidateAll } from '$app/navigation';

	export let collection: Collection;
	export let book: BookWithCover;

	const confirmModalOpen = writable(false);

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
	class="h-fit w-fit py-1 text-gray-500 dark:text-neutral-300"
	use:melt={$trigger}
	aria-label="Open collection options for book {book.title}"
>
	<IconDotsVertical />
</button>

<ConfirmModal
	modalTitle="Remove book from {collection.name}"
	subText={`Are you sure you want to remove this book from ${collection.name}?`}
	openStore={confirmModalOpen}
	onConfirm={async () => {
		try {
			removeBookFromCollection(book.id, collection.id);
			addToast({
				data: { title: 'Removed book from collection successfully', color: '', description: '' }
			});
			invalidateAll();
		} catch {
			addToast({
				data: { title: 'Unable to remove book from collection', color: '', description: '' }
			});
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
				confirmModalOpen.set(true);
			}}
		>
			<IconTrash />
			<span>Remove from collection</span>
		</button>
	</div>
{/if}
