import type { PageLoad } from './$types';
import { getBooks } from '$lib/bindings';
import { cacheOrRun } from '$lib/cache/cache';

export const load = (async ({ url }) => {
	const data = cacheOrRun(url.toString(), getBooks);

	return {
		streamed: { books: data }
	};
}) satisfies PageLoad;
