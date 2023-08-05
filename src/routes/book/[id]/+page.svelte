<script lang="ts">
	import { buildBase64ImageUrl } from '$lib/util/util.js';
	import { IconBook } from '@tabler/icons-svelte';

	export let data;
</script>

<div class="relative">
	<div class="-mt-16 overflow-hidden">
		<div class="w-full h-48 blur">
			<img
				class="object-cover w-full h-full background-image"
				src={buildBase64ImageUrl(data.book.cover ?? '')}
				alt=""
			/>
		</div>
	</div>

	<div class="flex flex-col gap-4 container-mi">
		<div>
			<img class="rounded-md" src={buildBase64ImageUrl(data.book.cover ?? '')} alt="" />
		</div>

		<button
			class="flex items-center gap-2 px-6 py-2 text-white duration-300 rounded-md hover:bg-black bg-neutral-800 w-fit"
		>
			<IconBook />
			Read book
		</button>

		<div>
			<p>TOC</p>
			<p>Ch 1. Poggers in the house</p>
			<p>Ch 2. Poggers in the house</p>
			<p>Ch 3. Poggers in the house</p>
			<p>Ch 4. Poggers in the house</p>
			<p>Ch 5. Poggers in the house</p>
		</div>

		{#each { length: 34 } as _}
			<p>
				{data.book.book.id}
			</p>
		{/each}
	</div>
</div>

<style>
	.background-image {
		mask-image: linear-gradient(to bottom, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.65) 100%);
		-webkit-mask-image: linear-gradient(to bottom, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.65) 100%);
	}
</style>
