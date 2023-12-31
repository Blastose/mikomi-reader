import { writable } from 'svelte/store';

export type Highlight = {
	id: string;
	note: string;
	displayText: string;
	page: number;
	chapter: string;
	dateAdded: number;
	range: Range;
	color: string;
	rects: DOMRect[];
};

export const highlightsStore = writable<Highlight[]>([]);
