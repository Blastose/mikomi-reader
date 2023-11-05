<script lang="ts">
	import { beforeNavigate } from '$app/navigation';
	import { reorderCollections } from '$lib/bindings.js';
	import CollectionInputModal from '$lib/components/collections/CollectionInputModal.svelte';
	import CollectionItem from '$lib/components/collections/CollectionItem.svelte';
	import { mainStateStore } from '$lib/stores/mainStateStore';
	import { IconPlus } from '@tabler/icons-svelte';
	import { tick } from 'svelte';
	import { flip } from 'svelte/animate';
	import { quintOut } from 'svelte/easing';
	import { writable } from 'svelte/store';

	export let data;

	let openStore = writable(false);
	let inputValue: string = '';
	let collectionItemsContainer: HTMLDivElement;

	async function moveDown(index: number, direction: 'up' | 'down') {
		if (index < 0) return;
		if (index + 1 === data.collectionsWithBooks.length) return;

		[data.collectionsWithBooks[index], data.collectionsWithBooks[index + 1]] = [
			data.collectionsWithBooks[index + 1],
			data.collectionsWithBooks[index]
		];

		reorderCollectionsByCurrentPositions();

		await tick();
		const items = collectionItemsContainer.querySelectorAll('div.collection-item-container');
		const indexFromDirection = direction === 'up' ? index : index + 1;
		const button = items[indexFromDirection].querySelector<HTMLButtonElement>(
			`button.${direction === 'up' ? 'up-button' : 'down-button'}`
		);
		if (button) {
			button.focus();
		}
	}

	async function reorderCollectionsByCurrentPositions() {
		const reorderedCollections = data.collectionsWithBooks.map((c, index) => {
			return {
				id: c.collection.id,
				sort_order: index
			};
		});
		reorderCollections(reorderedCollections);
	}

	beforeNavigate(() => {
		mainStateStore.set('default');
	});
</script>

<CollectionInputModal {inputValue} {openStore} numCollections={data.collectionsWithBooks.length} />

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

	<div class="flex flex-col gap-6" bind:this={collectionItemsContainer}>
		{#each data.collectionsWithBooks as collectionWithBooks, index (collectionWithBooks.collection.id)}
			<div animate:flip={{ duration: 450, easing: quintOut }}>
				<CollectionItem
					{collectionWithBooks}
					moveUp={() => {
						moveDown(index - 1, 'up');
					}}
					moveDown={() => {
						moveDown(index, 'down');
					}}
					{reorderCollectionsByCurrentPositions}
				/>
			</div>
		{/each}
	</div>
</div>
