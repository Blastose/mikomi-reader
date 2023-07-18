import type { PageLoad } from './$types';
import type { GetBooks } from '$lib/invoke/types';
import { invoke } from '@tauri-apps/api/tauri';

export const load = (async () => {
	const books: GetBooks = await invoke('get_books');
	return {
		books
	};
}) satisfies PageLoad;
