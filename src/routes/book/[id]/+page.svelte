<script lang="ts">
	import { buildBase64ImageUrl } from '$lib/util/util.js';
	import { IconBook } from '@tabler/icons-svelte';

	export let data;

	function resizeText(node: HTMLElement) {
		const parent = document.querySelector('div.title')!;
		const GAP_HEIGHT = 8;
		const AUTHOR_TEXT_HEIGHT = 24;
		while (node.clientHeight + GAP_HEIGHT + AUTHOR_TEXT_HEIGHT > parent.clientHeight) {
			node.style.fontSize = `${String(parseInt(node.style.fontSize) - 1)}px`;
			console.log(node.style.fontSize);
		}
	}
</script>

<div class="-mt-16 g container-mi">
	<div
		style={`background-image: url("${buildBase64ImageUrl(data.book.cover ?? '')}");`}
		class="bg-no-repeat bg-cover background-image -z-10 bg"
	>
		<div class="h-full a blur" />
	</div>

	<div class="filler" />

	<div class="cover min-w-[200px] max-w-[512px]">
		<img class="rounded-md" src={buildBase64ImageUrl(data.book.cover ?? '')} alt="" />
	</div>

	<div class="flex flex-col justify-between gap-1 py-2 title">
		<p use:resizeText style="font-size: 36px;" class="max-w-3xl text-4xl font-bold">
			{data.book.book.title}
		</p>
		<p class="font-bold">{data.book.authors[0]?.name ?? ''}</p>
	</div>

	<div class="flex flex-col gap-2 description">
		<button
			class="flex items-center gap-2 px-8 py-4 font-bold text-white duration-300 rounded-md hover:bg-black bg-neutral-800 w-fit"
		>
			<IconBook />
			Read book
		</button>
	</div>

	<div class="flex flex-col gap-4 content">
		<div class="flex flex-col gap-2">
			<p class="text-lg font-bold">Synopsis:</p>
			<p class="max-w-5xl">
				Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent ipsum nulla, pretium vitae
				velit sollicitudin, facilisis tempus orci. Nulla a sem facilisis, ullamcorper mi sed,
				vestibulum enim. Cras efficitur rutrum luctus. Maecenas tempus, arcu in lobortis ultricies,
				massa tellus interdum arcu, nec rhoncus massa est sit amet neque. Quisque volutpat, mauris
				eget iaculis dignissim, ipsum nibh maximus eros, nec molestie diam arcu sed augue. Aliquam
				efficitur, tellus ac rutrum congue, nunc nulla elementum sapien, nec laoreet justo metus
				vitae eros. Pellentesque imperdiet lectus nec ipsum elementum egestas. Quisque interdum
				ipsum quis elementum malesuada. Morbi vulputate vulputate sapien, a sodales sem faucibus ut.
				Maecenas ultricies ultricies velit eget ullamcorper. Class aptent taciti sociosqu ad litora
				torquent per conubia nostra, per inceptos himenaeos. Proin elementum turpis molestie, porta
				lectus quis, scelerisque risus. Sed sit amet mauris a urna hendrerit vulputate. Pellentesque
				feugiat varius mauris et tempor. Aliquam tristique massa a magna cursus, quis ultricies leo
				iaculis. Cras sed justo egestas, volutpat ipsum ut, rhoncus quam.
			</p>
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
	.a {
		backdrop-filter: blur(8px);
	}

	.g {
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
	}

	.cover {
		grid-area: cover;
	}

	.title {
		grid-area: title;
	}

	.description {
		grid-area: description;
	}

	.content {
		grid-area: content;
	}

	.background-image {
		mask-image: linear-gradient(to bottom, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.65) 100%);
		-webkit-mask-image: linear-gradient(to bottom, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.65) 100%);
	}
</style>
