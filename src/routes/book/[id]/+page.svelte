<script lang="ts">
	import { convertFileSrc } from '@tauri-apps/api/tauri';
	import { IconBook, IconChevronUp, IconFolders } from '@tabler/icons-svelte';
	import { WebviewWindow } from '@tauri-apps/api/window';
	import { page } from '$app/stores';
	import { themeStore } from '$lib/stores/themeStore.js';
	import { updateBook } from '$lib/bindings.js';
	import CollectionsModal from '$lib/components/collections/CollectionsModal.svelte';
	import { writable } from 'svelte/store';
	import ReadingStatus from '$lib/components/book/ReadingStatus.svelte';
	import DOMPurify from 'dompurify';

	export let data;

	$: id = $page.params.id;

	let modalOpen = writable(false);

	let expandedDescription = false;
	let parentDescriptionElement: HTMLDivElement;
	let descriptionElement: HTMLParagraphElement;

	let titleElement: HTMLParagraphElement;
	let timeout: ReturnType<typeof setTimeout>;
	let delay = 300;

	function resizeTitle(node: HTMLElement) {
		const parent = document.querySelector('div#title')!;
		node.style.fontSize = '36px';
		node.style.lineHeight = '40px';
		let textHeightOverflow = parent.scrollHeight > parent.clientHeight;
		let textWidthOverflow = parent.scrollWidth > parent.clientWidth;
		while (textHeightOverflow || textWidthOverflow) {
			if (parseInt(node.style.fontSize) === 0) {
				node.style.fontSize = '4px';
				node.style.lineHeight = '0px';
				break;
			}
			node.style.fontSize = `${String(parseInt(node.style.fontSize) - 4)}px`;
			node.style.lineHeight = `${String(parseInt(node.style.fontSize) + 6)}px`;
			textHeightOverflow = parent.scrollHeight > parent.clientHeight;
			textWidthOverflow = parent.scrollWidth > parent.clientWidth;
		}
	}

	function resizeDescription() {
		if (expandedDescription) {
			parentDescriptionElement.style.maxHeight = `${descriptionElement.clientHeight}px`;
		} else {
			parentDescriptionElement.style.maxHeight = `96px`;
		}
	}

	function onWindowResize() {
		clearTimeout(timeout);
		timeout = setTimeout(() => {
			resizeTitle(titleElement);
			resizeDescription();
		}, delay);
	}

	function readBook() {
		updateBook({ ...data.book, last_read: Math.floor(Date.now() / 1000) });
		const newUrl = `/reader/${id}`;
		new WebviewWindow(id, {
			url: newUrl,
			height: data.book.settings?.height ?? 860,
			width: data.book.settings?.width ?? 512,
			title: `${data.book.title} - Mikomi Reader`,
			visible: false
		});
	}
</script>

<svelte:window on:resize={onWindowResize} />

<CollectionsModal
	bookId={id}
	openStore={modalOpen}
	collections={data.collections}
	bookCollections={data.book.collections}
/>

