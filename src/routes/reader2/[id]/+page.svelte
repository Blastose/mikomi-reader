<script lang="ts">
	import Reader from '$lib/components/reader/Reader.svelte';
	import type { Orientation } from '$lib/components/reader/utils.js';
	import { onDestroy, onMount } from 'svelte';
	import { loadEpub } from '$lib/components/reader/loadEpub.js';
	import { clearEpubStyles } from '$lib/components/reader/utils.js';
	import { fade } from 'svelte/transition';

	export let data;

	let html: string;
	let loading = true;
	let columnCount: number;
	let fontSize: number;
	let writingMode: Orientation;

	let readerNode: HTMLDivElement;
	let readerHeight: number;
	let readerWidth: number;
	let columnGap = 24;
	let page: number;
	let totalPages: number;

	let blobUrls: string[] = [];

	onMount(async () => {
		clearEpubStyles();
		const epubData = await loadEpub(data.book.path);
		html = epubData.newHtml;
		blobUrls = epubData.blobUrls;

		loading = false;
	});

	onDestroy(() => {
		for (const url of blobUrls) {
			URL.revokeObjectURL(url);
		}
		clearEpubStyles();
	});
</script>

<div class="container px-12 py-8 mx-auto duration-150 flex flex-col">
	{#if loading}
		<p>Loading...</p>
	{:else}
		<div class="relative mt-4">
			<div class="absolute -top-8 left-1/2 -translate-x-1/2">
				{#key page}
					<p class="line-clamp-1 text-gray-500">
						{data.book.title}
					</p>
				{/key}
			</div>
			<Reader
				bind:html
				bind:columnCount
				bind:fontSize
				bind:writingMode
				bind:readerNode
				bind:readerHeight
				bind:readerWidth
				bind:columnGap
				bind:page
				bind:totalPages
			/>
			{#if columnCount === 1}
				<div class="absolute bottom-0 left-1/2 -translate-x-1/2">
					{#key page}
						<p class="text-gray-500">
							{page} of {totalPages}
						</p>
					{/key}
				</div>
			{:else}
				<div class="absolute bottom-0 left-1/4 -translate-x-1/4">
					{#key page}
						<p class="text-gray-500">
							{page * 2 - 1} of {totalPages * 2}
						</p>
					{/key}
				</div>
				<div class="absolute bottom-0 left-3/4 -translate-x-3/4">
					{#key page}
						<p class="text-gray-500">
							{page * 2} of {totalPages * 2}
						</p>
					{/key}
				</div>
			{/if}
		</div>
	{/if}
</div>
