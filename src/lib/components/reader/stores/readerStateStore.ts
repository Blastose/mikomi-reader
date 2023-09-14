import { writable } from 'svelte/store';

export type ReaderState = 'reading' | 'noteOpen' | 'sidebarOpen' | 'searchOpen';

export const readerStateStore = writable<ReaderState>('reading');
