import type { NavPoint } from '$lib/components/reader/toc/tocParser';

export type Bookmark = {
	id: string;
	displayText: string;
	element: HTMLElement;
	cssSelector: string;
	dateAdded: number;
	page?: number;
	chapter?: string;
};

export function smoothScrollTo(
	scrollTo: number,
	node: HTMLElement,
	pageSize: number,
	onFinish?: () => void
) {
	const targetScrollLeft =
		scrollTo > node.scrollLeft
			? Math.ceil(scrollTo / pageSize) * pageSize
			: Math.floor(scrollTo / pageSize) * pageSize;
	const currentScrollLeft = node.scrollLeft;
	const targetScrollTop =
		scrollTo > node.scrollTop
			? Math.ceil(scrollTo / pageSize) * pageSize
			: Math.floor(scrollTo / pageSize) * pageSize;
	const currentScrollTop = node.scrollTop;

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
		node.scrollLeft = newScrollLeft;
		const newScrollTop = currentScrollTop + (targetScrollTop - currentScrollTop) * easedProgress;
		node.scrollTop = newScrollTop;

		if (progress < 1) {
			requestAnimationFrame(scroll);
		} else {
			if (onFinish) onFinish();
		}
	}

	requestAnimationFrame(scroll);
}

/**
 * Gets a selector to a Element or Text node
 *
 * If the element is a text node, it will be at the end of the selector
 * and marked by a $text$`parentChildNodeIndex`
 *
 * Can be used with Range.startContainer if it is a text node
 */
