import { writable } from 'svelte/store';

function setLocalStorageAndDocumentClass(initialTheme: Theme) {
	if (!('theme' in localStorage)) {
		if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
			initialTheme = 'dark';
		} else {
			initialTheme = 'light';
		}
	} else {
		if (localStorage.getItem('theme') === 'dark') {
			initialTheme = 'dark';
		} else if (localStorage.getItem('theme') === 'light') {
			initialTheme = 'light';
		}
	}
	localStorage.setItem('theme', initialTheme);
	if (initialTheme === 'dark') {
		document.documentElement.classList.add('dark');
	} else if (initialTheme === 'light') {
		document.documentElement.classList.remove('dark');
	}
	return initialTheme;
}

function createThemeStore() {
	let initialTheme: Theme = 'light';
	initialTheme = setLocalStorageAndDocumentClass(initialTheme);

	const { subscribe, set, update } = writable(initialTheme);

	return {
		subscribe,
		set: (newTheme: Theme) => {
			if (newTheme === 'dark') {
				document.documentElement.classList.add('dark');
			} else if (newTheme === 'light') {
				document.documentElement.classList.remove('dark');
			}

			localStorage.setItem('theme', newTheme);
			set(newTheme);
		},
		update
	};
}

export type Theme = 'light' | 'dark';

export const themeStore = createThemeStore();
