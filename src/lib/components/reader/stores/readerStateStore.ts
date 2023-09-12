import { writable } from 'svelte/store';

export type ReaderState = 'reading' | 'noteOpen' | 'sidebarOpen';

export const readerStateStore = writable<ReaderState>('reading');
