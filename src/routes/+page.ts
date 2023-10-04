import type { PageLoad } from './$types';
import { getBooks } from '$lib/bindings';

export const load = (async () => {
	const data = getBooks();

	return {
		books: data
	};
}) satisfies PageLoad;
