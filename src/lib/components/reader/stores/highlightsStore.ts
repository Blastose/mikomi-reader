import { writable } from 'svelte/store';

export type Highlight = {
	range: Range;
	color: string;
	rects: DOMRectList;
};

export const highlightsStore = writable<Highlight[]>([]);
