<script lang="ts">
	import { addBookmark, getBook, getEpub, removeBookmark } from '$lib/bindings';
	import { onDestroy, onMount, tick } from 'svelte';
	import postcss from 'postcss';
	import prefixer from 'postcss-prefix-selector';
	import { IconChevronLeft, IconChevronRight, IconLoader2, IconX } from '@tabler/icons-svelte';
	import { createDialog, melt } from '@melt-ui/svelte';
	import { fade, fly } from 'svelte/transition';
	import Toc from '$lib/components/reader/toc/Toc.svelte';
	import { parseNavToc, parseNcxToc, type NavPoint } from '$lib/components/reader/toc/tocParser';
	import Bookmarks from './Bookmarks.svelte';
	import { window as tauriWindow } from '@tauri-apps/api';
	import { TauriEvent } from '@tauri-apps/api/event';
	import ReaderSidebar from './ReaderSidebar.svelte';
	import { addToast } from '$lib/components/toast/ToastContainer.svelte';
	import { WebviewWindow } from '@tauri-apps/api/window';

	// tauriWindow.getCurrent().listen(TauriEvent.WINDOW_CLOSE_REQUESTED, async () => {
	// 	console.log('alsdkjalsd');
	// 	await tauriWindow.getCurrent().close();
	// });

	const {
		elements: { trigger, overlay, content, title, description, close, portalled },
		states: { open }
	} = createDialog();

	export let data;

	function escapeCharacter(s: string) {
		return `\\${s}`;
	}

	function escapeFirstCharacterIfItStartsWithANumber(s: string) {
		if (s.length === 0) {
			return s;
		}

		if (!(s[0] >= '0' && s[0] <= '9')) {
			return s;
		}

		return `\\3${s[0]} ${s.substring(1)}`;
	}

	function escapeSelectorCharacters(s: string) {
		const chars = ['/', '.'];
		let newString = '';

		s = escapeFirstCharacterIfItStartsWithANumber(s);

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

	const COLUMN_GAP = 24;

	let swipeScroll = false;
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
		const { html: str2, img: imgs, css: csses, toc } = await getEpub(data.book.path);
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
					const res = parseNavToc(navElement, toc.path);
					console.log(res);
					tocData = res;
				}
			} else {
				toc.kind;
				const navMap = tocDoc.querySelector('navMap');
				if (navMap) {
					const res = parseNcxToc(navMap, toc.path);
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

		for (const [index, s] of str2.entries()) {
			const xmlDoc = parser.parseFromString(s.html_content, 'application/xhtml+xml');
			// console.log(xmlDoc);
			// console.log(s);

			const imgNodes: NodeListOf<HTMLImageElement> | never[] =
				xmlDoc.querySelector('body')?.querySelectorAll('img[src]') ?? [];
			// console.log(imgNodes);
			// console.log(imgs);
			for (const node of imgNodes) {
				const img = imgs[node.src];

				const blob = new Blob([new Uint8Array(img.data)]);
				const blobUrl = URL.createObjectURL(blob);
				node.src = blobUrl;
				node.setAttribute('width', String(img.width));
				node.setAttribute('height', String(img.height));
				objectUrls.push(blobUrl);
			}

			// Fix cover images' aspect ratios
			const svgNodes = xmlDoc.querySelectorAll('svg');
			for (const node of svgNodes) {
				node.removeAttribute('preserveAspectRatio');
			}

			const imageNodes: any = xmlDoc.querySelectorAll('body image');
			for (const node of imageNodes) {
				const img = imgs[node.getAttribute('xlink:href')];

				const blob = new Blob([new Uint8Array(img.data)]);
				const blobUrl = URL.createObjectURL(blob);
				node.setAttribute('xlink:href', blobUrl);
				node.setAttribute('width', String(img.width));
				node.setAttribute('height', String(img.height));
				objectUrls.push(blobUrl);
			}
			// console.log(xmlDoc.body.outerHTML);

			let bodyIdElement = '';
			if (xmlDoc.body.id) {
				bodyIdElement = `<span id="${xmlDoc.body.id}"></span>`;
			}
			newHtml += `<div id="${s.id}" class="new-body ${xmlDoc.body.classList.toString()}">
					${index === 0 ? '<div id="text-epub-start"></div>' : ''}
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
		readerNode.scrollTop -= readerHeight + COLUMN_GAP;
		updateCurrentPage();
	}
	function nextPage() {
		readerNode.scrollLeft += readerWidth + COLUMN_GAP;
		readerNode.scrollTop += readerHeight + COLUMN_GAP;
		updateCurrentPage();
	}

	let disabledNextPageSmooth = false;
	function smoothScrollTo(scrollLeft: number) {
		if (disabledNextPageSmooth) return;
		if (scrollLeft < 0 || scrollLeft > readerNode.scrollWidth) return;
		disabledNextPageSmooth = true;
		const targetScrollLeft =
			scrollLeft > readerNode.scrollLeft
				? Math.ceil(scrollLeft / (readerWidth + COLUMN_GAP)) * (readerWidth + COLUMN_GAP)
				: Math.floor(scrollLeft / (readerWidth + COLUMN_GAP)) * (readerWidth + COLUMN_GAP);
		const currentScrollLeft = readerNode.scrollLeft;

		const duration = 300;
		function easeOutQuint(t: number) {
			return 1 + --t * t * t * t * t;
		}

		const startTime = performance.now();
		function scroll(timestamp: number) {
			const elapsed = timestamp - startTime;
			const progress = Math.min(elapsed / duration, 1);
			const easedProgress = easeOutQuint(progress);

			const newScrollLeft =
				currentScrollLeft + (targetScrollLeft - currentScrollLeft) * easedProgress;
			readerNode.scrollLeft = newScrollLeft;

			if (progress < 1) {
				requestAnimationFrame(scroll);
			}
		}

		requestAnimationFrame(scroll);
		updateCurrentPage();
		disabledNextPageSmooth = false;
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

	function calculatePageFromScrollLeft(scrollLeft: number) {
		return 1 + Math.ceil(scrollLeft / (readerWidth + COLUMN_GAP));
	}

	function calculatePageFromScrollTop(scrollTop: number) {
		return 1 + Math.ceil(scrollTop / (readerHeight + COLUMN_GAP));
	}

	function updateCurrentPage() {
		if (writingMode === 'hori') {
			currentPage = calculatePageFromScrollLeft(readerNode.scrollLeft);
		} else {
			currentPage = calculatePageFromScrollTop(readerNode.scrollTop);
		}
	}

	function onKeyDown(e: KeyboardEvent) {
		if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === 'd' || e.key === ' ') {
			e.preventDefault();
			nextPage();
		} else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp' || e.key === 'a') {
			e.preventDefault();
			prevPage();
		} else if (e.key === 'l') {
			console.log(readerNode?.scrollLeft);
			console.log(readerNode?.scrollWidth);
		}
	}

	function onScroll(e: WheelEvent) {
		if ($open) return;

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
			if (!a.href.startsWith('epub://')) return;
			anchorClick(a);
		}
	}

	function anchorClick(a: HTMLAnchorElement) {
		const id = a.href.replace(/^epub:\/\//, '').replace(/#.*$/, '');
		const hash = a.hash.split('#')[1];
		let cssQuerySelector = '';
		if (hash) {
			cssQuerySelector = `#${escapeSelectorCharacters(id)} #${escapeSelectorCharacters(hash)}`;
		} else {
			cssQuerySelector = `#${escapeSelectorCharacters(id)}`;
		}
		let el = document.querySelector<HTMLElement>(cssQuerySelector);
		if (!el) return;

		readerNode.scrollLeft =
			Math.floor(el.offsetLeft / (readerWidth + COLUMN_GAP)) * (readerWidth + COLUMN_GAP);

		readerNode.scrollTop =
			Math.floor(el.offsetTop / (readerHeight + COLUMN_GAP)) * (readerHeight + COLUMN_GAP);
		updateCurrentPage();
		history.pushState(currentPage, '');

		open.set(false);
	}

	$: history.replaceState({ page: currentPage }, '');

	let loading = true;
	let currentPage = 1;
	let totalPages = 1;

	let fontSize = 16;
	let columnCount = 1;
	let writingMode: 'vert' | 'hori' = 'hori';

	let startX = 0;

	let readerHeight = 0;

	$: console.log(`scrollLeft: ${readerNode?.scrollLeft}`);
	$: console.log(`scrollWidth: ${readerNode?.scrollWidth}`);
	$: console.log(`offsetWidth: ${readerNode?.offsetWidth}`);

	function onPopstate(e: PopStateEvent) {
		e.preventDefault();
		if (e.state?.page) {
			currentPage = e.state.page;
			updateDisplayedPage(currentPage);
		}
	}

	function onResize() {
		totalPages = Math.ceil(readerNode.scrollWidth / (readerWidth + COLUMN_GAP));
		readerNode.scrollLeft =
			Math.floor(readerNode.scrollLeft / (readerWidth + COLUMN_GAP)) * (readerWidth + COLUMN_GAP);
		calculateTocPageNumbers(tocData);
		tocData = tocData;
	}

	let onResizeTimeout: ReturnType<typeof setTimeout>;
	function debouncedOnResize() {
		clearTimeout(onResizeTimeout);
		onResizeTimeout = setTimeout(onResize, 500);
	}

	function calculateTocPageNumbers(d: NavPoint[]) {
		for (const a of d) {
			const [id2, hash] = a.content.split('#');
			const id = id2.replace(/^epub:\/\//, '');

			let cssQuerySelector = '';
			if (hash) {
				cssQuerySelector = `#${escapeSelectorCharacters(id)} #${escapeSelectorCharacters(hash)}`;
			} else {
				cssQuerySelector = `#${escapeSelectorCharacters(id)}`;
			}
			let el = document.querySelector<HTMLElement>(cssQuerySelector);
			if (!el) return;

			const scrollLeft =
				Math.floor(el.offsetLeft / (readerWidth + COLUMN_GAP)) * (readerWidth + COLUMN_GAP);
			a.page = calculatePageFromScrollLeft(scrollLeft);
			calculateTocPageNumbers(a.children);
		}
	}

	function jumpToHTMLElement(el: HTMLElement) {
		console.log(el);
		readerNode.scrollLeft =
			Math.floor(el.offsetLeft / (readerWidth + COLUMN_GAP)) * (readerWidth + COLUMN_GAP);
		updateCurrentPage();
		history.pushState(currentPage, '');
	}

	function getSelector(el: Element) {
		if (el.classList.contains('text-epub')) return 'body';
		const names = [];

		while (el.parentElement && !el.classList.contains('text-epub')) {
			if (el.id) {
				names.push('#' + escapeSelectorCharacters(el.getAttribute('id')!));
				break;
			} else {
				let count = 1;
				let e = el;
				while (e.previousElementSibling) {
					e = e.previousElementSibling;
					count++;
				}
				names.push(el.tagName.toLowerCase() + ':nth-child(' + count + ')');
			}

			el = el.parentElement;
		}
		return names.reverse().join(' > ');
	}

	function getCurrentElementOnPage() {
		let el: HTMLElement | null = null;
		let foundPage = -1;
		const validTagNames = ['P', 'SPAN', 'DIV', 'IMG', 'IMAGE', 'SECTION'];
		for (const e of document.querySelectorAll<HTMLElement>('.text-epub *')) {
			if (!validTagNames.includes(e.tagName)) {
				continue;
			}

			const rect = e.getBoundingClientRect();
			let res =
				rect.top >= 0 &&
				rect.left >= 0 &&
				rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
				rect.right <= (window.innerWidth || document.documentElement.clientWidth);
			if (res) {
				// TODO change this for vertical-rl
				const scrollLeft =
					Math.floor(e.offsetLeft / (readerWidth + COLUMN_GAP)) * (readerWidth + COLUMN_GAP);
				const page = calculatePageFromScrollLeft(scrollLeft);

				if (page !== currentPage) {
					continue;
				}

				el = e;
				foundPage = page;
				break;
			}
		}

		if (!el) {
			addToast({ data: { title: 'Cannot add bookmark on this page', description: '', color: '' } });
			return;
		}

		const selector = getSelector(el);
		console.log(selector);
		console.log(document.querySelector(selector));

		bookmarks.push({ el, page: foundPage });
		bookmarks = bookmarks;
		console.log(bookmarks);

		addBookmark({
			book_id: data.book.id,
			css_selector: selector,
			date_added: Math.floor(Date.now() / 1000),
			display_text: `Bookmark #${bookmarks.length}`,
			id: crypto.randomUUID()
		});
		addToast({ data: { title: 'Added bookmark', description: '', color: '' } });
	}

	let bookmarks: { el: HTMLElement; page?: number }[] = [];

	onMount(async () => {
		await openFile();

		calculateTocPageNumbers(tocData);
		bookmarks = data.book.bookmarks.map((e) => {
			const el = document.querySelector(e.css_selector)! as HTMLElement;
			const scrollLeft =
				Math.floor(el.offsetLeft / (readerWidth + COLUMN_GAP)) * (readerWidth + COLUMN_GAP);
			return {
				el,
				page: calculatePageFromScrollLeft(scrollLeft)
			};
		});
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
			class="fixed left-0 top-0 overflow-y-auto z-50 h-screen w-full max-w-[550px] bg-white p-6 pt-12
            shadow-lg focus:outline-none"
			transition:fly={{
				x: -550,
				duration: 300
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
				<IconX />
			</button>
			<ReaderSidebar />
			<h2 use:melt={$title} class="mb-4 text-lg font-medium text-black">Table of Contents</h2>
			<section>
				<Toc {tocData} {currentPage} {columnCount} />
			</section>

			<h2 use:melt={$title} class="mb-4 text-lg font-medium text-black">Bookmarks</h2>
			<section class="flex flex-col gap-2">
				{#each bookmarks as bookmark, index}
					<div class="flex justify-between">
						<button
							class="text-left"
							on:click={() => {
								jumpToHTMLElement(bookmark.el);
							}}
						>
							Bookmark #{index}
						</button>
						<span>{bookmark.page}</span>
					</div>
				{/each}
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
		<button
			on:click={async () => {
				// Need to get updated settings
				const book = await getBook(data.book.id);

				new WebviewWindow(`${data.book.id}2`, {
					url: `/reader2/${data.book.id}`,
					height: data.book.settings?.height ?? 860,
					width: data.book.settings?.width ?? 512,
					title: `${data.book.title} - Mikomi Reader`
				});
			}}>2</button
		>
		<p class="line-clamp-1">
			p:{currentPage}/{totalPages}|
			{readerNode?.scrollLeft.toFixed(2)}
			|{readerNode?.scrollWidth}|{readerWidth}
		</p>
		<button on:click={getCurrentElementOnPage}>Get It</button>
		<Bookmarks {bookmarks} onClick={jumpToHTMLElement} />
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
			style="--column-gap: {COLUMN_GAP}px; --column-count: {columnCount}; --max-height: {readerHeight *
				0.95}px; --max-width: {readerWidth}px; font-size: {fontSize}px !important;"
			class="text-epub text-lr {writingMode === 'hori'
				? 'writing-horizontal-tb'
				: 'writing-vertical-rl'}"
			bind:this={readerNode}
			bind:clientHeight={readerHeight}
			bind:clientWidth={readerWidth}
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
			<section class="flex">
				<button
					class="hover:bg-slate-200 rounded-full text-slate-700 duration-300"
					on:click={() => {
						smoothScrollTo(readerNode.scrollLeft - readerWidth + COLUMN_GAP);
					}}
					aria-label="Prev page"><IconChevronLeft /></button
				>
				<button
					class="hover:bg-slate-200 rounded-full text-slate-700 duration-300"
					on:click={() => {
						smoothScrollTo(readerNode.scrollLeft + readerWidth + COLUMN_GAP);
					}}
					aria-label="Next page"><IconChevronRight /></button
				>
			</section>
			{currentPage !== totalPages ? (((currentPage - 1) / totalPages) * 100).toFixed(2) : 100}%
			<button
				on:click={() => {
					columnCount = columnCount === 1 ? 2 : 1;
				}}>ColCount</button
			>
			<button
				on:click={() => {
					writingMode = writingMode === 'hori' ? 'vert' : 'hori';
				}}>Writing Dir</button
			>
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
		max-height: var(--max-height) !important;
		max-width: 100%;
		/* TODO Need to set max-height/max-width separately depending on writing-mode  */
		/* max-height: 100%??? */
		/* max-width: var(--max-width) !important; */
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
		width: 100vw;
		max-width: 100%;
		overflow-y: hidden;
		overflow-x: hidden;
		column-count: var(--column-count);
		column-fill: auto;
		/* column-gap needs to match the variable `columnGap` above */
		column-gap: var(--column-gap);
		/* column-rule: 1px solid rgb(233, 234, 236); */
		scroll-snap-type: x mandatory;
		/* writing-mode: horizontal-tb !important;
		-epub-writing-mode: horizontal-tb !important;
		-webkit-writing-mode: horizontal-tb !important;
		text-orientation: sideways !important; */
	}

	.text-epub.writing-vertical-rl {
		column-count: 1 !important;
	}

	.writing-horizontal-tb :global(div.new-body) {
		writing-mode: horizontal-tb !important;
		-epub-writing-mode: horizontal-tb !important;
		-webkit-writing-mode: horizontal-tb !important;
	}

	.writing-vertical-rl :global(div.new-body) {
		writing-mode: vertical-rl !important;
		-epub-writing-mode: vertical-rl !important;
		-webkit-writing-mode: vertical-rl !important;
	}

	.writing-horizontal-tb {
		writing-mode: horizontal-tb !important;
		-epub-writing-mode: horizontal-tb !important;
		-webkit-writing-mode: horizontal-tb !important;
	}

	.writing-vertical-rl {
		writing-mode: vertical-rl !important;
		-epub-writing-mode: vertical-rl !important;
		-webkit-writing-mode: vertical-rl !important;
	}

	.text-epub :global(img) {
		display: inline;
	}

	.text-epub > :global(div.new-body) {
		break-before: column;
		break-inside: auto;
	}

	.text-epub :global([epub\:type='pagebreak']) {
		break-before: column;
		display: block;
	}

	.text-epub :global(a) {
		color: inherit !important;
	}

	.text-epub :global(rt) {
		user-select: none;
	}
</style>
