<script lang="ts">
	import BookCard from '$lib/components/book/BookCard.svelte';
	import BookSearch from '$lib/components/form/BookSearch.svelte';

	export let data;
</script>

<div class="py-6 container-mi">
	<div class="flex flex-col gap-4 @container">
		<BookSearch searchText={data.queryData.searchQuery} readingStatuses={data.queryData.statuses} />

		{#if data.books.length > 0}
			<p class="book-count font-bold text-lg">{data.books.length} books</p>
			<div class="grid grid-cols-2 gap-4 @md:grid-cols-4 @4xl:grid-cols-6 @7xl:grid-cols-8">
				{#each data.books as book}
					<BookCard {book} />
				{/each}
			</div>
		{:else}
			<div class="flex items-center justify-center">
				<p class="dark:bg-neutral-700 text-lg px-4 py-4 rounded-sm w-full text-center">
					No books found.
				</p>
			</div>
		{/if}
	</div>
</div>

<style>
	.book-count {
		view-transition-name: book-count;
	}
</style>
