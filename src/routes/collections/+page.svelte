<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { addCollection } from '$lib/bindings';
	import CollectionItem from '$lib/components/collections/CollectionItem.svelte';
	import InputModal from '$lib/components/modal/InputModal.svelte';
	import { addToast } from '$lib/components/toast/ToastContainer.svelte';
	import { IconPlus } from '@tabler/icons-svelte';
	import { writable } from 'svelte/store';

	export let data;

	let openStore = writable(false);
	let inputValue: string = '';

	async function handleAddCollection() {
		try {
			await addCollection({ id: crypto.randomUUID(), name: inputValue });
			addToast({ data: { title: 'Created collection', color: '', description: '' } });
			await invalidateAll();
		} catch {
			addToast({ data: { title: 'Cannot create collection', color: '', description: '' } });
		}
	}
</script>

<InputModal
	modalTitle="Add new collection"
	{openStore}
	placeholder="Collection name"
	onSave={handleAddCollection}
	confirmText="Create collection"
	cancelText="Cancel"
	bind:inputValue
/>

<div class="container-mi py-6 flex flex-col gap-6 w-full">
	<button
		class="hover:bg-gray-100 dark:hover:bg-neutral-800 duration-300 border dark:border-[#6e6d72] font-bold flex items-center justify-center gap-4 rounded-md p-4"
		on:click={() => {
			inputValue = '';
			openStore.set(true);
		}}
	>
		<IconPlus />
		Create new collection
	</button>

	<div class="flex flex-col gap-6">
		{#each data.collectionsWithBooks as collectionWithBooks (collectionWithBooks.collection.id)}
			<CollectionItem {collectionWithBooks} />
		{/each}
	</div>
</div>
