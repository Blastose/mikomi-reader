<script lang="ts">
	import type { BookWithAuthorsAndCoverAndSettingsAndCollections } from '$lib/bindings.js';
	import { IconBook } from '@tabler/icons-svelte';
	import { convertFileSrc } from '@tauri-apps/api/tauri';

	export let book: BookWithAuthorsAndCoverAndSettingsAndCollections;
</script>

<a href="/book/{book.id}" class="flex gap-4 @container">
	<div class="shadow-md overflow-hidden">
		{#if book.cover}
			<img
				class="object-cover object-top w-full h-full rounded-md duration-200"
				height="200"
				width="134"
				src={convertFileSrc(book.cover)}
				alt=""
			/>
		{:else}
			<div class="w-full h-full bg-gray-300 shadow-md" />
		{/if}
	</div>

	<div class="flex flex-col gap-2">
		<p class="font-bold line-clamp-2 @sm:line-clamp-none" title={book.title}>
			{book.title}
		</p>
		<p
			class="text-sm text-gray-600 dark:text-neutral-300 line-clamp-1"
			title={book.authors[0]?.name ?? 'No author'}
		>
			{book.authors[0]?.name ?? 'No author'}
		</p>

		<button
			class="flex items-center justify-center text-sm w-fit gap-2 px-4 py-2 font-bold text-white duration-300 rounded-md hover:bg-black bg-neutral-800 dark:bg-primary-100 dark:text-black dark:hover:bg-[#afafb6]"
		>
			<IconBook />
			Read book
		</button>
	</div>
</a>
