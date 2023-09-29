import type { NavPoint } from '$lib/components/reader/toc/tocParser';
import { writable, derived } from 'svelte/store';
import { flattenTocData } from '$lib/components/reader/utils';

export const tocStore = writable<NavPoint[]>([]);

export const flatTocStore = derived<typeof tocStore, NavPoint[]>(tocStore, (v) => {
	return flattenTocData(v);
});
