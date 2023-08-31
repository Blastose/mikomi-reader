export function smoothScrollTo(scrollTo: number, node: HTMLElement, onFinish?: () => void) {
	const duration = 300;
	function easeOutQuint(t: number) {
		return 1 + --t * t * t * t * t;
	}
	const start = performance.now();
	function scroll(t: number) {
		const elapsed = t - start;
		const progress = Math.min(elapsed / duration, 1);
		const easedProgress = easeOutQuint(progress);

		const currentScrollLeft = node.scrollLeft;
		const currentScrollTop = node.scrollTop;
		const newScrollLeft = currentScrollLeft + easedProgress * (scrollTo - currentScrollLeft);
		const newScrollTop = currentScrollTop + easedProgress * (scrollTo - currentScrollTop);
		node.scrollLeft = newScrollLeft;
		node.scrollTop = newScrollTop;

		if (progress < 1) {
			requestAnimationFrame(scroll);
		} else {
			if (onFinish) onFinish();
		}
	}

	requestAnimationFrame(scroll);
}

export function getSelector(el: Element): string {
	if (el.classList.contains('text-epub')) return 'body';
	const names = [];

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

export function getScrollAlignedToPage(scroll: number, pageSize: number) {
	return Math.floor(scroll / pageSize) * pageSize;
}

export function createSelectorFromEpubUri(uri: string): string {
	// epub://{chapterId}#{hash}
	uri = uri.replace(/^epub:\/\//, '');
	const [chapterId, hash] = uri.split('#');

	const selector = `#${CSS.escape(chapterId)}${hash ? `#${CSS.escape(hash)}` : ''}`;
	return selector;
}

export function getVisibleElementInParentElement(containerElement: HTMLElement) {
	let foundElement: HTMLElement | null = null;
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
	}

	return foundElement;
}
