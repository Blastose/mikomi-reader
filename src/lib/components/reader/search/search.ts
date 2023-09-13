import { writable } from 'svelte/store';

export type SearchHighlight = {
	highlights: { range: Range; rects: DOMRect[]; page: number; highlightedText: string }[];
	showHighlights: boolean;
};

export const searchHighlightsStore = writable<SearchHighlight>({
	highlights: [],
	showHighlights: false
});

function textNodesInElement(el: HTMLElement) {
	const walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);

	let node: Node | null = walk.nextNode();
	const textNodes = [];
	while (node) {
		textNodes.push(node);
		node = walk.nextNode();
	}

	return textNodes as Text[];
}

function escapeRegExp(str: string) {
	return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function getCharactersBeforeAndAfterIndexes(
	str: string,
	startIndex: number,
	endIndex: number,
	charactersBeforeAndAfterIndexes: number
) {
	const newStartIndex = Math.max(startIndex - charactersBeforeAndAfterIndexes, 0);
	const newEndIndex = Math.min(endIndex + charactersBeforeAndAfterIndexes, str.length);
	let slice = str.slice(newStartIndex, newEndIndex);

	let superNewStartIndex = startIndex - newStartIndex;

	if (newStartIndex !== 0) {
		slice = `...${slice}`;
		superNewStartIndex += 3;
	}
	if (newEndIndex < str.length) {
		slice = `${slice}...`;
	}

	const superNewEndIndex = superNewStartIndex + endIndex - startIndex;
	return { slice, superNewStartIndex, superNewEndIndex };
}

export function highlightTextInString(text: string, startIndex: number, endIndex: number): string {
	const highlightedText = `<span style="background-color: #bcdaff;">${text.slice(
		startIndex,
		endIndex
	)}</span>`;
	return `${text.substring(0, startIndex)}${highlightedText}${text.substring(endIndex)}`;
}

export type SearchBookResult = { range: Range; trimmedInput: string; highlightedText: string };

export function searchBook(readerNode: HTMLDivElement, searchTerm: string) {
	const textNodes = textNodesInElement(readerNode);

	const ranges: SearchBookResult[] = [];

	const escapedInput = escapeRegExp(searchTerm);

	for (const node of textNodes) {
		const text = node.wholeText;
		const result = text.matchAll(new RegExp(escapedInput, 'gi'));

		const regexMatches = [];
		for (const res of result) {
			if (!res.input || !res.index) continue;

			regexMatches.push({
				input: res.input,
				trimmedInput: getCharactersBeforeAndAfterIndexes(
					res.input,
					res.index,
					res.index + searchTerm.length,
					100
				),
				startIndex: res.index,
				endIndex: res.index + searchTerm.length
			});
		}

		for (const match of regexMatches) {
			const range = new Range();
			range.setStart(node, match.startIndex);
			range.setEnd(node, match.endIndex);

			const highlightedText = highlightTextInString(
				match.trimmedInput.slice,
				match.trimmedInput.superNewStartIndex,
				match.trimmedInput.superNewEndIndex
			);

			ranges.push({ range, trimmedInput: match.trimmedInput.slice, highlightedText });
		}
	}

	return ranges;
}