export function getSelector(el: Element | Text): string {
	const names: string[] = [];
	if (el instanceof Text) {
		if (!el.parentElement) return names.toString();
		const textNodeIndex = Array.from(el.parentElement.childNodes).indexOf(el);
		el = el.parentElement;
		names.push(`$text$${textNodeIndex}`);
	} else {
		if (el.classList.contains('text-epub')) return 'body';
	}

	while (el.parentElement && !el.classList.contains('text-epub')) {
		if (el.id) {
			// We know if el.id is true, getAttribute('id') also exists
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			names.push('#' + CSS.escape(el.getAttribute('id')!));
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

/**
 * Gets the element by a selector return from {@link getSelector}
 *
 * Similar to `document.querySelector`, but can get text nodes
 *
 * @param selector - a selector return from {@link getSelector}
 * @returns
 */
export function getNodeBySelector(selector: string): Node | null {
	let isTextNode = false;
	let childIndex = -1;
	const match = selector.match('\\$text\\$\\d$');
	if (match) {
		isTextNode = true;
		const textNodeAndIndex = match[0];
		childIndex = parseInt(textNodeAndIndex.split('$text$')[1]);
	}
	const [selectorSplit] = selector.split(' > $text');
	const node = document.querySelector(selectorSplit);
	if (!node) return null;

	if (isTextNode) {
		const textNode = Array.from(node.childNodes)[childIndex];
		return textNode as Node | null;
	} else {
		return node;
	}
}

export type Orientation = 'horizontal' | 'vertical';

/**
 * Gets the page from scroll
 *
 * @param scroll - scrollLeft or scrollTop of the containing element
 * @param pageSize - width/height of reader + column gap
 * @returns
 */
export function getPageFromScroll(scroll: number, pageSize: number) {
	return 1 + Math.ceil(scroll / pageSize);
}

export function getScrollAlignedToPageFloor(scroll: number, pageSize: number) {
	return Math.floor(scroll / pageSize) * pageSize;
}

export function getScrollAlignedToPageCeil(scroll: number, pageSize: number) {
	return Math.floor(scroll / pageSize) * pageSize;
}

export function goToPage(node: HTMLElement, page: number, pageSize: number) {
	const newScroll = (page - 1) * pageSize;
	node.scrollLeft = newScroll;
	node.scrollTop = newScroll;
	return newScroll;
}

export function createSelectorFromEpubUri(uri: string): string {
	// epub://{chapterId}#{hash}
	uri = uri.replace(/^epub:\/\//, '');
	const [chapterId, hash] = uri.split('#');

	const selector = `#${CSS.escape(chapterId)} ${hash ? `#${CSS.escape(hash)}` : ''}`;
	return selector;
}

export function getFirstVisibleElementInParentElement(
	containerElement: HTMLElement,
	orientation: Orientation
) {
	let foundElement: HTMLElement | null = null;
	let partialElement: HTMLElement | null = null;
	const validTagNames = ['P', 'SPAN', 'DIV', 'IMG', 'IMAGE', 'SECTION'];
	const containerRect = containerElement.getBoundingClientRect();
	for (const possibleElement of containerElement.querySelectorAll<HTMLElement>('*')) {
		if (!validTagNames.includes(possibleElement.tagName)) {
			continue;
		}

		const rect = possibleElement.getBoundingClientRect();
		const isVisible =
			rect.top >= containerRect.top &&
			rect.bottom <= containerRect.bottom &&
			rect.left >= containerRect.left &&
			rect.right <= containerRect.right;
		if (isVisible) {
			foundElement = possibleElement;
			break;
		}

		// Element crosses over to a new page
		if (orientation === 'horizontal') {
			if (
				rect.top >= containerRect.top &&
				rect.bottom <= containerRect.bottom &&
				rect.right <= containerRect.right
			) {
				partialElement = possibleElement;
			}
		} else {
			if (
				rect.top >= containerRect.top &&
				rect.bottom <= containerRect.bottom &&
				rect.left >= containerRect.left
			) {
				partialElement = possibleElement;
			}
		}
	}

	return foundElement ?? partialElement;
}

export function clearEpubStyles() {
	const styleNodes = document.querySelectorAll('style.epub-css') ?? [];
	for (const node of styleNodes) {
		node.remove();
	}
}

export function getPageFromElement(
	element: HTMLElement,
	readingDirection: Orientation,
	pageSize: number
) {
	const elementScroll = readingDirection === 'horizontal' ? element.offsetLeft : element.offsetTop;
	const scroll = getScrollAlignedToPageFloor(elementScroll, pageSize);
	return getPageFromScroll(scroll, pageSize);
}

export function calculateTocPageNumbers(
	containerElement: HTMLDivElement,
	readingDirection: Orientation,
	pageSize: number,
	tocData: NavPoint[]
) {
	for (const toc of tocData) {
		const selector = createSelectorFromEpubUri(toc.content);
		const el = containerElement.querySelector<HTMLElement>(selector);
		if (!el) return;

		toc.page = getPageFromElement(el, readingDirection, pageSize);

		calculateTocPageNumbers(containerElement, readingDirection, pageSize, toc.children);
	}
}

export function calculateBookmarkPageNumbers(
	bookmarks: Bookmark[],
	readingDirection: Orientation,
	pageSize: number
) {
	for (const bookmark of bookmarks) {
		bookmark.page = getPageFromElement(bookmark.element, readingDirection, pageSize);
	}
}

export function calculateBookmarkChapterPositions(bookmarks: Bookmark[], tocData: NavPoint[]) {
	for (const bookmark of bookmarks) {
		bookmark.chapter = getTocChapterFromPage(bookmark.page ?? 1, tocData, tocData[0].label);
	}
}

function flattenTocData(tocData: NavPoint[]) {
	const sum: NavPoint[] = [];
	function flattenTocDataNested(tocData: NavPoint[]) {
		for (const toc of tocData) {
			sum.push(toc);

			flattenTocDataNested(toc.children);
		}

		return sum;
	}
	return flattenTocDataNested(tocData);
}

export function getTocChapterFromPage(
	page: number,
	tocData: NavPoint[],
	previousChapter: string
): string {
	// TODO Watch for performance issues, since it will flatten each time the function is called
	const newR = flattenTocData(tocData);
	for (const toc of newR) {
		if (!toc.page) return 'TODO';

		if (page < toc.page) {
			return previousChapter;
		}
		previousChapter = toc.label;
	}

	// We're past the last chapter and there are no more chapters, so the page is in that chapter
	return previousChapter;
}
