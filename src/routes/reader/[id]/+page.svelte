<script lang="ts">
	import { getEpub } from '$lib/bindings';
	import { onDestroy, onMount, tick } from 'svelte';
	import postcss from 'postcss';
	import prefixer from 'postcss-prefix-selector';
	import { IconLoader2 } from '@tabler/icons-svelte';
	import { createDialog, melt } from '@melt-ui/svelte';
	import { fade, fly } from 'svelte/transition';
	import Toc from './Toc.svelte';
	import { parseNavToc, parseNcxToc, type NavPoint } from './tocParser';

	const {
		elements: { trigger, overlay, content, title, description, close, portalled },
		states: { open }
	} = createDialog();

	export let data;

	function escapeCharacter(s: string) {
		return `\\${s}`;
	}

	function escapeSelectorCharacters(s: string) {
		const chars = ['/', '.'];
		let newString = '';
		for (const char of s) {
			if (chars.includes(char)) {
				newString = `${newString}${escapeCharacter(char)}`;
			} else {
				newString = `${newString}${char}`;
			}
		}
		return newString;
	}

	async function prefixCss(css: string) {
		const prefed = postcss()
			.use(
				// @ts-ignore
				prefixer({
					prefix: '.text-epub',
					transform(_prefix, selector, prefixedSelector, _file) {
						if (selector === 'body') {
							return 'div.new-body';
						} else {
							return prefixedSelector;
						}
					}
				})
			)
			.process(css).css;

		// console.log(prefed);
		return prefed;
	}

	const COLUMN_GAP = 16;

	let swipeScroll = false;

	let path: string;
	let readerWidth: number;
	let readerNode: HTMLDivElement;

	let html: string;

	let objectUrls: string[] = [];

	let tocData: NavPoint[] = [];

	function clearEpubStyles() {
		const styleNodes = document.querySelectorAll('style.epub-css') ?? [];
		for (const node of styleNodes) {
			node.remove();
		}
	}

	async function openFile() {
		loading = true;

		const t0 = performance.now();
		const { html: str2, img: imgs, css: csses, toc } = await getEpub(data.book.book.path);
		const parser = new DOMParser();

		console.log(toc);
		if (toc) {
			const tocDoc = parser.parseFromString(toc.content, 'text/html');
			console.log(tocDoc);
			console.log(toc.content);
			if (toc.kind === 'Nav') {
				toc.kind;
				const navElement = tocDoc.querySelector('nav > ol');
				if (navElement) {
					const res = parseNavToc(navElement);
					console.log(res);
					tocData = res;
				}
			} else {
				toc.kind;
				const navMap = tocDoc.querySelector('navMap');
				if (navMap) {
					const res = parseNcxToc(navMap);
					console.log(res);
					tocData = res;
				}
			}
		}

		clearEpubStyles();
		let newHtml = '';

		for (let [key, css] of Object.entries(csses)) {
			let newCss = await prefixCss(css);
			newCss = newCss.replaceAll(/font-size: *0/g, '');

			css = `.text-epub {${css}}`;
			const styleNode = document.createElement('style');
			styleNode.id = key;
			styleNode.classList.add('epub-css');
			styleNode.appendChild(document.createTextNode(newCss));
			document.head.appendChild(styleNode);
		}

		for (const s of str2) {
			const xmlDoc = parser.parseFromString(s[1], 'application/xhtml+xml');
			// console.log(xmlDoc);
			// console.log(s);

			const imgNodes: NodeListOf<HTMLImageElement> | never[] =
				xmlDoc.querySelector('body')?.querySelectorAll('img[src]') ?? [];
			// console.log(imgNodes);
			// console.log(imgs);
			for (const node of imgNodes) {
				const img = imgs[node.src];

				const blob = new Blob([new Uint8Array(img[0])]);
				const blobUrl = URL.createObjectURL(blob);
				node.src = blobUrl;
				node.setAttribute('width', String(img[1]));
				node.setAttribute('height', String(img[2]));
				objectUrls.push(blobUrl);
			}

			// Fix cover images' aspect ratios
			const svgNodes = xmlDoc.querySelectorAll('svg');
			for (const node of svgNodes) {
				node.removeAttribute('preserveAspectRatio');
			}

			const imageNodes: any = xmlDoc.querySelector('body')?.querySelectorAll('image');
			for (const node of imageNodes) {
				const img = imgs[node.getAttribute('xlink:href')];

				const blob = new Blob([new Uint8Array(img[0])]);
				const blobUrl = URL.createObjectURL(blob);
				node.setAttribute('xlink:href', blobUrl);
				node.setAttribute('width', String(img[1]));
				node.setAttribute('height', String(img[2]));
				objectUrls.push(blobUrl);
			}
			// console.log(xmlDoc.body.outerHTML);

			let bodyIdElement = '';
			if (xmlDoc.body.id) {
				bodyIdElement = `<span id="${xmlDoc.body.id}"></span>`;
			}
			newHtml += `<div id="${s[0]}" class="new-body ${xmlDoc.body.classList.toString()}">
					${bodyIdElement}${xmlDoc.body.outerHTML}
			</div>`;
		}
		const t1 = performance.now();
		console.log(`Call to doSomething took ${t1 - t0} milliseconds.`);

		// const st = document.createElement('style');
		// st.id = 'epub-style';
		// st.appendChild(document.createTextNode(css));
		// console.log(st);
		// console.log(st.sheet?.cssRules);
		// document.head.appendChild(st);
		await tick();
		html = newHtml;
		// TODO total pages is wrong; .scrollWidth is not correct, but
		// it corrects after the user scrolls
		await tick();
		loading = false;
		console.log(readerNode?.scrollWidth);
		// Adding the delay makes the .scrollWidth update to the correct value
		// Prob. because of the images loading?
		// Another solution is to give the image tag an explicit width/height
		// Can get it from rust?
		await delay(100);
		console.log('done waiting');
		console.log(readerNode.scrollWidth);
		totalPages = Math.ceil(readerNode.scrollWidth / (readerWidth + COLUMN_GAP));
	}

	const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

	function prevPage() {
		readerNode.scrollLeft -= readerWidth + COLUMN_GAP;
		updateCurrentPage();
	}
	function nextPage() {
		// readerNode.scrollTo({
		// 	left: readerNode.scrollLeft + readerWidth + COLUMN_GAP,
		// 	behavior: 'smooth'
		// });
		readerNode.scrollLeft += readerWidth + COLUMN_GAP;
		updateCurrentPage();
	}

	function updateDisplayedPage(pageNumber: number) {
		readerNode.scrollLeft = (pageNumber - 1) * (readerWidth + COLUMN_GAP);
	}

	function snapToPage() {
		const currentLeft = readerNode.scrollLeft;
		// We want the current left to snap to a page position if
		// it is inbetween
		// e.g. currentLeft = 800, page1 = 686, page2 = 1302, snap to page1;
		//
	}

	function updateCurrentPage() {
		currentPage = 1 + Math.ceil(readerNode.scrollLeft / (readerWidth + COLUMN_GAP));
	}

	function onKeyDown(e: KeyboardEvent) {
		if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ') {
			e.preventDefault();
			nextPage();
		} else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
			e.preventDefault();
			prevPage();
		} else if (e.key === 'a') {
			console.log(readerNode?.scrollLeft);
			console.log(readerNode?.scrollWidth);
		}
	}

	function onScroll(e: WheelEvent) {
		if (e.deltaY > 0) {
			nextPage();
		} else if (e.deltaY < 0) {
			prevPage();
		}
	}

	function onPointerStart(e: PointerEvent) {
		startX = e.clientX;
	}

	function onPointerEnd(e: PointerEvent) {
		if (!swipeScroll) return;
		const deltaX = e.clientX - startX;
		if (deltaX > 100) {
			prevPage();
		} else if (deltaX < -100) {
			nextPage();
		}
	}

	function onDocumentClick(e: MouseEvent) {
		const target = e.target as HTMLAnchorElement | null;
		const a = target?.closest('a');

		if (a?.tagName === 'A') {
			e.preventDefault();
			anchorClick(a);
		}
	}

	function anchorClick(a: HTMLAnchorElement) {
		const id = a.href.replace(/^epub:\/\//, '').replace(/#.*$/, '');
		const hash = a.hash;
		let cssQuerySelector = '';
		if (hash) {
			cssQuerySelector = `#${escapeSelectorCharacters(id)} ${escapeSelectorCharacters(hash)}`;
		} else {
			cssQuerySelector = `#${escapeSelectorCharacters(id)}`;
		}
		let el = document.querySelector<HTMLElement>(cssQuerySelector);
		if (!el) return;

		readerNode.scrollLeft =
			Math.floor(el.offsetLeft / (readerWidth + COLUMN_GAP)) * (readerWidth + COLUMN_GAP);
		updateCurrentPage();
		history.pushState(currentPage, '');
	}

	$: history.replaceState({ page: currentPage }, '');

	let loading = true;
	let currentPage = 1;
	let totalPages = 1;

	let fontSize = 20;

	let startX = 0;

	let maxHeight = 0;

	$: console.log(readerNode?.scrollLeft);

	function onPopstate(e: PopStateEvent) {
		e.preventDefault();
		if (e.state?.page) {
			currentPage = e.state.page;
			updateDisplayedPage(currentPage);
		}
	}

	function onResize() {
		totalPages = Math.ceil(readerNode.scrollWidth / (readerWidth + COLUMN_GAP));
	}

	let onResizeTimeout: ReturnType<typeof setTimeout>;
	function debouncedOnResize() {
		clearTimeout(onResizeTimeout);
		onResizeTimeout = setTimeout(onResize, 500);
	}

	onMount(async () => {
		await openFile();
	});

	onDestroy(() => {
		// Clean up any `Blob` objects we created to prevent memory leaks
		for (const url of objectUrls) {
			URL.revokeObjectURL(url);
		}

		// Remove any css style tags we added from the epubs
		clearEpubStyles();
	});
</script>

<svelte:window
	on:keydown={onKeyDown}
	on:wheel={onScroll}
	on:pointerdown={onPointerStart}
	on:pointerup={onPointerEnd}
	on:popstate={onPopstate}
	on:resize={debouncedOnResize}
/>

<svelte:document on:click={onDocumentClick} />

<div use:melt={$portalled}>
	{#if $open}
		<div
			use:melt={$overlay}
			class="fixed inset-0 z-50 bg-black/50"
			transition:fade={{ duration: 150 }}
		/>
		<div
			use:melt={$content}
			class="fixed left-0 top-0 z-50 h-screen w-full max-w-[350px] bg-white p-6
            shadow-lg focus:outline-none"
			transition:fly={{
				x: -350,
				duration: 300,
				opacity: 1
			}}
		>
			<button
				use:melt={$close}
				aria-label="Close"
				class="absolute right-[10px] top-[10px] inline-flex h-6 w-6
                appearance-none items-center justify-center rounded-full text-gray-800
                hover:bg-gray-100 focus:shadow-gray-400 focus:outline-none focus:ring-2
                focus:ring-gray-400"
			>
				X
			</button>
			<h2 use:melt={$title} class="mb-0 text-lg font-medium text-black">Table of Contents</h2>
			<section>
				<Toc {tocData} />
			</section>
		</div>
	{/if}
</div>

<div class="fixed flex justify-between w-screen h-screen pointer-events-none">
	<button
		aria-label="previous page"
		on:click={prevPage}
		class="w-10 h-full duration-300 pointer-events-auto fill-slate-500 hover:fill-slate-50 hover:bg-slate-700"
		><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
			><title>chevron-left</title><path
				d="M15.41,16.58L10.83,12L15.41,7.41L14,6L8,12L14,18L15.41,16.58Z"
			/></svg
		></button
	>
	<button
		aria-label="next page"
		on:click={nextPage}
		class="w-10 h-full duration-300 pointer-events-auto fill-slate-500 hover:fill-slate-50 hover:bg-slate-700"
		><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
			><title>chevron-right</title><path
				d="M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z"
			/></svg
		></button
	>
</div>

<main class="container px-12 py-8 mx-auto duration-150">
	<div class="flex gap-2">
		<p class="line-clamp-1">
			p:{currentPage}/{totalPages}|{readerNode?.scrollLeft}|{readerNode?.scrollWidth}|{readerWidth}|{path}
		</p>
		<a href="#toc-004" on:click={() => {}}>Jump Test</a>
		<button
			on:click={() => {
				console.log(history);
				history.back();
			}}>Back</button
		>
		<button use:melt={$trigger}>Open TOC</button>
	</div>

	<div class="h-12" />

	{#if loading}
		<IconLoader2 class="animate-spin" />
		<p>Loading...</p>
	{/if}

	{#if html}
		<div
			style="--max-height: {maxHeight}px; font-size: {fontSize}px !important;"
			class="text-epub text-lr"
			bind:this={readerNode}
			bind:clientHeight={maxHeight}
			bind:offsetWidth={readerWidth}
		>
			{@html html}
		</div>
		<input
			on:input={(e) => {
				console.log(e.currentTarget.value);
				updateDisplayedPage(Number(e.currentTarget.value));
			}}
			type="range"
			class="w-full slider"
			min={1}
			max={totalPages}
			bind:value={currentPage}
		/>
		<div class="flex items-center gap-2">
			<button
				class="btn"
				on:click={() => {
					fontSize -= 4;
				}}>-</button
			>
			<button
				class="btn"
				on:click={() => {
					fontSize += 4;
				}}>+</button
			>
			<input
				on:keydown={(e) => {
					if (e.key === 'Enter') {
						updateDisplayedPage(Number(e.currentTarget.value));
						updateCurrentPage();
						e.currentTarget.value = '';
					}
				}}
				class="input input-bordered"
				type="number"
				min={1}
				max={totalPages}
			/>
			{currentPage !== totalPages ? (((currentPage - 1) / totalPages) * 100).toFixed(2) : 100}%
		</div>
	{/if}
</main>

<style>
	:global(html) {
		scrollbar-gutter: auto !important;
	}

	:global(img),
	:global(image),
	:global(svg:has(image)) {
		max-height: var(--max-height);
		max-width: 100%;
		height: auto;
		object-fit: contain;
	}

	:global(svg > image) {
		height: 100%;
		width: 100%;
	}

	.text-epub {
		font-family: 'ヒラギノ角ゴ Pro W3', 'Hiragino Kaku Gothic Pro', 'メイリオ', Meiryo,
			'ＭＳ Ｐゴシック', sans-serif;
		user-select: text;
		max-height: calc(100dvh - 200px);
		height: 100vh;
		max-width: 100%;
		overflow-y: hidden;
		overflow-x: hidden;
		column-count: 1;
		column-fill: auto;
		/* column-gap needs to match the variable `columnGap` above */
		column-gap: 16px;
		scroll-snap-type: x mandatory;
		writing-mode: horizontal-tb !important;
		-epub-writing-mode: horizontal-tb !important;
		-webkit-writing-mode: horizontal-tb !important;
		text-orientation: sideways !important;
	}

	:global(div.new-body) {
		writing-mode: horizontal-tb !important;
		-epub-writing-mode: horizontal-tb !important;
		-webkit-writing-mode: horizontal-tb !important;
		text-orientation: sideways !important;
	}

	.text-lr :global(*) {
		text-indent: 0 !important;
	}

	.text-epub :global(img) {
		display: inline;
	}

	.text-epub > :global(div) {
		break-before: column;
	}

	.text-epub :global(a) {
		color: inherit !important;
	}

	.text-epub :global(rt) {
		user-select: none;
	}
</style>
