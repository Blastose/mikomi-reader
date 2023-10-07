<script lang="ts">
	import { convertFileSrc } from '@tauri-apps/api/tauri';
	import BookSwiper from '$lib/components/book/BookSwiper.svelte';
	import BookImageCard from '$lib/components/book/BookImageCard.svelte';

	export let data;

	function shuffleArray<T>(array: T[]) {
		for (let i = array.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[array[i], array[j]] = [array[j], array[i]];
		}
		return array;
	}

	$: recentlyReadBooks = data.books
		.filter((b) => b.settings?.percentage && b.settings?.percentage < 100)
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

	$: recentlyAddedBooks = data.books
		.filter((b) => !b.last_read)
		.sort((a, b) => b.date_added - a.date_added)
		.slice(0, 16);

	$: planToReadBooks = shuffleArray(data.books.filter((b) => b.reading_status === 'Plan to read'));
</script>

<div class="flex flex-col gap-2 py-6 container-mi">
	<div class="flex flex-col gap-4 sm:gap-8">
		<div class="flex flex-col gap-2 pb-4">
			<div>
				<h2 class="text-2xl font-bold">Recently read</h2>
				<p class="text-sm text-gray-500 dark:text-neutral-300">
					Hop back in where you last left off.
				</p>
			</div>

			<BookSwiper gapSize={'large'} let:scroll={disablePointerEvents}>
				{#each recentlyReadBooks.slice(0, 12) as book (book.id)}
					<a
						href="/book/{book.id}"
						class="min-w-[128px] sm:min-w-[200px] sm:max-w-[200px] flex flex-col gap-1 justify-end"
						class:pointer-events-none={disablePointerEvents}
					>
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
			</BookSwiper>
		</div>

		<hr class="dark:border-[#46464b]" />

		<div class="flex flex-col gap-2">
			<div>
				<h2 class="text-xl font-bold">Recently added</h2>
				<p class="text-sm text-gray-500 dark:text-neutral-300">Jump into a new book.</p>
			</div>
			<BookSwiper let:scroll={disablePointerEvents}>
				{#each recentlyAddedBooks as book (book.id)}
					<div class="item">
						<BookImageCard {book} {disablePointerEvents} />
					</div>
				{/each}
			</BookSwiper>
		</div>

		<hr class="dark:border-[#46464b]" />

		<div class="flex flex-col gap-2">
			<div>
				<h2 class="text-xl font-bold">Plan to read</h2>
				<p class="text-sm text-gray-500 dark:text-neutral-300">
					Pick up a random book from your backlog.
				</p>
			</div>
			<BookSwiper let:scroll={disablePointerEvents}>
				{#each planToReadBooks.slice(0, 16) as book (book.id)}
					<div class="item">
						<BookImageCard {book} {disablePointerEvents} />
					</div>
				{/each}
			</BookSwiper>
		</div>
	</div>
</div>

<style>
	.item {
		display: flex;
		justify-content: flex-end;
		flex: 0 0 25%;
	}

	@media (min-width: 640px) {
		.item {
			flex: 0 0 20%;
		}
	}
	@media (min-width: 768px) {
		.item {
			flex: 0 0 16%;
		}
	}
	@media (min-width: 1280px) {
		.item {
			flex: 0 0 14%;
		}
	}
	@media (min-width: 1536px) {
		.item {
			flex: 0 0 10%;
		}
	}
</style>
