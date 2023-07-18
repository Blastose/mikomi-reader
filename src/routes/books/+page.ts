import type { PageLoad } from './$types';
import { getBooks } from '$lib/bindings';

export const load = (async () => {
	const books = await getBooks();
	return {
		books
	};
}) satisfies PageLoad;
