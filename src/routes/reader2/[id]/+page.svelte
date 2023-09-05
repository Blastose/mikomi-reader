<script lang="ts">
	import Reader from '$lib/components/reader/Reader.svelte';
	import type { Orientation } from '$lib/components/reader/utils.js';
	import { onDestroy, onMount, tick } from 'svelte';
	import { loadEpub } from '$lib/components/reader/loadEpub.js';
	import { calculateTocPageNumbers, clearEpubStyles } from '$lib/components/reader/utils.js';
	import { IconBookmark, IconSearch, IconLetterCase } from '@tabler/icons-svelte';
	import Drawer from '$lib/components/reader/Drawer.svelte';
	import type { NavPoint } from '$lib/components/reader/toc/tocParser';
	import { writable } from 'svelte/store';

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
	let currentPage: number;
	let totalPages: number;
	let pageSize: number;

	let blobUrls: string[] = [];

	let tocData: NavPoint[] = [];
	let drawerOpen = writable(false);

	onMount(async () => {
		clearEpubStyles();
		const epubData = await loadEpub(data.book.path);
		html = epubData.newHtml;
		blobUrls = epubData.blobUrls;
		tocData = epubData.tocNavs;

		loading = false;
		await tick();
		calculateTocPageNumbers(readerNode, writingMode, pageSize, tocData);
		tocData = tocData;
	});

	onDestroy(() => {
		for (const url of blobUrls) {
			URL.revokeObjectURL(url);
		}
		clearEpubStyles();
	});
</script>

<div class="px-12 py-8 mx-auto duration-150 flex flex-col">
	{#if loading}
		<p>Loading...</p>
	{:else}
		<div class="relative mt-4">
			<div
				class="absolute -top-8 w-full gap-6 left-0 text-gray-500 flex justify-between items-center"
			>
				<div class="flex gap-1 items-center">
					<Drawer {currentPage} {tocData} {drawerOpen} />
				</div>
				<div>
					<p class="line-clamp-1">
						{data.book.title}
					</p>
				</div>
				<div class="flex gap-1 items-center">
					<IconLetterCase />
					<IconSearch />
					<IconBookmark />
				</div>
			</div>
			<Reader
				on:pageresize={async () => {
					await tick();
					calculateTocPageNumbers(readerNode, writingMode, pageSize, tocData);
					tocData = tocData;
				}}
				bind:html
				bind:columnCount
				bind:fontSize
				bind:writingMode
				bind:readerNode
				bind:readerHeight
				bind:readerWidth
				bind:columnGap
				bind:currentPage
				bind:totalPages
				bind:pageSize
				{drawerOpen}
			/>
			<div
				class="absolute bottom-0 w-full flex -z-50
				{columnCount === 1 ? 'justify-center' : 'justify-around'}"
			>
				{#if columnCount === 1}
					<p class="text-gray-500">
						{currentPage} of {totalPages}
					</p>
				{:else}
					<p class="text-gray-500">
						{currentPage * 2 - 1} of {totalPages * 2}
					</p>
					<p class="text-gray-500">
						{currentPage * 2} of {totalPages * 2}
					</p>
				{/if}
			</div>
			<div class="text-gray-500 absolute bottom-0 w-full flex justify-end -z-50">
				<p>
					{currentPage !== totalPages ? (((currentPage - 1) / totalPages) * 100).toFixed(0) : 100}%
				</p>
			</div>
		</div>
	{/if}
</div>
