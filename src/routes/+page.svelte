<script lang="ts">
	import { buildBase64ImageUrl } from '$lib/util/util.js';

	export let data;
</script>

<div class="flex flex-col gap-2 py-6 container-mi">
	<div class="flex flex-col gap-2">
		<h2 class="text-xl font-bold">Recently read</h2>
		<div class="flex items-end gap-2">
			{#each data.books.slice(-4) as book}
				<a href="/book/{book.book.id}" class="flex-1 flex flex-col max-w-[200px] gap-1">
					{#if book.cover}
						<img class="rounded-md shadow-md" src={buildBase64ImageUrl(book.cover)} alt="" />
					{/if}
					<div class="flex flex-col">
						<p class="text-sm sm:text-base font-bold line-clamp-1">{book.book.title}</p>
						<p class="text-sm sm:text-base text-gray-500">{Math.floor(Math.random() * 100)}%</p>
					</div>
				</a>
			{/each}
		</div>
	</div>
</div>
