<script lang="ts">
	import CollectionInputModal from '$lib/components/collections/CollectionInputModal.svelte';
	import CollectionItem from '$lib/components/collections/CollectionItem.svelte';
	import { IconPlus } from '@tabler/icons-svelte';
	import { writable } from 'svelte/store';

	export let data;

	let openStore = writable(false);
	let inputValue: string = '';
</script>

<CollectionInputModal {inputValue} {openStore} />

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
