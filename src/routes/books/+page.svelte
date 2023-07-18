<script lang="ts">
	export let data;
</script>

<div>
	{#each data.books as book}
		<div>
			{book.title}|{book.id}|{book.path}
		</div>
	{/each}
</div>
