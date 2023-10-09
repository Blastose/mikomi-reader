import { writable } from 'svelte/store';

function createMapStore() {
	const { subscribe, update } = writable(new Map<string, string>());

	return {
		subscribe,
		toggle: (id: string) =>
			update((s) => {
				if (s.get(id)) {
					s.delete(id);
				} else {
					s.set(id, id);
				}
				return s;
			}),
		reset: () =>
			update((s) => {
				s.clear();
				return s;
			})
	};
}

export type MainState = 'default' | 'multiselect';
export const mainStateStore = writable<MainState>('default');
export const selectedBookMapStore = createMapStore();
