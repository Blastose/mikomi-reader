<script lang="ts">
	import Reader from '$lib/components/reader/Reader.svelte';
	import type { Orientation } from '$lib/components/reader/utils.js';
	import { onDestroy, onMount } from 'svelte';
	import { loadEpub } from '$lib/components/reader/loadEpub.js';
	import { clearEpubStyles } from '$lib/components/reader/utils.js';

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
		<Reader
			bind:html
			bind:columnCount
			bind:fontSize
			bind:writingMode
			bind:readerNode
			bind:readerHeight
			bind:readerWidth
			bind:columnGap
		/>
	{/if}
</div>
