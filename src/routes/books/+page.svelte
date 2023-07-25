<script lang="ts">
	export let data;

	function getI(i: number[] | null) {
		if (!i) {
			return null;
		}

		const imageBytes = i;
		const blob = new Blob([new Uint8Array(imageBytes)]);
		return URL.createObjectURL(blob);
	}
</script>

<div>
	{#each data.books as book}
		<div>
			{book.book.title}|{book.book.id}|{book.book.path}
		</div>
		<!-- {@const a = getI(book.cover)} -->
		{#if book.cover}
			<img height="100" width="100" src="data:image/jpeg;base64, {book.cover}" alt="" />
		{/if}
	{/each}
</div>
