<script lang="ts">
	export let data;
</script>

<div class="container px-4 py-6 mx-auto">
	<div class="flex flex-col gap-4">
		<p class="text-xl font-bold text-gray-500">Recently Added</p>
		{#await data.streamed.books}
			<div>Loading..........</div>
		{:then books}
			<div class="grid grid-cols-2 gap-4 sm:grid-cols-4 md:grid-cols-6">
				{#each books as book}
					<a href="/book/{book.book.id}" class="flex flex-col gap-1">
						<div class="shadow-md overflow-hidden w-full h-[200px] md:h-60">
							{#if book.cover}
								<img
									class="object-cover object-top w-full h-full duration-200 hover:scale-105"
									height="200"
									width="140"
									src="data:image/jpeg;base64, {book.cover}"
									alt=""
								/>
							{:else}
								<div class="w-full h-full bg-gray-300 shadow-md" />
							{/if}
						</div>
						<div>
							<p class="font-bold line-clamp-2" title={book.book.title}>
								{book.book.title}
							</p>
							<p class="text-sm text-gray-600 line-clamp-1">Author</p>
						</div>
					</a>
				{/each}
			</div>
		{/await}
	</div>
</div>
