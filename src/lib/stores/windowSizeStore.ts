import { writable, type Writable } from 'svelte/store';

export const windowSizeStore: Writable<'large' | 'small'> = writable('large');
