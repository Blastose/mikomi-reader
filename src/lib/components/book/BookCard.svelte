<script lang="ts">
	import { goto } from '$app/navigation';
	import type {
		BookWithAuthorsAndCoverAndSettingsAndCollections,
		Collection
	} from '$lib/bindings.js';
	import { convertFileSrc } from '@tauri-apps/api/tauri';
	import BookCardDropdown from './BookCardDropdown.svelte';
	import { mainStateStore } from '$lib/stores/mainStateStore';
	import { selectedBookMapStore } from '$lib/stores/mainStateStore';

	export let book: BookWithAuthorsAndCoverAndSettingsAndCollections;
	export let collections: Collection[];
</script>

<div
	on:click={() => {
		if ($mainStateStore === 'default') {
			goto(`/book/${book.id}`);
		} else if ($mainStateStore === 'multiselect') {
			selectedBookMapStore.toggle(book.id);
		}
	}}
	on:keydown={(e) => {
		if (e.key !== 'Enter' || e.currentTarget !== e.target) return;
		if ($mainStateStore === 'default') {
			e.preventDefault();
			goto(`/book/${book.id}`);
		} else if ($mainStateStore === 'multiselect') {
			selectedBookMapStore.toggle(book.id);
		}
	}}
	role="link"
	tabindex="0"
	class="cursor-pointer flex p-1 flex-col gap-2 justify-end rounded-md"
	class:bg-blue-500={$selectedBookMapStore.get(book.id)}
>
	<div class="shadow-md overflow-hidden">
		{#if book.cover}
			<img
				class="object-cover object-top w-full h-full rounded-md duration-200 hover:scale-105"
				height="200"
				width="134"
				src={convertFileSrc(book.cover)}
				alt=""
			/>
		{:else}
			<div class="w-full h-full bg-gray-300 shadow-md" />
		{/if}
	</div>
	<div class="grid grid-cols-[1fr_min-content] gap-1">
		<div>
			<p
				class="font-bold line-clamp-2"
				class:text-white={$selectedBookMapStore.get(book.id)}
				title={book.title}
			>
				{book.title}
			</p>
			<p
				class="text-sm text-gray-600 dark:text-neutral-300 line-clamp-1"
				class:text-neutral-300={$selectedBookMapStore.get(book.id)}
				title={book.authors[0]?.name ?? 'No author'}
			>
				{book.authors[0]?.name ?? 'No author'}
			</p>
		</div>
		<BookCardDropdown {book} {collections} />
	</div>
</div>
