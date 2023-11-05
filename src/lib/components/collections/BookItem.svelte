<script lang="ts">
	import type { BookWithCover, Collection } from '$lib/bindings';
	import { mainStateStore } from '$lib/stores/mainStateStore';
	import { IconChevronDown, IconChevronUp } from '@tabler/icons-svelte';
	import { convertFileSrc } from '@tauri-apps/api/tauri';
	import DOMPurify from 'dompurify';
	import BookItemDropdown from './BookItemDropdown.svelte';

	export let book: BookWithCover;
	export let collection: Collection;
	export let moveUp: () => void;
	export let moveDown: () => void;
</script>

<div
	class="book-item-container bg-neutral-200 dark:bg-neutral-700
      p-2 rounded-md
      grid grid-cols-[64px_1fr] gap-2 sm:gap-4"
>
	{#if book.cover}
		<a href="/book/{book.id}">
			<img class="rounded-md" src={convertFileSrc(book.cover)} alt="" />
		</a>
	{/if}

	<div class="flex flex-col justify-between">
		<div class="flex flex-col gap-1">
			<div class="flex justify-between gap-2">
				<p class="font-bold flex items-center">
					<a class="line-clamp-1" href="/book/{book.id}">{book.title}</a>
				</p>
				<BookItemDropdown {book} {collection} />
			</div>
			{#if book.description}
				<p class="line-clamp-2">{@html DOMPurify.sanitize(book.description)}</p>
			{/if}
		</div>

		{#if $mainStateStore === 'reorderCollections'}
			<div class="self-end flex gap-2">
				<button
					class="up-button rounded-full focus:bg-gray-300 focus:dark:bg-neutral-500 flex items-center justify-center h-8 w-8"
					on:click={moveUp}
				>
					<IconChevronUp />
				</button>
				<button
					class="down-button rounded-full focus:bg-gray-300 focus:dark:bg-neutral-500 flex items-center justify-center h-8 w-8"
					on:click={moveDown}
				>
					<IconChevronDown />
				</button>
			</div>
		{/if}
	</div>
</div>
