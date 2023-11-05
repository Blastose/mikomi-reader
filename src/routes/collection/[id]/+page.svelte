<script lang="ts">
	import { reorderBooksInCollection } from '$lib/bindings.js';
	import BookItem from '$lib/components/collections/BookItem.svelte';
	import { tick } from 'svelte';
	import { flip } from 'svelte/animate';
	import { quintOut } from 'svelte/easing';

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
</script>

<div class="container-mi py-6 flex flex-col gap-4">
	<h2 class="text-2xl font-bold">{data.collection.name}</h2>

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
