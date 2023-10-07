import type { PageLoad } from './$types';
import { getBooks } from '$lib/bindings';

export const load = (async () => {
	const data = await getBooks();

	return {
		books: data
	};
}) satisfies PageLoad;
