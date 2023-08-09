<script lang="ts">
	import { buildBase64ImageUrl } from '$lib/util/util.js';
	import { IconBook, IconChevronUp } from '@tabler/icons-svelte';
	import { WebviewWindow } from '@tauri-apps/api/window';
	import { page } from '$app/stores';

	export let data;

	$: id = $page.params.id;

	let expandedSynopsis = false;
	let parentSynopsisElement: HTMLDivElement;
	let synopsisElement: HTMLParagraphElement;

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

	function resizeSynopsis() {
		if (expandedSynopsis) {
			parentSynopsisElement.style.maxHeight = `${synopsisElement.clientHeight}px`;
		} else {
			parentSynopsisElement.style.maxHeight = `96px`;
		}
	}

	function onWindowResize() {
		clearTimeout(timeout);
		timeout = setTimeout(() => {
			resizeTitle(titleElement);
			resizeSynopsis();
		}, delay);
	}

	function readBook() {
		new WebviewWindow(id, {
			url: `/reader/${id}`,
			height: 1070,
			width: 720
		});
	}
</script>

<svelte:window on:resize={onWindowResize} />

<div class="-mt-16 grid-container container-mi">
	<div
		style={`background-image:linear-gradient(rgba(255, 255, 255, 0.99), rgba(255, 255, 255, 0.5)), url("${buildBase64ImageUrl(
			data.book.cover ?? ''
		)}");`}
		class="bg-no-repeat bg-cover -z-10 bg"
	>
		<div class="h-full backdrop-blur" />
	</div>

	<div class="filler" />

	<div class="cover min-w-[128px] sm:min-w-[164px] md:min-w-[200px] max-w-[512px]">
		<img class="rounded-md shadow-md" src={buildBase64ImageUrl(data.book.cover ?? '')} alt="" />
	</div>

	<div id="title" class="flex flex-col gap-1 py-2 overflow-hidden">
		<p
			bind:this={titleElement}
			use:resizeTitle
			style="font-size: 36px;"
			class="max-w-3xl text-4xl font-bold"
		>
			{data.book.book.title}
		</p>
		<p class="text-xs line-clamp-1 sm:line-clamp-3 sm:text-sm">{data.book.authors[0]?.name}</p>
	</div>

	<div class="flex flex-col gap-2 description">
		<button
			on:click={readBook}
			class="flex items-center justify-center w-full gap-2 px-8 py-4 font-bold text-white duration-300 rounded-md hover:bg-black bg-neutral-800 sm:w-fit"
		>
			<IconBook />
			Read book
		</button>
	</div>

	<div class="flex flex-col gap-4 content">
		<div class="flex flex-col gap-2">
			<p class="text-lg font-bold">Synopsis:</p>
			<div
				bind:this={parentSynopsisElement}
				class="max-w-5xl overflow-hidden duration-300 max-h-24"
			>
				<p bind:this={synopsisElement}>
					Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent ipsum nulla, pretium
					vitae velit sollicitudin, facilisis tempus orci. Nulla a sem facilisis, ullamcorper mi
					sed, vestibulum enim. Cras efficitur rutrum luctus. Maecenas tempus, arcu in lobortis
					ultricies, massa tellus interdum arcu, nec rhoncus massa est sit amet neque. Quisque
					volutpat, mauris eget iaculis dignissim, ipsum nibh maximus eros, nec molestie diam arcu
					sed augue. Aliquam efficitur, tellus ac rutrum congue, nunc nulla elementum sapien, nec
					laoreet justo metus vitae eros. Pellentesque imperdiet lectus nec ipsum elementum egestas.
					Quisque interdum ipsum quis elementum malesuada. Morbi vulputate vulputate sapien, a
					sodales sem faucibus ut. Maecenas ultricies ultricies velit eget ullamcorper. Class aptent
					taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Proin
					elementum turpis molestie, porta lectus quis, scelerisque risus. Sed sit amet mauris a
					urna hendrerit vulputate. Pellentesque feugiat varius mauris et tempor. Aliquam tristique
					massa a magna cursus, quis ultricies leo iaculis. Cras sed justo egestas, volutpat ipsum
					ut, rhoncus quam.
				</p>
			</div>

			{#if synopsisElement?.clientHeight > 96}
				<button
					class="duration-300 flex items-center justify-center rounded-md hide-text-gradient
					{expandedSynopsis ? 'mt-0' : '-mt-8'}"
					on:click={() => {
						expandedSynopsis = !expandedSynopsis;
						resizeSynopsis();
					}}
					aria-label={expandedSynopsis ? 'Show less' : 'Show more'}
				>
					<IconChevronUp
						class="duration-200 ease-out {expandedSynopsis ? 'rotate-0' : 'rotate-180'}"
					/>
				</button>
			{/if}
		</div>

		<div>
			<p>TOC</p>
			<p>Ch 1. Poggers in the house</p>
			<p>Ch 2. Poggers in the house</p>
			<p>Ch 3. Poggers in the house</p>
			<p>Ch 4. Poggers in the house</p>
			<p>Ch 5. Poggers in the house</p>
		</div>

		{#each { length: 34 } as _}
			<p>
				{data.book.book.id}
			</p>
		{/each}
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
			rgba(255, 255, 255, 1) 90%,
			rgba(255, 255, 255, 1) 100%
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
