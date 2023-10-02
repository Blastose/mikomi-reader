<script lang="ts">
	import type { Bookmark } from '$lib/components/reader/utils';
	import BookmarkItem from './BookmarkItem.svelte';
	import { flip } from 'svelte/animate';
	import { createDialog, melt } from '@melt-ui/svelte';
	import { fade, fly } from 'svelte/transition';
	import { IconX } from '@tabler/icons-svelte';
	import { writable } from 'svelte/store';
	import { updateBookmark } from '$lib/bindings';

	export let bookmarks: Bookmark[];
	export let columnCount: number;
	export let onSidebarItemClickWithPage: (page: number) => void;
	export let onBookmarkItemDelete: (id: string) => void;

	const {
		elements: { overlay, content, title, close, portalled },
		states: { open }
	} = createDialog({
		forceVisible: true,
		preventScroll: false
	});

	const selectedBookmark = writable<Bookmark | null>(null);
	let newBookmarkNameInput: HTMLInputElement;

	function onBookmarkItemEdit(bookmark: Bookmark) {
		selectedBookmark.set(bookmark);
		open.set(true);
	}
</script>

<div class="flex flex-col gap-2">
	{#each bookmarks as bookmark, index (bookmark.id)}
		<div class="flex flex-col gap-2" animate:flip={{ duration: 300 }}>
			<BookmarkItem
				{bookmark}
				{columnCount}
				{onSidebarItemClickWithPage}
				{onBookmarkItemDelete}
				{onBookmarkItemEdit}
			/>
			{#if index !== bookmarks.length - 1}
				<hr />
			{/if}
		</div>
	{:else}
		<p>No bookmarks</p>
	{/each}
</div>

<div use:melt={$portalled}>
	{#if $open}
		<div
			transition:fade={{ duration: 150 }}
			use:melt={$overlay}
			class="fixed inset-0 z-50 bg-black/50"
		/>
		<div
			class="dialog-theme fixed left-[50%] top-[50%] z-50 max-h-[85vh] w-[90vw]
            max-w-[350px] translate-x-[-50%] translate-y-[-50%] rounded-xl bg-white
            p-6 shadow-lg"
			use:melt={$content}
			transition:fly={{
				duration: 150,
				y: -10,
				opacity: 0
			}}
		>
			<div class="flex flex-col gap-4">
				<h2 use:melt={$title} class="m-0 text-lg font-medium">Edit bookmark</h2>

				<label class="flex gap-2 items-center">
					<span>Name: </span>
					<input
						bind:this={newBookmarkNameInput}
						class="bg-neutral-700 rounded-md px-2 py-1"
						type="text"
						placeholder="Theme name"
						value={$selectedBookmark?.displayText ?? ''}
					/>
				</label>
				<button
					on:click={() => {
						if (!$selectedBookmark) return;

						$selectedBookmark.displayText = newBookmarkNameInput.value;
						updateBookmark($selectedBookmark.id, $selectedBookmark.displayText);
						bookmarks = bookmarks;
						open.set(false);
					}}
					class="bg-neutral-700 rounded-md p-2">Save</button
				>
			</div>

			<button
				use:melt={$close}
				aria-label="Close"
				class="absolute right-[10px] top-[10px] inline-flex p-1
            appearance-none items-center justify-center rounded-full text-neutral-200
            hover:bg-neutral-700 focus:shadow-neutral-400 focus:outline-none focus:ring-2
            focus:ring-neutral-400"
			>
				<IconX />
			</button>
		</div>
	{/if}
</div>
