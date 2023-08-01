<script lang="ts">
	import { setCache } from '$lib/cache/cache.js';
	import { page } from '$app/stores';
	import BookCard from '$lib/components/book/BookCard.svelte';
	import BookCardSkeleton from '$lib/components/book/BookCardSkeleton.svelte';

	export let data;

	(async function () {
		let loadedData = await data.streamed.books;
		setCache($page.url.toString(), loadedData);
	})();
</script>

<div class="container px-4 py-6 mx-auto duration-[450ms]">
	<div class="flex flex-col gap-4">
		<p class="text-xl font-bold text-gray-500">Recently Added</p>
		<div class="grid grid-cols-2 gap-4 sm:grid-cols-4 md:grid-cols-6">
			{#await data.streamed.books}
				{#each { length: 15 } as _}
					<BookCardSkeleton />
				{/each}
			{:then books}
				{#each books as book}
					<BookCard data={book} />
				{/each}
			{/await}
		</div>
	</div>
</div>
