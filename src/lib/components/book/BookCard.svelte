<script lang="ts">
	import type { BookWithAuthorsAndCover } from '$lib/bindings.js';
	import { IconDotsVertical } from '@tabler/icons-svelte';
	import { buildBase64ImageUrl } from '$lib/util/util';

	export let book: BookWithAuthorsAndCover;
</script>

<a href="/book/{book.id}" class="flex flex-col gap-2 justify-end">
	<div class="shadow-md overflow-hidden">
		{#if book.cover}
			<img
				class="object-cover object-top w-full h-full rounded-md duration-200 hover:scale-105"
				height="200"
				width="134"
				src={buildBase64ImageUrl(book.cover)}
				alt=""
			/>
		{:else}
			<div class="w-full h-full bg-gray-300 shadow-md" />
		{/if}
	</div>
	<div class="grid grid-cols-[1fr_min-content]">
		<div>
			<p class="font-bold line-clamp-2" title={book.title}>
				{book.title}
			</p>
			<p
				class="text-sm text-gray-600 dark:text-neutral-300 line-clamp-1"
				title={book.authors[0]?.name ?? 'No author'}
			>
				{book.authors[0]?.name ?? 'No author'}
			</p>
		</div>
		<div class="flex justify-center w-6 mt-1 duration-300 rounded-full h-min hover:bg-gray-200">
			<IconDotsVertical size={20} color="#999999" />
		</div>
	</div>
</a>
