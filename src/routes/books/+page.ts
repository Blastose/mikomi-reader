import type { PageLoad } from './$types';
import { getBooks } from '$lib/bindings';
import { cacheOrRun } from '$lib/cache/cache';

export const load = (async ({ url }) => {
	const data = await cacheOrRun(url.toString(), getBooks);

	return {
		books: data
	};
}) satisfies PageLoad;
