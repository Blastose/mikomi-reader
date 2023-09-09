import { writable } from 'svelte/store';

export type ReaderState = '';

export const readerStateStore = writable<ReaderState>('');
