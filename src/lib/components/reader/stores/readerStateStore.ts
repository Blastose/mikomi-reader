import { writable } from 'svelte/store';

export type ReaderState =
	| 'reading'
	| 'noteOpen'
	| 'sidebarOpen'
	| 'searchOpen'
	| 'settingsOpen'
	| 'imageOpen';

export const readerStateStore = writable<ReaderState>('reading');
