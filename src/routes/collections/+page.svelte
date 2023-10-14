<script lang="ts">
	import { beforeNavigate } from '$app/navigation';
	import CollectionInputModal from '$lib/components/collections/CollectionInputModal.svelte';
	import CollectionItem from '$lib/components/collections/CollectionItem.svelte';
	import { mainStateStore } from '$lib/stores/mainStateStore';
	import { IconPlus } from '@tabler/icons-svelte';
	import { flip } from 'svelte/animate';
	import { quintOut } from 'svelte/easing';
	import { writable } from 'svelte/store';

	export let data;

	let openStore = writable(false);
	let inputValue: string = '';

	function moveDown(index: number) {
		if (index + 1 === data.collectionsWithBooks.length) return;

		[data.collectionsWithBooks[index], data.collectionsWithBooks[index + 1]] = [
			data.collectionsWithBooks[index + 1],
			data.collectionsWithBooks[index]
		];
	}

	beforeNavigate(() => {
		mainStateStore.set('default');
	});
</script>

<CollectionInputModal {inputValue} {openStore} />

<div class="container-mi py-6 flex flex-col gap-6 w-full">
	{#if $mainStateStore !== 'reorderCollections'}
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
	{:else}
		<h2 class="text-2xl font-bold">Reorder Collections</h2>
	{/if}

	<div class="flex flex-col gap-6">
		{#each data.collectionsWithBooks as collectionWithBooks, index (collectionWithBooks.collection.id)}
			<div animate:flip={{ duration: 450, easing: quintOut }}>
				<CollectionItem
					{collectionWithBooks}
					moveUp={() => {
						moveDown(index - 1);
					}}
					moveDown={() => {
						moveDown(index);
					}}
				/>
			</div>
		{/each}
	</div>
</div>
