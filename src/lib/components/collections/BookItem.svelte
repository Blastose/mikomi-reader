<script lang="ts">
	import type { BookWithCover } from '$lib/bindings';
	import { mainStateStore } from '$lib/stores/mainStateStore';
	import { IconChevronDown, IconChevronUp } from '@tabler/icons-svelte';
	import { convertFileSrc } from '@tauri-apps/api/tauri';

	export let book: BookWithCover;
	export let moveUp: () => void;
	export let moveDown: () => void;
</script>

<div
	class="book-item-container dark:bg-neutral-700
      p-2 rounded-md
      grid grid-cols-[64px_1fr] gap-2"
>
	{#if book.cover}
		<img class="rounded-md" src={convertFileSrc(book.cover)} alt="" />
	{/if}

	<div class="flex flex-col justify-between">
		<p class="font-bold">
			<a class="line-clamp-1" href="/book/{book.id}">{book.title}</a>
		</p>

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