<div class="-mt-16 pb-8 grid-container container-mi">
	<div
		style:background-image={$themeStore === 'dark'
			? `linear-gradient(rgba(43, 43, 43, 0.99), rgba(43, 43, 43, 0.5)), url("${convertFileSrc(
					data.book.cover ?? ''
			  )}")`
			: `linear-gradient(rgba(255, 255, 255, 0.99), rgba(255, 255, 255, 0.5)), url("${convertFileSrc(
					data.book.cover ?? ''
			  )}")`}
		class="bg-no-repeat bg-cover -z-10 bg"
	>
		<div class="h-full backdrop-blur" />
	</div>

	<div class="filler" />

	<div class="cover min-w-[128px] sm:min-w-[164px] md:min-w-[200px] max-w-[512px]">
		<img class="rounded-md shadow-md" src={convertFileSrc(data.book.cover ?? '')} alt="" />
	</div>

	<div id="title" class="flex flex-col gap-1 py-2 overflow-hidden">
		<p
			bind:this={titleElement}
			use:resizeTitle
			style="font-size: 36px;"
			class="max-w-3xl text-4xl font-bold"
		>
			{data.book.title}
		</p>
		<p class="text-xs line-clamp-1 sm:line-clamp-3 sm:text-sm">
			{data.book.authors.at(0)?.name ?? ''}
		</p>
	</div>

	<div class="flex flex-wrap gap-2 description">
		<button
			on:click={readBook}
			class="flex items-center justify-center h-fit w-full gap-2 px-12 py-4 font-bold text-white duration-300 rounded-md
			 hover:bg-black bg-neutral-800 dark:bg-primary-100 dark:text-black dark:hover:bg-[#afafb6] sm:w-fit"
		>
			<IconBook />
			Read book
		</button>

		<ReadingStatus book={data.book} currentStatus={data.book.reading_status} />

		<button
			on:click={() => {
				modalOpen.set(true);
			}}
			class="text-black flex items-center justify-center h-fit w-full gap-2 px-8 py-4 font-bold duration-300 rounded-md
			hover:bg-neutral-400 bg-neutral-300 dark:bg-neutral-600 dark:text-white dark:hover:bg-neutral-700 sm:w-fit"
		>
			<IconFolders />
			Add to collection
		</button>
	</div>

	<div class="flex flex-col gap-12 content">
		<div class="flex flex-col gap-2">
			<p class="text-lg font-bold">Description:</p>
			<div
				bind:this={parentDescriptionElement}
				class="max-w-5xl overflow-hidden duration-300 max-h-24"
			>
				<p bind:this={descriptionElement}>
					{@html DOMPurify.sanitize(data.book.description ?? 'No description')}
				</p>
			</div>

			{#if descriptionElement?.clientHeight > 96}
				<button
					class="duration-300 flex flex-col items-center justify-center rounded-md hide-text-gradient
					{expandedDescription ? 'mt-0' : '-mt-8'}"
					on:click={() => {
						expandedDescription = !expandedDescription;
						resizeDescription();
					}}
					aria-label={expandedDescription ? 'Show less' : 'Show more'}
				>
					<IconChevronUp
						class="duration-200 ease-out {expandedDescription ? 'rotate-0' : 'rotate-180'}"
					/>
					<span class="-mt-2 text-xs">{expandedDescription ? 'Show less' : 'Show more'}</span>
				</button>
			{/if}
		</div>

		<hr class="dark:border-[#46464b]" />

		<div class="flex flex-col gap-2">
			<h3 class="text-xl font-bold">Info:</h3>

			<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
				<div class="flex flex-col">
					<p class="font-bold">Language</p>
					<p>{data.book.language}</p>
				</div>

				<div class="flex flex-col">
					<p class="font-bold">Author(s)</p>
					{#each data.book.authors as author}
						<p>{author.name}</p>
					{/each}
				</div>

				<div class="flex flex-col">
					<p class="font-bold">Reading progress</p>
					<p>{data.book.settings?.percentage ?? 0}%</p>
				</div>

				<div class="flex flex-col">
					<p class="font-bold">Last read</p>
					{#if data.book.last_read}
						<p>{new Date(data.book.last_read * 1000).toLocaleDateString()}</p>
					{:else}
						<p>Not yet read</p>
					{/if}
				</div>

				<div class="flex flex-col">
					<p class="font-bold">Published on</p>
					<p>{data.book.published_date?.split('T').at(0) ?? 'N/A'}</p>
				</div>

				<div class="flex flex-col">
					<p class="font-bold">Last modified</p>
					<p>{data.book.last_modified?.split('T').at(0) ?? 'N/A'}</p>
				</div>

				<div class="flex flex-col">
					<p class="font-bold">Publisher</p>
					<p>{data.book.publisher ?? 'N/A'}</p>
				</div>

				<div class="flex flex-col">
					<p class="font-bold">Identifier</p>
					<p>{data.book.identifier ?? 'N/A'}</p>
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	.grid-container {
		display: grid;
		grid-template-columns: min-content 1fr;
		grid-template-rows: 64px 196px min-content 1fr;
		grid-template-areas:
			'filler filler'
			'cover title'
			'cover description'
			'content content';

		column-gap: 1rem;
		row-gap: 1rem;
	}

	.filler {
		grid-area: filler;
	}

	.bg {
		grid-row: 1 / 3;
		grid-column: 1 / 3;
		width: 100vw;
		margin-left: calc(-50vw + 50%);
		background-position: 20% 20%;
	}

	.cover {
		grid-area: cover;
	}

	#title {
		grid-area: title;
	}

	.description {
		grid-row: 3;
		grid-column: 1 / 3;
	}

	.hide-text-gradient {
		background: linear-gradient(
			rgba(0, 0, 0, 0) 0%,
			rgba(255, 255, 255, 0.781) 50%,
			rgba(255, 255, 255, 1) 100%
		);
	}

	:global(.dark) .hide-text-gradient {
		background: linear-gradient(
			rgba(255, 255, 255, 0) 0%,
			rgba(43, 43, 43, 0.781) 50%,
			rgba(43, 43, 43, 1) 100%
		);
	}

	@media (min-width: 640px) {
		.description {
			grid-row: 3;
			grid-column: 2 / 3;
		}
	}

	.content {
		grid-area: content;
	}
</style>
