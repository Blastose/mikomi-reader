import type { PageLoad } from './$types';
import { getBooks } from '$lib/bindings';
 

export const load = (async () => {
	const books = getBooks();

	return {
		streamed: { books }
	};
}) satisfies PageLoad;
