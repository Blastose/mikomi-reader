<script lang="ts">
	import { convertFileSrc } from '@tauri-apps/api/tauri';
	import BookSwiper from '$lib/components/book/BookSwiper.svelte';

	export let data;

	let recentlyAddedBooks = data.books
		.filter((b) => !b.last_read)
		.sort((a, b) => b.date_added - a.date_added)
		.slice(0, 20);

	let recentlyReadBooks = data.books
		.filter((_) => true)
		.sort((a, b) => {
			if (a.last_read && b.last_read) {
				return b.last_read - a.last_read;
			}
			if (a.last_read && !b.last_read) {
				return -1;
			}
			if (b.last_read && !a.last_read) {
				return 1;
			}

			return 0;
		});
</script>

<div class="flex flex-col gap-2 py-6 container-mi">
	<div class="flex flex-col gap-2">
		<div class="flex flex-col gap-2">
			<h2 class="text-xl font-bold">Recently read</h2>
			<div class="flex items-end gap-2">
				{#each recentlyReadBooks.slice(0, 4) as book}
					<a href="/book/{book.id}" class="flex-1 flex flex-col max-w-[200px] gap-1">
						{#if book.cover}
							<img class="rounded-md shadow-md" src={convertFileSrc(book.cover)} alt="" />
						{/if}
						<div class="flex flex-col">
							<p class="hidden text-sm sm:text-base font-bold sm:line-clamp-1">
								{book.title}
							</p>
							<p class="text-sm sm:text-base text-gray-500 dark:text-neutral-300">
								{book.settings?.percentage || 0}%
							</p>
						</div>
					</a>
				{/each}
			</div>
		</div>

		<div class="flex flex-col gap-2">
			<h2 class="text-xl font-bold">Recently added</h2>
			<BookSwiper books={recentlyAddedBooks} />
		</div>
	</div>
</div>
