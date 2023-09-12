import { addHighlight } from '$lib/bindings';
import { highlightsStore, type Highlight } from '$lib/components/reader/stores/highlightsStore';
import { getSelector, type Orientation } from '$lib/components/reader/utils';

type Rectangle = { x: number; y: number; width: number; height: number };

export function filterCompletelyOverlappingRectangles<T extends Rectangle>(rects: T[]): T[] {
	const filteredRects = [];
	const overlappingIndices: number[] = [];
	for (let i = 0; i < rects.length; i++) {
		let isOverlapping = false;
		for (let j = 0; j < rects.length; j++) {
			if (i === j) continue;
			if (overlappingIndices.includes(i)) continue;
			if (overlappingIndices.includes(j)) continue;
			const rect1 = rects[i];
			const rect2 = rects[j];

			// if rect1 is completely inside rect2, it completely overlaps
			if (
				rect1.x >= rect2.x &&
				rect1.y >= rect2.y &&
				rect1.x + rect1.width <= rect2.x + rect2.width &&
				rect1.y + rect1.height <= rect2.y + rect2.height
			) {
				isOverlapping = true;
				overlappingIndices.push(i);
				break;
			}
		}
		if (!isOverlapping) {
			filteredRects.push(rects[i]);
		}
	}

	return filteredRects;
}

export async function addHighlightToDBAndStore(highlight: Highlight, bookId: string) {
	addHighlight({
		id: highlight.id,
		book_id: bookId,
		color: highlight.color,
		date_added: highlight.dateAdded,
		start_container: getSelector(highlight.range.startContainer as Element | Text),
		start_offset: highlight.range.startOffset,
		end_container: getSelector(highlight.range.endContainer as Element | Text),
		end_offset: highlight.range.endOffset,
		note: highlight.note
	});

	highlightsStore.update((highlights) => {
		highlights.push(highlight);
		return highlights;
	});
}

export function alignRectsToReaderPage<T extends Rectangle>(
	rects: T[],
	orientation: Orientation,
	readerNodeRect: Rectangle,
	pageSize: number,
	currentPage: number
): T[] {
	return rects.map((rect) => {
		if (orientation === 'horizontal') {
			rect.x += pageSize * (currentPage - 1) - readerNodeRect.x;
			rect.y += -readerNodeRect.y;
		} else {
			rect.x += -readerNodeRect.x;
			rect.y += pageSize * (currentPage - 1) - readerNodeRect.y;
		}
		return rect;
	});
}

export function setLeftTopOnScreen(node: HTMLElement, x: number, y: number) {
	if (x + node.offsetWidth > window.innerWidth) {
		x = x - node.offsetWidth;
		if (x < 0) {
			node.style.left = `${window.innerWidth - node.offsetWidth}px`;
		} else {
			node.style.left = `${x}px`;
		}
	} else {
		node.style.left = `${x}px`;
	}
	if (y + node.offsetHeight > window.innerHeight) {
		y = y - node.offsetHeight;
		if (y < 0) {
			node.style.top = `${window.innerHeight - node.offsetHeight}px`;
		} else {
			node.style.top = `${y}px`;
		}
	} else {
		node.style.top = `${y}px`;
	}
}

export const colorButtons = [
	{
		name: 'red',
		color: '#ff000020',
		displayColor: '#ef4444'
	},
	{
		name: 'yellow',
		color: '#fbbc0430',
		displayColor: '#eab308'
	},
	{
		name: 'blue',
		color: '#0000ff20',
		displayColor: '#3b82f6'
	},
	{
		name: 'green',
		color: '#00ff0020',
		displayColor: '#22c55e'
	}
] as const;
