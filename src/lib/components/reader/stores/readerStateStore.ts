import { writable } from 'svelte/store';

export type ReaderState = 'reading' | 'noteOpen' | 'sidebarOpen' | 'searchOpen' | 'settingsOpen';

export const readerStateStore = writable<ReaderState>('reading');
