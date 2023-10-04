<script lang="ts">
	import BookCard from '$lib/components/book/BookCard.svelte';

	export let data;
</script>

<div class="py-6 container-mi">
	<div class="flex flex-col gap-4 @container">
		<div class="grid grid-cols-2 gap-4 @md:grid-cols-4 @4xl:grid-cols-6 @7xl:grid-cols-8">
			{#each data.books as book}
				<BookCard {book} />
			{/each}
		</div>
	</div>
</div>
